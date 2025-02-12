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
│   ├── billing/        # Application de facturation
│   │   ├── models.py   # Modèles de facturation
│   │   └── services.py # Services de paiement
│   ├── geolocation/     # Application de géolocalisation
│   │   ├── models.py    # Modèles géospatiaux
│   │   └── services.py  # Services de localisation
│   ├── iot/            # Application IoT
│   │   ├── models.py   # Modèles pour les appareils IoT
│   │   └── readers.py  # Lecteurs de données IoT
│   ├── mobile/          # Application mobile
│   │   ├── models.py    # Modèles pour les appareils et sessions mobiles
│   │   ├── views.py     # API mobile
│   │   └── offline.py   # Gestion du mode hors ligne
│   ├── notifications/  # Application de notifications
│   │   ├── models.py   # Modèles de notification
│   │   └── services.py # Services de notification
│   ├── queues/         # Application de gestion des files d'attente
│   │   ├── models.py   # Modèles des files d'attente
│   │   └── apps.py     # Configuration de l'application
│   ├── config/        # Configuration du projet
│   │   ├── settings/  # Paramètres par environnement
│   │   │   ├── base.py    # Configuration de base
│   │   │   ├── local.py   # Configuration locale
│   │   │   └── prod.py    # Configuration production
│   │   └── urls.py    # URLs principales
│   └── smartqueue/    # Configuration principale
       ├── settings.py # Paramètres du projet
       ├── urls.py     # Configuration des URLs
       ├── schema.py   # Schéma GraphQL principal
       ├── asgi.py     # Configuration ASGI
       └── wsgi.py     # Configuration WSGI
```

## Architecture du Projet

### 1. Applications Django

#### 1.1 Core (apps.core)
- Gestion des utilisateurs et authentification
- Modèles de base (User, Organization, OrganizationBranch)
- Système de notifications
- WebSocket consumers de base
- Tâches Celery
- Gestion des paramètres d'organisation
- Système de support et tickets
- Journal d'audit et sécurité

#### 1.2 Mobile (apps.mobile)
- Gestion des appareils mobiles
- Sessions mobiles et authentification
- Préférences d'application
- Mode hors ligne et synchronisation
- Retours utilisateurs

#### 1.3 Geolocation (apps.geolocation)
- Suivi de position utilisateur
- Zones de géofencing
- Services basés sur la localisation
- Alertes de proximité
- Événements géospatiaux

#### 1.4 IoT (apps.iot)
- Gestion des appareils IoT
- Affichages intelligents
- Lecture de données d'appareils
- Métriques environnementales
- Marqueurs AR pour IoT

#### 1.5 Queues (apps.queues)
- Gestion des files d'attente
- Types de files d'attente
- Points de service
- Tickets et catégories de véhicules
- Notifications de file d'attente
- Analyses de file d'attente

#### 1.6 Analytics (apps.analytics)
- Métriques de file d'attente
- Performance des agents
- Retours clients
- Rapports et tableaux de bord
- Analyses prédictives

#### 1.7 AR (apps.ar)
- Marqueurs AR
- Contenu AR
- Chemins de navigation
- Gestion des lieux
- Intégration IoT-AR

#### 1.8 Billing (apps.billing)
- Plans d'abonnement
- Gestion des abonnements
- Facturation et paiements
- Contacts de facturation
- Intégration avec les passerelles de paiement

#### 1.9 Notifications (apps.notifications)
- Modèles de notification
- Canaux de notification
- Préférences de notification
- Gestion des lots de notifications
- Notifications push mobiles

### 2. Technologies Utilisées

#### 2.1 Base de Données et Cache
- PostgreSQL avec PostGIS pour le stockage principal
- Redis pour le cache et les files de messages
- GDAL pour le traitement géospatial
- Stratégies de cache :
  - Cache par page
  - Cache de fragments
  - Cache de requêtes
  - Cache de session

#### 2.2 Communication en Temps Réel
- Django Channels pour WebSocket
- Daphne comme serveur ASGI
- Redis comme backend pour les channels
- Notifications push pour mobile

#### 2.3 Tâches Asynchrones
- Celery pour les tâches en arrière-plan
- Redis comme broker de messages
- Tâches périodiques pour les analyses
- Synchronisation des données hors ligne

#### 2.4 GraphQL
- Graphene-Django pour l'API GraphQL
- DataLoader pour l'optimisation des requêtes
- Subscriptions GraphQL via WebSocket
- Cache GraphQL

#### 2.5 Géospatial
- PostGIS pour le stockage géospatial
- GDAL pour le traitement des données
- GeoDjango pour les modèles spatiaux
- Services de géocodage

#### 2.6 Internationalisation
- Django i18n pour les traductions
- Support multilingue (FR, EN, AR)
- Détection automatique de la langue
- Formats régionaux

#### 2.7 Média et Stockage
- Django Storage pour la gestion des fichiers
- Support S3 pour le stockage cloud
- Traitement d'images avec Pillow
- Streaming média avec django-storages

#### 2.8 Sécurité
- JWT pour l'authentification
- Support biométrique via API native
- Rate limiting et throttling
- Protection CSRF et XSS
- Journal d'audit
- Clés de sécurité

## Configuration et Installation

Voir le fichier [backend-dev-deps.md](backend-dev-deps.md) pour la liste complète des dépendances système et leur installation.

### 1. Configuration de l'Environnement
```bash
# Création et activation de l'environnement virtuel
python -m venv venv
source venv/bin/activate

# Installation des dépendances Python
pip install -r requirements.txt
```

### 2. Variables d'Environnement
```bash
# .env
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=postgres://smartqueue:smartqueue@localhost:5432/smartqueue
REDIS_URL=redis://localhost:6379/0
GDAL_LIBRARY_PATH=/usr/lib/libgdal.so
GEOS_LIBRARY_PATH=/usr/lib/libgeos_c.so
```

### 3. Initialisation de la Base de Données
```bash
# Création des migrations
python manage.py makemigrations

# Application des migrations
python manage.py migrate

# Création d'un superutilisateur
python manage.py createsuperuser
```

## Développement

### 1. Modèles Mobiles

```python
# apps/mobile/models.py
class MobileDevice(models.Model):
    user = models.ForeignKey('core.User', on_delete=models.CASCADE)
    device_id = models.CharField(max_length=255, unique=True)
    platform = models.CharField(max_length=20)
    push_token = models.CharField(max_length=255, null=True)
    last_seen = models.DateTimeField(auto_now=True)

class AppPreference(models.Model):
    user = models.ForeignKey('core.User', on_delete=models.CASCADE)
    language = models.CharField(max_length=10)
    notifications_enabled = models.BooleanField(default=True)
    location_tracking = models.BooleanField(default=True)

class OfflineData(models.Model):
    device = models.ForeignKey(MobileDevice, on_delete=models.CASCADE)
    data_type = models.CharField(max_length=50)
    data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    synced_at = models.DateTimeField(null=True)
```

### 2. Services de Géolocalisation

```python
# apps/geolocation/services.py
class GeofencingService:
    def check_zone_entry(self, user_location, zone):
        point = Point(user_location.longitude, user_location.latitude)
        return zone.polygon.contains(point)

    def process_location_update(self, user, location):
        zones = GeofencingZone.objects.filter(
            polygon__contains=Point(location.longitude, location.latitude)
        )
        for zone in zones:
            self.trigger_zone_events(user, zone)
```

### 3. Notifications

```python
# apps/notifications/services.py
class NotificationService:
    def send_push_notification(self, user, title, body, data=None):
        devices = MobileDevice.objects.filter(
            user=user,
            push_token__isnull=False
        )
        for device in devices:
            self._send_to_device(device.push_token, title, body, data)

    def create_notification_batch(self, template, users, context):
        batch = NotificationBatch.objects.create(
            template=template,
            context=context
        )
        notifications = [
            Notification(
                batch=batch,
                user=user,
                channel=user.preferred_channel
            )
            for user in users
        ]
        Notification.objects.bulk_create(notifications)
        return batch
```
