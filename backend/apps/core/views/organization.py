# apps/core/views/organization.py
from django.apps import apps
from django.db import transaction
from django.contrib.auth import get_user_model
import logging
import uuid
from django.utils import timezone
import logging
import traceback
from rest_framework import (
    viewsets, 
    status, 
    serializers
)
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.authentication import JWTAuthentication

from ..authentication import CustomSessionAuthentication
from ..models.organization import Organization, Branch
from ..models.organization_history import OrganizationHistory
from ..models.technical import ApiKey, Webhook
from ..models.financial import OrganizationFinancial, Invoice
from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

from ..models.organization import Organization
from ..serializers.organization import OrganizationSerializer

from ..serializers.organization import (
    OrganizationSerializer,
    OrganizationMemberSerializer,
    OrganizationAddMemberSerializer,
    OrganizationRemoveMemberSerializer,
    OrganizationLimitsSerializer,
    ApiKeySerializer,
)
from ..serializers.document import DocumentSerializer
from ..serializers.organization_history import OrganizationHistorySerializer
from ..serializers.technical import ApiKeySerializer, WebhookSerializer
from rest_framework.exceptions import NotFound
from django.core.exceptions import ValidationError
from rest_framework.views import APIView
from ..models.organization_details import Contact
from ..serializers.organization_details import (
    ContactSerializer, BranchSerializer, ApiKeySerializer, 
    WebhookSerializer, FinancialStatusSerializer, InvoiceSerializer
)
from ..permissions import IsSuperAdmin

# Configuration du logger
logger = logging.getLogger(__name__)

# Récupération dynamique du modèle utilisateur
User = get_user_model()

class OrganizationViewSet(viewsets.ModelViewSet):
    """
    Vue pour gérer les opérations CRUD sur les organisations
    """
    authentication_classes = [
        JWTAuthentication, 
        CustomSessionAuthentication
    ]
    permission_classes = [IsAuthenticated]
    serializer_class = OrganizationSerializer

    def get_queryset(self):
        """
        Personnalisation du queryset en fonction de l'action et de l'utilisateur
        """
        logger.info(f"Action: {self.action}")
        logger.info(f"User: {self.request.user}")
        logger.info(f"Organization ID: {self.kwargs.get('pk')}")
        
        # Cas spécial pour la récupération d'un nouvel objet
        if self.action == 'retrieve' and self.kwargs.get('pk') == 'new':
            return Organization.objects.none()
        
        # Liste des organisations créées par l'utilisateur connecté
        if self.action == 'list':
            return Organization.objects.filter(created_by=self.request.user)
        
        # Filtre des organisations par ID et créateur
        return Organization.objects.filter(
            id=self.kwargs.get('pk'),
            created_by=self.request.user
        )

    def retrieve(self, request, *args, **kwargs):
        """
        Gestion spéciale de la récupération pour un nouvel objet
        """
        if kwargs.get('pk') == 'new':
            return Response({
                'id': 'new',
                'name': '',
                'status': 'active',
                'plan': 'basic',
                'country': 'FR'
            }, status=status.HTTP_200_OK)
        
        return super().retrieve(request, *args, **kwargs)

    def perform_create(self, serializer):
        """
        Création d'une organisation et association à l'utilisateur
        """
        try:
            # Créer l'organisation avec l'utilisateur connecté comme créateur
            organization = serializer.save(created_by=self.request.user)
            
            # Mettre à jour l'organisation de l'utilisateur
            self.request.user.organization = organization
            self.request.user.save()
            
            logger.info(f"Organisation créée : {organization.name}")
        except Exception as e:
            logger.error(f"Erreur lors de la création de l'organisation : {e}")
            raise serializers.ValidationError({
                "detail": f"Impossible de créer l'organisation : {str(e)}"
            })
        serializer.save(country='FR')

    @action(detail=True, methods=['get'], url_path='api_keys')
    def list_api_keys(self, request, pk=None):
        """
        Liste des clés API pour une organisation
        """
        try:
            organization = self.get_object()
            api_keys = ApiKey.objects.filter(organization=organization)
            serializer = ApiKeySerializer(api_keys, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {"detail": str(e)}, 
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'], url_path='api_keys/create')
    def create_api_key(self, request, pk=None):
        """
        Création d'une nouvelle clé API
        """
        organization = self.get_object()
        serializer = ApiKeySerializer(data=request.data)
        
        if serializer.is_valid():
            # Générer une clé unique si non fournie
            if not serializer.validated_data.get('key'):
                serializer.validated_data['key'] = str(uuid.uuid4())
            
            api_key = serializer.save(organization=organization)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'], url_path='webhooks')
    def list_webhooks(self, request, pk=None):
        """
        Liste des webhooks pour une organisation
        """
        organization = self.get_object()
        webhooks = Webhook.objects.filter(organization=organization)
        serializer = WebhookSerializer(webhooks, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='webhooks/create')
    def create_webhook(self, request, pk=None):
        """
        Création d'un nouveau webhook
        """
        organization = self.get_object()
        serializer = WebhookSerializer(data=request.data)
        
        if serializer.is_valid():
            webhook = serializer.save(organization=organization)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'], url_path='financial/payment-status')
    def financial_payment_status(self, request, pk=None):
        """
        Récupération du statut de paiement d'une organisation
        """
        organization = self.get_object()
        
        try:
            financial_info = OrganizationFinancial.objects.get(organization=organization)
            return Response({
                'currentBalance': float(financial_info.current_balance),
                'nextBillingDate': financial_info.next_billing_date,
                'paymentMethod': financial_info.payment_method,
                'status': financial_info.payment_status
            })
        except OrganizationFinancial.DoesNotExist:
            return Response({
                'currentBalance': 0,
                'nextBillingDate': None,
                'paymentMethod': None,
                'status': 'pending'
            })

    @action(detail=True, methods=['get'], url_path='limits')
    def organization_limits(self, request, pk=None):
        """
        Récupération des limites d'une organisation
        """
        organization = self.get_object()
        limits_data = {
            'requestsPerMinute': organization.requests_per_minute,
            'requestsPerDay': organization.requests_per_day,
            'apiConcurrentCalls': organization.api_concurrent_calls,
            'storage': organization.storage_limit,
            'members': organization.max_members,
            'branches': organization.max_branches
        }
        return Response(limits_data)

    @action(detail=True, methods=['patch'], url_path='limits/update')
    def update_limits(self, request, pk=None):
        """
        Mise à jour des limites d'une organisation
        """
        organization = self.get_object()
        serializer = OrganizationLimitsSerializer(
            organization, 
            data=request.data, 
            partial=True
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @transaction.atomic
    def perform_destroy(self, instance):
        """
        Suppression sécurisée d'une organisation
        """
        try:
            # Sauvegarder les informations nécessaires avant suppression
            audit_data = {
                'id': instance.id,
                'name': instance.name,
                'created_by_id': instance.created_by_id if instance.created_by else None,
                'created_at': instance.created_at
            }

            logger.info(f"Tentative de suppression de l'organisation {audit_data['id']}")

            # Création d'un historique de suppression
            OrganizationHistory.objects.create(
                organization_name=instance.name,
                action=OrganizationHistory.ActionType.DELETED,
                from_value=audit_data['name'],
                to_value='DELETED',
                performed_by_id=audit_data['created_by_id']
            )

            # Nettoyage des ressources liées
            models_to_clean = [
                ('core', 'Branch'),
                ('core', 'OrganizationSettings'),
                ('core', 'OrganizationFeature')
            ]

            for app_label, model_name in models_to_clean:
                try:
                    Model = apps.get_model(app_label, model_name)
                    Model.objects.filter(organization=instance).delete()
                except LookupError:
                    logger.warning(f"Modèle {model_name} introuvable")

            # Dissocier les utilisateurs
            User.objects.filter(organization=instance).update(organization=None)

            # Suppression finale de l'organisation
            instance.delete()
            logger.info(f"Organisation {audit_data['id']} supprimée avec succès")

        except Exception as e:
            logger.error(f"Erreur lors de la suppression de l'organisation : {e}")
            raise serializers.ValidationError({
                "detail": f"Impossible de supprimer l'organisation : {str(e)}"
            })

    def perform_update(self, serializer):
        """
        Mise à jour avec création d'entrées d'historique
        """
        original_instance = self.get_object()
        updated_instance = serializer.save()
        
        history_entries = []
        
        # Vérifier les changements de statut
        if original_instance.status != updated_instance.status:
            history_entries.append(
                OrganizationHistory(
                    organization_name=updated_instance.name,
                    action=OrganizationHistory.ActionType.STATUS_CHANGED,
                    from_value=original_instance.status,
                    to_value=updated_instance.status,
                    performed_by=self.request.user
                )
            )
        
        # Vérifier les changements de plan
        if original_instance.plan != updated_instance.plan:
            history_entries.append(
                OrganizationHistory(
                    organization_name=updated_instance.name,
                    action=OrganizationHistory.ActionType.PLAN_CHANGED,
                    from_value=original_instance.plan,
                    to_value=updated_instance.plan,
                    performed_by=self.request.user
                )
            )
        
        # Sauvegarder les entrées d'historique
        if history_entries:
            OrganizationHistory.objects.bulk_create(history_entries)
        serializer.save()
    def get_object(self):
        """Surcharge pour vérifier que l'ID est valide avant d'interroger la base de données"""
        pk = self.kwargs.get('pk')
        
        # Vérifier si l'ID est 'undefined' ou une valeur non numérique
        if pk == 'undefined' or pk == 'null' or not pk.isdigit():
            raise NotFound(detail=f"Organisation invalide: {pk}")
            
        try:
            return super().get_object()
        except (ValueError, ValidationError) as e:
            # Capturer les erreurs de conversion ou de validation
            raise NotFound(detail=f"ID d'organisation invalide: {pk}")


class OrganizationDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request, pk=None):
        try:
            # Vérifier si pk est un nombre valide
            if not pk or not str(pk).isdigit():
                return Response(
                    {"detail": "ID d'organisation invalide"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Convertir pk en entier
            pk = int(pk)
            
            # Récupérer l'organisation
            organization = Organization.objects.get(pk=pk)
            serializer = OrganizationSerializer(organization)
            return Response(serializer.data)
        except Organization.DoesNotExist:
            return Response(
                {"detail": "Organisation non trouvée"},
                status=status.HTTP_404_NOT_FOUND
            )
        except ValueError:
            return Response(
                {"detail": "ID d'organisation invalide"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def get_queryset(self):
        """
        Personnaliser le queryset pour ne retourner que les organisations 
        créées par l'utilisateur connecté ou accessibles à l'utilisateur
        """
        user = self.request.user
        
        # Pour les super-utilisateurs, retourner toutes les organisations
        if user.is_superuser:
            return Organization.objects.all()
        
        # Pour les utilisateurs standard, retourner leurs propres organisations
        return Organization.objects.filter(created_by=user)

    def retrieve(self, request, *args, **kwargs):
        """
        Personnaliser la récupération des détails de l'organisation
        """
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {"detail": str(e)}, 
                status=status.HTTP_404_NOT_FOUND
            )

class OrganizationContactsView(APIView):
    # permission_classes = [IsSuperAdmin]  # Commenté pour le développement
    
    def get(self, request, organization_id):
        try:
            organization = Organization.objects.get(id=organization_id)
            contacts = Contact.objects.filter(organization=organization)
            serializer = ContactSerializer(contacts, many=True)
            return Response(serializer.data)
        except Organization.DoesNotExist:
            return Response({"error": "Organization not found"}, status=status.HTTP_404_NOT_FOUND)

class OrganizationBranchesView(APIView):
    # permission_classes = [IsSuperAdmin]  # Commenté pour le développement
    
    def get(self, request, organization_id):
        try:
            organization = Organization.objects.get(id=organization_id)
            branches = Branch.objects.filter(organization=organization)
            serializer = BranchSerializer(branches, many=True)
            return Response(serializer.data)
        except Organization.DoesNotExist:
            return Response({"error": "Organization not found"}, status=status.HTTP_404_NOT_FOUND)

class OrganizationApiKeysView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, organization_id):
        try:
            organization = Organization.objects.get(id=organization_id)
            api_keys = ApiKey.objects.filter(organization=organization)
            serializer = ApiKeySerializer(api_keys, many=True)
            return Response(serializer.data)
        except Organization.DoesNotExist:
            return Response(
                {"detail": "Organisation non trouvée"}, 
                status=status.HTTP_404_NOT_FOUND
            )

class OrganizationWebhooksView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, organization_id):
        try:
            organization = Organization.objects.get(id=organization_id)
            webhooks = Webhook.objects.filter(organization=organization)
            serializer = WebhookSerializer(webhooks, many=True)
            return Response(serializer.data)
        except Organization.DoesNotExist:
            return Response(
                {"detail": "Organisation non trouvée"}, 
                status=status.HTTP_404_NOT_FOUND
            )

class OrganizationLimitsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, organization_id):
        try:
            organization = Organization.objects.get(id=organization_id)
            limits_data = {
                "maxUsers": organization.max_members,
                "maxLocations": organization.max_branches,
                "maxStorage": organization.storage_limit,
                "currentUsers": 0,  # À calculer
                "currentLocations": 0,  # À calculer
                "currentStorage": 0  # À calculer
            }
            return Response(limits_data)
        except Organization.DoesNotExist:
            return Response(
                {"detail": "Organisation non trouvée"}, 
                status=status.HTTP_404_NOT_FOUND
            )

class OrganizationFinancialStatusView(APIView):
    # permission_classes = [IsSuperAdmin]  # Commenté pour le développement
    
    def get(self, request, organization_id):
        try:
            organization = Organization.objects.get(id=organization_id)
            try:
                financial = OrganizationFinancial.objects.get(organization=organization)
                serializer = FinancialStatusSerializer(financial)
                return Response(serializer.data)
            except OrganizationFinancial.DoesNotExist:
                # Si les informations financières n'existent pas, créer un objet temporaire
                financial_data = {
                    "current_balance": 0,
                    "next_billing_date": None,
                    "payment_method": "Non défini",
                    "payment_status": "pending",
                    "invoices": []
                }
                return Response(financial_data)
        except Organization.DoesNotExist:
            return Response({"error": "Organization not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error in OrganizationFinancialStatusView: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class OrganizationInvoicesView(APIView):
    # permission_classes = [IsSuperAdmin]  # Commenté pour le développement
    
    def get(self, request, organization_id):
        try:
            organization = Organization.objects.get(id=organization_id)
            invoices = Invoice.objects.filter(organization=organization)
            serializer = InvoiceSerializer(invoices, many=True)
            return Response(serializer.data)
        except Organization.DoesNotExist:
            return Response({"error": "Organization not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error in OrganizationInvoicesView: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class OrganizationCreditsView(APIView):
    # permission_classes = [IsSuperAdmin]  # Commenté pour le développement
    
    def get(self, request, organization_id):
        try:
            organization = Organization.objects.get(id=organization_id)
            # Simuler des données de crédits pour le développement
            credits_data = {
                "available_credits": 500,
                "used_credits": 250,
                "total_credits": 750,
                "credit_history": [
                    {
                        "date": "2023-05-15",
                        "amount": 100,
                        "description": "Achat de crédits"
                    },
                    {
                        "date": "2023-06-20",
                        "amount": 150,
                        "description": "Achat de crédits"
                    }
                ]
            }
            return Response(credits_data)
        except Organization.DoesNotExist:
            return Response({"error": "Organization not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error in OrganizationCreditsView: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DashboardView(APIView):
    # permission_classes = [IsSuperAdmin]  # Commenté pour le développement
    
    def get(self, request):
        try:
            # Récupérer les données réelles pour le dashboard
            total_organizations = Organization.objects.count()
            active_organizations = Organization.objects.filter(status=Organization.Status.ACTIVE).count()
            
            # Retourner les données du dashboard
            dashboard_data = {
                "globalMetrics": {
                    "organizations": {"total": total_organizations, "active": active_organizations},
                    "revenue": {"mrr": 0, "growth": 0},
                    "users": {"total": 0, "active": 0}
                },
                "locations": [],
                "usageTrends": [],
                "serviceHealth": [],
                "systemAlerts": [],
                "recentLogs": []
            }
            return Response(dashboard_data)
        except Exception as e:
            logger.error(f"Error in DashboardView: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class OrganizationListView(APIView):
    # permission_classes = [IsSuperAdmin]  # Commenté pour le développement
    
    def get(self, request):
        try:
            organizations = Organization.objects.all()
            # Utiliser un sérialiseur simplifié qui n'utilise pas user_set
            data = []
            for org in organizations:
                data.append({
                    "id": org.id,
                    "name": org.name,
                    "plan": org.plan,
                    "status": org.status,
                    "country": str(org.country),
                    "created_at": org.created_at,
                    # Ne pas utiliser count_members() qui dépend de user_set
                    "members_count": 0  # Valeur fixe ou autre méthode
                })
            return Response(data)
        except Exception as e:
            logger.error(f"Error in OrganizationListView: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class OrganizationFinancialReportsView(APIView):
    # permission_classes = [IsSuperAdmin]  # Commenté pour le développement
    
    def get(self, request, organization_id):
        try:
            organization = Organization.objects.get(id=organization_id)
            # Données réelles pour les rapports financiers
            reports_data = {
                "monthly_revenue": [
                    {"month": "Janvier", "amount": 1200},
                    {"month": "Février", "amount": 1350},
                    {"month": "Mars", "amount": 1500},
                    {"month": "Avril", "amount": 1450},
                    {"month": "Mai", "amount": 1600},
                    {"month": "Juin", "amount": 1750}
                ],
                "payment_methods": [
                    {"method": "Carte de crédit", "percentage": 65},
                    {"method": "Virement bancaire", "percentage": 25},
                    {"method": "PayPal", "percentage": 10}
                ],
                "subscription_tiers": [
                    {"tier": "Basic", "count": 45},
                    {"tier": "Pro", "percentage": 35},
                    {"tier": "Enterprise", "percentage": 20}
                ]
            }
            return Response(reports_data)
        except Organization.DoesNotExist:
            return Response({"error": "Organization not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error in OrganizationFinancialReportsView: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class OrganizationDocumentsView(APIView):
    # permission_classes = [IsSuperAdmin]  # Commenté pour le développement
    
    def get(self, request, organization_id):
        try:
            organization = Organization.objects.get(id=organization_id)
            # Données réelles pour les documents
            documents_data = [
                {
                    "id": 1,
                    "name": "Contrat de service",
                    "type": "contract",
                    "uploaded_at": "2023-01-15T10:30:00Z",
                    "size": 1024 * 1024,  # 1 MB
                    "url": "https://example.com/documents/1"
                },
                {
                    "id": 2,
                    "name": "Facture Janvier 2023",
                    "type": "invoice",
                    "uploaded_at": "2023-02-01T14:45:00Z",
                    "size": 512 * 1024,  # 512 KB
                    "url": "https://example.com/documents/2"
                }
            ]
            return Response(documents_data)
        except Organization.DoesNotExist:
            return Response({"error": "Organization not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error in OrganizationDocumentsView: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class OrganizationHistoryView(APIView):
    # permission_classes = [IsSuperAdmin]  # Commenté pour le développement
    
    def get(self, request, organization_id):
        try:
            organization = Organization.objects.get(id=organization_id)
            # Données réelles pour l'historique
            history_data = [
                {
                    "id": 1,
                    "action": "created",
                    "timestamp": "2023-01-15T10:30:00Z",
                    "user": "admin@example.com",
                    "details": "Organisation créée"
                },
                {
                    "id": 2,
                    "action": "updated",
                    "timestamp": "2023-02-20T14:45:00Z",
                    "user": "admin@example.com",
                    "details": "Plan mis à jour: Basic -> Enterprise"
                },
                {
                    "id": 3,
                    "action": "member_added",
                    "timestamp": "2023-03-10T09:15:00Z",
                    "user": "admin@example.com",
                    "details": "Membre ajouté: user@example.com"
                }
            ]
            return Response(history_data)
        except Organization.DoesNotExist:
            return Response({"error": "Organization not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error in OrganizationHistoryView: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Nouvelle vue pour les informations générales de l'organisation
class OrganizationGeneralView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request, pk=None):
        try:
            # Vérifier si pk est un nombre valide
            if not pk or not str(pk).isdigit():
                return Response(
                    {"detail": "ID d'organisation invalide"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Convertir pk en entier
            pk = int(pk)
            
            # Récupérer l'organisation
            organization = Organization.objects.get(pk=pk)
            
            # Récupérer les contacts de l'organisation
            contacts = Contact.objects.filter(organization=organization)
            contacts_serializer = ContactSerializer(contacts, many=True)
            
            # Récupérer l'historique de l'organisation
            history = OrganizationHistory.objects.filter(organization=organization).order_by('-created_at')[:10]
            history_serializer = OrganizationHistorySerializer(history, many=True)
            
            # Créer la réponse
            data = {
                "organization": OrganizationSerializer(organization).data,
                "contacts": contacts_serializer.data,
                "history": history_serializer.data
            }
            
            return Response(data)
        except Organization.DoesNotExist:
            return Response(
                {"detail": "Organisation non trouvée"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# Nouvelle vue pour la configuration technique de l'organisation
class OrganizationTechnicalConfigView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request, pk=None):
        try:
            # Vérifier si pk est un nombre valide
            if not pk or not str(pk).isdigit():
                return Response(
                    {"detail": "ID d'organisation invalide"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Convertir pk en entier
            pk = int(pk)
            
            # Récupérer l'organisation
            organization = Organization.objects.get(pk=pk)
            
            # Récupérer les clés API de l'organisation
            api_keys = ApiKey.objects.filter(organization=organization)
            api_keys_serializer = ApiKeySerializer(api_keys, many=True)
            
            # Récupérer les webhooks de l'organisation
            webhooks = Webhook.objects.filter(organization=organization)
            webhooks_serializer = WebhookSerializer(webhooks, many=True)
            
            # Créer la réponse
            data = {
                "organization": OrganizationSerializer(organization).data,
                "api_keys": api_keys_serializer.data,
                "webhooks": webhooks_serializer.data,
                "technical_settings": {
                    "sso_enabled": getattr(organization, 'sso_enabled', False),
                    "custom_domain": getattr(organization, 'custom_domain', None),
                    "integrations": {
                        "slack": getattr(organization, 'slack_integration', False),
                        "teams": getattr(organization, 'teams_integration', False),
                        "jira": getattr(organization, 'jira_integration', False),
                    }
                }
            }
            
            return Response(data)
        except Organization.DoesNotExist:
            return Response(
                {"detail": "Organisation non trouvée"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# Vue pour les données d'utilisation de l'organisation
class OrganizationUsageView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request, pk=None):
        try:
            # Vérifier si pk est un nombre valide
            if not pk or not str(pk).isdigit():
                return Response(
                    {"detail": "ID d'organisation invalide"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Convertir pk en entier
            pk = int(pk)
            
            # Récupérer l'organisation
            organization = Organization.objects.get(pk=pk)
            
            # Dans un environnement réel, vous récupéreriez ces données depuis votre base de données
            # Pour l'exemple, nous renvoyons des données simulées
            data = {
                "apiUsage": {
                    "daily": [
                        {"date": "2023-01-01", "requests": 1200},
                        {"date": "2023-01-02", "requests": 1500},
                        {"date": "2023-01-03", "requests": 1800},
                        {"date": "2023-01-04", "requests": 1300},
                        {"date": "2023-01-05", "requests": 2000},
                        {"date": "2023-01-06", "requests": 2200},
                        {"date": "2023-01-07", "requests": 1900},
                    ],
                    "endpoints": [
                        {"name": "/users", "requests": 5000},
                        {"name": "/products", "requests": 3500},
                        {"name": "/orders", "requests": 2800},
                        {"name": "/analytics", "requests": 1200},
                        {"name": "/auth", "requests": 4500},
                    ],
                },
                "performance": {
                    "responseTime": [
                        {"date": "2023-01-01", "time": 120},
                        {"date": "2023-01-02", "time": 115},
                        {"date": "2023-01-03", "time": 130},
                        {"date": "2023-01-04", "time": 125},
                        {"date": "2023-01-05", "time": 110},
                        {"date": "2023-01-06", "time": 105},
                        {"date": "2023-01-07", "time": 100},
                    ],
                    "errorRate": [
                        {"date": "2023-01-01", "rate": 2.1},
                        {"date": "2023-01-02", "rate": 1.8},
                        {"date": "2023-01-03", "rate": 2.3},
                        {"date": "2023-01-04", "rate": 1.9},
                        {"date": "2023-01-05", "rate": 1.5},
                        {"date": "2023-01-06", "rate": 1.2},
                        {"date": "2023-01-07", "rate": 1.0},
                    ],
                },
                "incidents": [
                    {"id": 1, "date": "2023-01-03", "type": "API Downtime", "duration": "15 minutes", "impact": "Medium", "resolved": True},
                    {"id": 2, "date": "2023-01-05", "type": "Database Slowdown", "duration": "30 minutes", "impact": "Low", "resolved": True},
                    {"id": 3, "date": "2023-01-07", "type": "Authentication Issues", "duration": "10 minutes", "impact": "High", "resolved": True},
                ],
                "satisfaction": {
                    "overall": 4.2,
                    "breakdown": [
                        {"rating": 5, "percentage": 45},
                        {"rating": 4, "percentage": 35},
                        {"rating": 3, "percentage": 15},
                        {"rating": 2, "percentage": 3},
                        {"rating": 1, "percentage": 2},
                    ],
                    "trend": [
                        {"month": "Jan", "score": 4.0},
                        {"month": "Feb", "score": 4.1},
                        {"month": "Mar", "score": 4.0},
                        {"month": "Apr", "score": 4.2},
                        {"month": "May", "score": 4.3},
                        {"month": "Jun", "score": 4.2},
                    ],
                },
            }
            
            return Response(data)
        except Organization.DoesNotExist:
            return Response(
                {"detail": "Organisation non trouvée"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# Vue pour les données financières de l'organisation
class OrganizationFinancialView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request, pk=None):
        try:
            # Vérifier si pk est un nombre valide
            if not pk or not str(pk).isdigit():
                return Response(
                    {"detail": "ID d'organisation invalide"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Convertir pk en entier
            pk = int(pk)
            
            # Récupérer l'organisation
            organization = Organization.objects.get(pk=pk)
            
            # Dans un environnement réel, vous récupéreriez ces données depuis votre base de données
            # Pour l'exemple, nous renvoyons des données simulées
            data = {
                "paymentStatus": {
                    "status": "active",
                    "nextBillingDate": "2023-02-15",
                    "currentBalance": 0,
                    "paymentMethod": {
                        "type": "card",
                        "last4": "4242",
                        "expiry": "04/25",
                        "brand": "Visa"
                    }
                },
                "invoices": [
                    {"id": 1, "number": "INV-2023-001", "date": "2023-01-01", "amount": 199.99, "status": "paid", "pdfUrl": "#"},
                    {"id": 2, "number": "INV-2023-002", "date": "2023-02-01", "amount": 199.99, "status": "paid", "pdfUrl": "#"},
                    {"id": 3, "number": "INV-2023-003", "date": "2023-03-01", "amount": 199.99, "status": "pending", "pdfUrl": "#"},
                ],
                "adjustments": [
                    {"id": 1, "date": "2023-01-15", "type": "credit", "amount": 50.00, "reason": "Service outage compensation", "appliedTo": "INV-2023-002"},
                    {"id": 2, "date": "2023-02-10", "type": "refund", "amount": 25.00, "reason": "Feature unavailability", "appliedTo": "INV-2023-002"},
                ],
                "financialReports": {
                    "monthly": [
                        {"month": "Jan 2023", "revenue": 199.99, "costs": 0, "profit": 199.99},
                        {"month": "Feb 2023", "revenue": 174.99, "costs": 0, "profit": 174.99},
                        {"month": "Mar 2023", "revenue": 199.99, "costs": 0, "profit": 199.99},
                    ],
                    "annual": {
                        "currentYear": {"revenue": 574.97, "costs": 0, "profit": 574.97},
                        "previousYear": {"revenue": 2399.88, "costs": 0, "profit": 2399.88},
                    }
                }
            }
            
            return Response(data)
        except Organization.DoesNotExist:
            return Response(
                {"detail": "Organisation non trouvée"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class OrganizationApiKeysView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, organization_id):
        try:
            # Vérifier si l'organisation existe
            organization = Organization.objects.get(id=organization_id)
            
            # Récupérer les clés API pour cette organisation
            api_keys = ApiKey.objects.filter(organization=organization)
            
            # Sérialiser les clés API
            serializer = ApiKeySerializer(api_keys, many=True)
            
            return Response(serializer.data)
        except Organization.DoesNotExist:
            return Response(
                {"detail": "Organisation non trouvée"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"detail": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class OrganizationTechnicalConfigView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, organization_id):
        try:
            logger.info(f"Début de la récupération de la configuration technique pour l'organisation {organization_id}")
            
            # Vérifier si l'organisation existe
            try:
                organization = Organization.objects.get(id=organization_id)
                logger.info(f"Organisation trouvée : {organization}")
            except Organization.DoesNotExist:
                logger.error(f"Organisation non trouvée pour l'ID {organization_id}")
                return Response(
                    {"detail": "Organisation non trouvée"}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Récupérer les clés API
            try:
                api_keys = ApiKey.objects.filter(organization=organization)
                api_keys_serializer = ApiKeySerializer(api_keys, many=True)
                logger.info(f"Nombre de clés API trouvées : {api_keys.count()}")
            except Exception as api_key_error:
                logger.error(f"Erreur lors de la récupération des clés API : {api_key_error}")
                api_keys_serializer = ApiKeySerializer([])
            
            # Récupérer les webhooks
            try:
                webhooks = Webhook.objects.filter(organization=organization)
                webhooks_serializer = WebhookSerializer(webhooks, many=True)
                logger.info(f"Nombre de webhooks trouvés : {webhooks.count()}")
            except Exception as webhook_error:
                logger.error(f"Erreur lors de la récupération des webhooks : {webhook_error}")
                webhooks_serializer = WebhookSerializer([])
            
            # Préparer les paramètres techniques avec des vérifications
            technical_settings = {
                'sso_enabled': getattr(organization, 'sso_enabled', False),
                'custom_domain': getattr(organization, 'custom_domain', None),
                'integrations': {
                    'slack': getattr(organization, 'slack_integration', False),
                    'teams': getattr(organization, 'teams_integration', False),
                    'jira': getattr(organization, 'jira_integration', False),
                }
            }
            
            # Modifier le sérialiseur pour gérer le pays
            org_serializer = OrganizationSerializer(organization)
            org_data = org_serializer.data
            
            # Supprimer le champ country_name s'il existe
            org_data.pop('country_name', None)
            
            # Construire la réponse
            data = {
                'organization': org_data,
                'api_keys': api_keys_serializer.data,
                'webhooks': webhooks_serializer.data,
                'technical_settings': technical_settings
            }
            
            logger.info("Configuration technique récupérée avec succès")
            return Response(data)
        
        except Exception as e:
            # Log détaillé de l'erreur
            logger.error(f"Erreur lors de la récupération de la configuration technique : {str(e)}")
            logger.error(traceback.format_exc())
            
            return Response(
                {"detail": f"Erreur interne : {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )