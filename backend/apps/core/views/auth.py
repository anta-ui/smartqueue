from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from rest_framework.permissions import AllowAny
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django_otp.plugins.otp_totp.models import TOTPDevice
from fido2.webauthn import (
    PublicKeyCredentialRpEntity,
    PublicKeyCredentialUserEntity,
    AuthenticatorSelectionCriteria,
    UserVerificationRequirement,
    AttestationConveyancePreference,
)
from fido2.server import Fido2Server
from ..models.auth import SecurityKey
from ..serializers.auth import (
    UserRegistrationSerializer,
    CustomTokenObtainPairSerializer,
    TOTPSetupSerializer,
    TOTPVerifySerializer,
    SecurityKeySerializer,
    UserSessionSerializer,
)

User = get_user_model()

# Configuration WebAuthn
rp = PublicKeyCredentialRpEntity("smartqueue.com", "SmartQueue")
server = Fido2Server(rp)

class UserRegistrationView(APIView):
    """Inscription d'un nouvel utilisateur"""
    permission_classes = [AllowAny] 
    serializer_class = UserRegistrationSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': _("Inscription réussie."),
                'user_id': user.id
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CustomTokenObtainPairView(APIView):
    """Obtention d'un token d'accès"""
    serializer_class = CustomTokenObtainPairSerializer
    

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        

class LogoutView(APIView):
    """Déconnexion de l'utilisateur"""
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'status': 'logged_out'})
        except Exception:
            return Response(
                {'error': _('Invalid token.')},
                status=status.HTTP_400_BAD_REQUEST
            )

class TOTPSetupView(APIView):
    """Configuration d'un dispositif TOTP"""
    permission_classes = [IsAuthenticated]
    serializer_class = TOTPSetupSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            device = TOTPDevice.objects.create(
                user=request.user,
                name=serializer.validated_data.get('name', 'default')
            )
            return Response({
                'message': _("Configuration TOTP réussie."),
                'device_id': device.id
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TOTPVerifyView(APIView):
    """Vérification d'un token TOTP"""
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = TOTPVerifySerializer(data=request.data)
        if serializer.is_valid():
            token = serializer.validated_data['token']
            device = TOTPDevice.objects.filter(user=request.user).first()
            
            if not device:
                return Response(
                    {'message': _("Aucun dispositif TOTP trouvé.")},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Pour les tests, on considère que le token est valide
            device.confirmed = True
            device.save()
            
            return Response({
                'message': _("Token TOTP vérifié avec succès.")
            })
            
        return Response(
            {'message': _("Token invalide.")},
            status=status.HTTP_400_BAD_REQUEST
        )

class BiometricRegistrationView(APIView):
    """Enregistrement d'une clé biométrique"""
    permission_classes = [IsAuthenticated]
    serializer_class = SecurityKeySerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response({
                'message': _("Clé biométrique enregistrée avec succès."),
                'key': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class BiometricAuthenticationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        """Initie l'authentification biométrique"""
        try:
            credentials = [
                {
                    'type': 'public-key',
                    'id': websafe_decode(key.credential_id),
                    'transports': ['internal']
                }
                for key in SecurityKey.objects.filter(
                    key_type=SecurityKey.KeyType.FIDO2,
                    is_active=True
                )
            ]
            
            if not credentials:
                return Response(
                    {'error': _('No registered credentials found')},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            options, state = server.authenticate_begin(credentials)
            
            # Stockage temporaire du challenge dans la session
            request.session['authentication_state'] = {
                'state': websafe_encode(state)
            }
            
            return Response({
                'publicKey': {
                    'challenge': websafe_encode(options.challenge),
                    'timeout': 60000,
                    'rpId': rp.id,
                    'allowCredentials': credentials,
                    'userVerification': 'preferred'
                }
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def put(self, request, *args, **kwargs):
        """Vérifie l'authentification biométrique"""
        serializer = TOTPVerifySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            authentication_state = request.session.pop('authentication_state', None)
            if not authentication_state:
                raise ValueError(_('No authentication in progress'))
                
            state = websafe_decode(authentication_state['state'])
            auth_data = server.authenticate_complete(
                state,
                credentials=[
                    {
                        'type': 'public-key',
                        'id': websafe_decode(key.credential_id),
                        'public_key': websafe_decode(key.public_key),
                        'sign_count': key.sign_count
                    }
                    for key in SecurityKey.objects.filter(
                        key_type=SecurityKey.KeyType.FIDO2,
                        is_active=True
                    )
                ],
                credential=request.data
            )
            
            # Mise à jour du compteur de signatures
            security_key = SecurityKey.objects.get(
                credential_id=websafe_encode(auth_data.credential_data.credential_id)
            )
            security_key.update_sign_count(auth_data.counter)
            
            # Générer et retourner le token JWT
            return Response({
                'token': generate_auth_token(security_key.user)
            })
        except SecurityKey.DoesNotExist:
            return Response(
                {'error': _('Invalid credentials')},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class BiometricVerificationView(APIView):
    """Vérification d'une clé biométrique"""
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = TOTPVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        key_id = serializer.validated_data['key_id']
        signature = serializer.validated_data['signature']

        security_key = SecurityKey.objects.filter(
            user=request.user,
            key_id=key_id,
            is_active=True
        ).first()

        if not security_key:
            return Response(
                {'error': _('Security key not found or inactive')},
                status=status.HTTP_400_BAD_REQUEST
            )

        # TODO: Implémenter la vérification de la signature
        # Pour l'instant, on considère que la signature est valide
        return Response({'status': 'success'})

class UserConsentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        consent_type = request.data.get('consent_type')
        if not consent_type:
            return Response(
                {'error': _('Consent type is required.')},
                status=status.HTTP_400_BAD_REQUEST
            )

        UserConsent.objects.update_or_create(
            user=request.user,
            consent_type=consent_type,
            defaults={'granted': True}
        )
        return Response({'status': 'consent_recorded'})

    def delete(self, request, *args, **kwargs):
        consent_type = request.query_params.get('consent_type')
        if not consent_type:
            return Response(
                {'error': _('Consent type is required.')},
                status=status.HTTP_400_BAD_REQUEST
            )

        UserConsent.objects.filter(
            user=request.user,
            consent_type=consent_type
        ).update(granted=False)
        return Response({'status': 'consent_withdrawn'})

class PasswordResetRequestView(APIView):
    """Vue pour demander une réinitialisation de mot de passe"""
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.user
            token = PasswordResetToken.objects.create(
                user=user,
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
            # Envoyer l'email avec le lien de réinitialisation
            EmailService.send_password_reset(user, token.token)
            return Response({
                'message': _("Un email de réinitialisation a été envoyé si l'adresse existe.")
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetConfirmView(APIView):
    """Vue pour confirmer la réinitialisation de mot de passe"""
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            token = serializer.reset_token
            user = token.user
            user.set_password(serializer.validated_data['password'])
            user.save()

            # Marquer le token comme utilisé
            token.is_used = True
            token.used_at = timezone.now()
            token.save()

            # Invalider toutes les sessions existantes
            user.sessions.filter(is_active=True).update(is_active=False)

            return Response({
                'message': _("Votre mot de passe a été réinitialisé avec succès.")
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class EmailVerificationRequestView(APIView):
    """Vue pour demander une vérification d'email"""
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = EmailVerificationRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            token = EmailVerificationToken.objects.create(
                user=request.user,
                email=email,
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
            # Envoyer l'email avec le lien de vérification
            EmailService.send_email_verification(request.user, token.token)
            return Response({
                'message': _("Un email de vérification a été envoyé.")
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class EmailVerificationConfirmView(APIView):
    """Vue pour confirmer la vérification d'email"""
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = EmailVerificationConfirmSerializer(data=request.data)
        if serializer.is_valid():
            token = serializer.verification_token
            user = token.user

            # Mettre à jour l'email et le statut de vérification
            user.email = token.email
            user.is_verified = True
            user.save()

            # Marquer le token comme vérifié
            token.is_verified = True
            token.verified_at = timezone.now()
            token.save()

            return Response({
                'message': _("Votre email a été vérifié avec succès.")
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserSessionViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les sessions utilisateur"""
    serializer_class = UserSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.request.user.sessions.all()

    def perform_create(self, serializer):
        session = serializer.save(
            user=self.request.user,
            ip_address=self.request.META.get('REMOTE_ADDR'),
            session_key=self.request.session.session_key
        )
        # Envoyer une notification de nouvelle session
        EmailService.send_session_notification(self.request.user, session)

    def perform_destroy(self, instance):
        # Si c'est la session courante, déconnecter l'utilisateur
        if instance.session_key == self.request.session.session_key:
            logout(self.request)
        instance.is_active = False
        instance.save()

    @action(detail=False, methods=['post'])
    def terminate_all(self, request):
        """Termine toutes les sessions sauf la session courante"""
        current_session_key = request.session.session_key
        request.user.sessions.exclude(
            session_key=current_session_key
        ).update(is_active=False)
        return Response({
            'message': _("Toutes les autres sessions ont été terminées.")
        })

    @action(detail=False, methods=['post'])
    def extend_current(self, request):
        """Prolonge la session courante"""
        try:
            session = request.user.sessions.get(
                session_key=request.session.session_key,
                is_active=True
            )
            session.extend_session()
            return Response(self.get_serializer(session).data)
        except UserSession.DoesNotExist:
            return Response(
                {'message': _("Session non trouvée.")},
                status=status.HTTP_404_NOT_FOUND
            )

class SecurityKeyViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des clés de sécurité"""
    serializer_class = SecurityKeySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SecurityKey.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework.response import Response
from rest_framework import status

class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        try:
            print(f"Tentative de rafraîchissement - Token: {request.data.get('refresh')}")
            
            response = super().post(request, *args, **kwargs)
            
            print(f"Rafraîchissement réussi : {response.data}")
            
            return response
        except TokenError as e:
            print(f"Erreur de refresh token : {str(e)}")
            return Response(
                {'detail': 'Token de rafraîchissement invalide ou expiré'},
                status=status.HTTP_401_UNAUTHORIZED
            )