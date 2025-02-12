# Guide de Développement ML SmartQueue V2

## Vue d'ensemble

L'application ML fournit des capacités de machine learning à SmartQueue, notamment :
- Prédiction des temps d'attente
- Analyse des sentiments
- Optimisation des files d'attente
- Détection des anomalies

## Architecture

### 1. Structure de l'Application

```bash
backend/apps/ml/
├── models/              # Modèles ML pré-entraînés
├── tests/              # Tests unitaires et d'intégration
│   ├── test_models.py  # Tests des modèles ML
│   ├── test_views.py   # Tests des endpoints API
│   └── test_tasks.py   # Tests des tâches Celery
├── migrations/         # Migrations Django
├── templates/         # Templates pour les rapports
├── __init__.py
├── apps.py           # Configuration de l'application
├── models.py         # Modèles Django
├── serializers.py    # Sérialiseurs REST
├── tasks.py         # Tâches Celery
├── urls.py          # Configuration des URLs
└── views.py         # Vues API REST
```

### 2. Intégration avec SmartQueue

#### 2.1 Base de Données
- Utilisation de PostgreSQL pour stocker les métadonnées des modèles
- Stockage des fichiers de modèles via django-storage
- Cache Redis pour les prédictions fréquentes

#### 2.2 Communication en Temps Réel
- WebSocket pour les mises à jour de prédiction en direct
- Intégration avec le système de notification existant

#### 2.3 Tâches Asynchrones
- Celery pour l'entraînement et la mise à jour des modèles
- Tâches périodiques pour l'évaluation des performances

## Configuration

### 1. Variables d'Environnement
```bash
# .env
ML_MODEL_MAX_SIZE=10485760  # 10MB en bytes
ML_SUPPORTED_FORMATS=pkl,joblib,h5
ML_CACHE_TTL=3600  # 1 heure en secondes
ML_PREDICTION_TIMEOUT=30  # timeout en secondes
```

### 2. Cache
```python
# settings/base.py
CACHES = {
    'ml_predictions': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': f"{env('REDIS_URL')}/1",
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}
```

## Développement

### 1. Modèles Django

```python
# models.py
class MLModel(models.Model):
    TYPES = (
        ('wait_time', 'Prédiction du temps d\'attente'),
        ('sentiment', 'Analyse des sentiments'),
    )
    
    name = models.CharField(max_length=100)
    version = models.CharField(max_length=20)
    model_type = models.CharField(max_length=20, choices=TYPES)
    file = models.FileField(upload_to='ml_models/')
    parameters = models.JSONField(default=dict)
    metrics = models.JSONField(default=dict)
    is_active = models.BooleanField(default=False)
    organization = models.ForeignKey('core.Organization', on_delete=models.CASCADE)
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)

class Prediction(models.Model):
    model = models.ForeignKey(MLModel, on_delete=models.CASCADE)
    user = models.ForeignKey('core.User', on_delete=models.CASCADE)
    queue = models.ForeignKey('queues.Queue', on_delete=models.CASCADE)
    input_data = models.JSONField()
    output_data = models.JSONField()
    confidence = models.FloatField()
    is_correct = models.BooleanField(null=True)
    created = models.DateTimeField(auto_now_add=True)
```

### 2. Tâches Celery

```python
# tasks.py
@shared_task
def train_model(model_id):
    model = MLModel.objects.get(id=model_id)
    # Logique d'entraînement
    notify_admins(f"Modèle {model.name} entraîné avec succès")

@shared_task
def evaluate_model_performance(model_id):
    model = MLModel.objects.get(id=model_id)
    predictions = model.predictions.filter(created__gte=timezone.now() - timedelta(days=7))
    
    metrics = calculate_metrics(predictions)
    model.metrics.update(metrics)
    model.save()
```

### 3. Tests

```python
# tests/test_models.py
class MLModelTest(TestCase):
    def setUp(self):
        self.organization = Organization.objects.create(name="Test Org")
        self.model = MLModel.objects.create(
            name="Test Model",
            version="1.0.0",
            model_type="wait_time",
            organization=self.organization
        )

    def test_model_validation(self):
        with self.assertRaises(ValidationError):
            self.model.file = SimpleUploadedFile("model.txt", b"invalid")
            self.model.full_clean()

# tests/test_views.py
class MLModelAPITest(APITestCase):
    def test_prediction(self):
        response = self.client.post(
            f'/api/ml/models/{self.model.id}/predict/',
            {'input_data': {'queue_id': 1}}
        )
        self.assertEqual(response.status_code, 200)
```

## Sécurité

### 1. Validation des Fichiers
- Vérification des types MIME
- Limite de taille (10MB)
- Scan antivirus des fichiers uploadés

### 2. Permissions
```python
# permissions.py
class MLModelPermission(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user.has_perm('ml.change_mlmodel')
```

## Maintenance

### 1. Monitoring
- Suivi des performances des modèles
- Alertes sur les anomalies
- Logging des prédictions importantes

### 2. Backups
```bash
# Sauvegarde des modèles ML
aws s3 sync /path/to/ml_models s3://backup/ml_models
```

## Bonnes Pratiques

### 1. Versionnement des Modèles
- Utilisation du versionnement sémantique
- Conservation de l'historique des modèles
- Tests A/B des nouvelles versions

### 2. Validation des Prédictions
- Système de feedback utilisateur
- Métriques de qualité
- Seuils de confiance configurables

### 3. Documentation des Modèles
- Description des features
- Métriques de performance
- Limites et cas d'utilisation

## Intégration Continue

### 1. Tests Automatisés
```yaml
# .github/workflows/ml-tests.yml
name: ML Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run ML Tests
        run: python manage.py test apps.ml
```

### 2. Validation des Modèles
- Tests de régression
- Validation des performances
- Vérification de la compatibilité
