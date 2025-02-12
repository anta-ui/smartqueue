# Guide de Développement Backend SmartQueue V2

## Structure du Projet

```bash
backend/
├── apps/                  # Applications Django principales
│   ├── core/             # Application principale
│   │   ├── consumers.py  # Consumers WebSocket
│   │   ├── models.py     # Modèles de base (User, Organization, etc.)
│   │   ├── notifications.py # Gestion des notifications
│   │   ├── signals.py    # Signaux Django
│   │   ├── schema.py     # Schémas GraphQL
│   │   └── tasks.py      # Tâches Celery
│   ├── analytics/        # Application pour les analytics
│   │   ├── models.py     # Modèles pour les métriques
│   │   ├── tasks.py      # Tâches d'agrégation
│   │   └── views.py      # Endpoints analytics
│   ├── ar/              # Application Réalité Augmentée
│   │   ├── models.py    # Modèles AR
│   │   └── views.py     # Endpoints AR
│   ├── agents/               # Application de gestion des agents
│   │   ├── consumers.py     # WebSocket pour les agents
│   │   ├── models.py        # Modèles liés aux agents
│   │   ├── permissions.py   # Permissions personnalisées
│   │   ├── serializers.py   # Sérialiseurs REST
│   │   ├── signals.py       # Signaux pour les agents
│   │   ├── tests/          # Tests unitaires et d'intégration
│   │   ├── urls.py         # Configuration des URLs
│   │   └── views.py        # Vues API REST
│   ├── queues/              # Application de gestion des files d'attente
│   │   ├── models.py       # Modèles des files d'attente
│   │   └── apps.py         # Configuration de l'application
│   ├── config/             # Configuration du projet
│   │   ├── settings/       # Paramètres par environnement
│   │   │   ├── base.py    # Configuration de base
│   │   │   ├── local.py   # Configuration locale
│   │   │   └── prod.py    # Configuration production
│   │   └── urls.py         # URLs principales
│   ├── locale/             # Fichiers de traduction i18n
│   ├── media/             # Fichiers média uploadés
│   ├── scripts/           # Scripts utilitaires
│   └── smartqueue/        # Configuration principale
│       ├── settings.py    # Paramètres du projet
│       ├── urls.py        # Configuration des URLs
│       ├── schema.py      # Schéma GraphQL principal
│       ├── asgi.py       # Configuration ASGI
│       └── wsgi.py       # Configuration WSGI
```

## Architecture du Projet

### 1. Applications Django

#### 1.1 Core (apps.core)
- Gestion des utilisateurs et authentification
- Modèles de base (User, Organization)
- Système de notifications
- WebSocket consumers de base
- Tâches Celery

#### 1.2 Agents (agents)
- Gestion des agents et de leurs statuts
- Permissions et rôles
- API REST pour les opérations des agents
- WebSocket pour les mises à jour en temps réel
- Tests unitaires et d'intégration

#### 1.3 Queues (queues)
- Gestion des files d'attente
- Modèles pour les tickets et services
- Logique de file d'attente

### 2. Technologies Utilisées

#### 2.1 Base de Données et Cache
- PostgreSQL pour le stockage principal
- Redis pour le cache et les files de messages
- Stratégies de cache :
  - Cache par page
  - Cache de fragments
  - Cache de requêtes
  - Cache de session

#### 2.2 Communication en Temps Réel
- Django Channels pour WebSocket
- Daphne comme serveur ASGI
- Redis comme backend pour les channels

#### 2.3 Tâches Asynchrones
- Celery pour les tâches en arrière-plan
- Redis comme broker de messages

#### 2.4 GraphQL
- Graphene-Django pour l'API GraphQL
- DataLoader pour l'optimisation des requêtes
- Subscriptions GraphQL via WebSocket

#### 2.5 Internationalisation
- Django i18n pour les traductions
- Support multilingue complet
- Détection automatique de la langue

#### 2.6 Média et Stockage
- Django Storage pour la gestion des fichiers
- Support S3 pour le stockage cloud
- Traitement d'images avec Pillow
- Streaming média avec django-storages

#### 2.7 Sécurité
- JWT pour l'authentification
- Support biométrique via API native
- Rate limiting et throttling
- Protection CSRF et XSS

## Configuration et Installation

### 1. Prérequis
```bash
# Installation des dépendances système
sudo apt-get update
sudo apt-get install python3-pip python3-venv postgresql redis-server

# Création de la base de données
sudo -u postgres createdb smartqueue
```

### 2. Configuration de l'Environnement
```bash
# Création et activation de l'environnement virtuel
python -m venv venv
source venv/bin/activate

# Installation des dépendances Python
pip install -r requirements.txt
```

### 3. Variables d'Environnement
```bash
# .env
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=postgres://user:password@localhost:5432/smartqueue
REDIS_URL=redis://localhost:6379/0
```

## Développement

### 1. GraphQL Schema

```python
# smartqueue/schema.py
import graphene
from graphene_django import DjangoObjectType
from apps.core.models import User, Organization

class UserType(DjangoObjectType):
    class Meta:
        model = User
        fields = ('id', 'username', 'organization')

class Query(graphene.ObjectType):
    users = graphene.List(UserType)
    user = graphene.Field(UserType, id=graphene.ID())

    def resolve_users(self, info):
        return User.objects.all()

    def resolve_user(self, info, id):
        return User.objects.get(pk=id)

schema = graphene.Schema(query=Query)
```

### 2. Analytics

```python
# apps/analytics/models.py
class QueueMetrics(models.Model):
    queue = models.ForeignKey('queues.Queue', on_delete=models.CASCADE)
    date = models.DateField()
    average_wait_time = models.DurationField()
    total_customers = models.IntegerField()
    peak_hours = ArrayField(models.TimeField())

# apps/analytics/tasks.py
@shared_task
def aggregate_daily_metrics():
    today = timezone.now().date()
    for queue in Queue.objects.all():
        metrics = calculate_queue_metrics(queue, today)
        QueueMetrics.objects.create(
            queue=queue,
            date=today,
            **metrics
        )
```

### 3. Réalité Augmentée

```python
# apps/ar/models.py
class ARMarker(models.Model):
    location = models.PointField()
    queue = models.ForeignKey('queues.Queue', on_delete=models.CASCADE)
    marker_data = models.JSONField()

# apps/ar/views.py
class ARMarkerViewSet(viewsets.ModelViewSet):
    queryset = ARMarker.objects.all()
    serializer_class = ARMarkerSerializer

    def get_queryset(self):
        location = self.request.query_params.get('location', None)
        if location:
            point = Point(*map(float, location.split(',')))
            return ARMarker.objects.filter(
                location__distance_lte=(point, D(m=100))
            )
        return ARMarker.objects.none()
```

### 4. Cache Configuration

```python
# config/settings/base.py
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': env('REDIS_URL'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            'PARSER_CLASS': 'redis.connection.HiredisParser',
        }
    }
}

# Exemple d'utilisation du cache
@method_decorator(cache_page(60 * 15))
def get_queue_status(self, request, queue_id):
    queue = get_object_or_404(Queue, id=queue_id)
    return Response(QueueSerializer(queue).data)
```

### 5. Biométrie et Sécurité

```python
# apps/core/authentication.py
class BiometricAuthentication(BaseAuthentication):
    def authenticate(self, request):
        bio_token = request.META.get('HTTP_X_BIOMETRIC_TOKEN')
        if not bio_token:
            return None

        try:
            validated_token = validate_biometric_token(bio_token)
            user = User.objects.get(id=validated_token['user_id'])
            return (user, None)
        except InvalidToken:
            return None

# apps/core/views.py
class BiometricRegistrationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        bio_data = request.data.get('biometric_data')
        if not bio_data:
            return Response(
                {'error': 'Biometric data required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            token = register_biometric_data(request.user, bio_data)
            return Response({'token': token})
        except BiometricError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
```

### 6. Internationalisation

```python
# config/settings/base.py
MIDDLEWARE = [
    # ...
    'django.middleware.locale.LocaleMiddleware',
]

LANGUAGES = [
    ('fr', _('French')),
    ('en', _('English')),
    ('ar', _('Arabic')),
]

LOCALE_PATHS = [
    os.path.join(BASE_DIR, 'locale'),
]

# Exemple d'utilisation
from django.utils.translation import gettext as _

class QueueViewSet(viewsets.ModelViewSet):
    def perform_create(self, serializer):
        queue = serializer.save()
        message = _('New queue %(name)s created successfully') % {
            'name': queue.name
        }
        notify_admins(message)
```

### 7. Tests

### 1. Tests Unitaires
```python
# agents/tests/test_models.py
class AgentModelTest(TestCase):
    def setUp(self):
        self.organization = Organization.objects.create(name="Test Org")
        self.agent = User.objects.create_user(
            username="agent1",
            organization=self.organization
        )
```

### 2. Tests d'Intégration
```python
# agents/tests/test_views.py
class AgentAPITest(APITestCase):
    def test_agent_status_update(self):
        response = self.client.patch(
            f'/api/agents/{self.agent.id}/status/',
            {'status': 'available'}
        )
        self.assertEqual(response.status_code, 200)
```

## Déploiement

### 1. Production Settings
```python
# smartqueue/settings/production.py
DEBUG = False
ALLOWED_HOSTS = ['smartqueue.example.com']
SECURE_SSL_REDIRECT = True
```

### 2. Services Systemd
```ini
# /etc/systemd/system/smartqueue-web.service
[Unit]
Description=SmartQueue Web Application
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/smartqueue
ExecStart=/var/www/smartqueue/venv/bin/daphne -b 0.0.0.0 -p 8000 smartqueue.asgi:application
```

## Maintenance

### 1. Backups
```bash
# Script de backup
#!/bin/bash
pg_dump smartqueue > backup_$(date +%Y%m%d).sql
```

### 2. Monitoring
- Utilisation de Sentry pour le suivi des erreurs
- Prometheus et Grafana pour les métriques
- Logging personnalisé pour le débogage

## Sécurité

### 1. Authentification
- JWT pour l'API REST
- Session pour l'interface d'administration
- Authentification WebSocket personnalisée

### 2. Permissions
- Système de rôles (Admin, Agent, Superviseur)
- Permissions granulaires par file d'attente
- Audit trail des actions importantes
