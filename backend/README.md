# SmartQueue Backend

Backend du système de gestion de files d'attente intelligent SmartQueue.

## Documentation

- [Guide de développement](docs/backend-dev.md)
- [Dépendances système](docs/backend-dev-deps.md)

## Structure du Projet

```
backend/
├── apps/                  # Applications Django
│   ├── analytics/        # Analytics et métriques
│   ├── ar/              # Réalité augmentée
│   ├── billing/         # Facturation et paiements
│   ├── core/            # Fonctionnalités de base
│   ├── geolocation/     # Services de géolocalisation
│   ├── iot/            # Internet des objets
│   ├── mobile/         # Application mobile
│   ├── notifications/  # Système de notifications
│   └── queues/         # Gestion des files d'attente
├── docs/               # Documentation
├── smartqueue/         # Configuration du projet
└── manage.py          # Script de gestion Django
```

## Installation

1. Installer les dépendances système :
```bash
# Voir docs/backend-dev-deps.md pour la liste complète
sudo apt-get update && sudo apt-get install -y \
    postgresql postgresql-contrib \
    postgresql-14-postgis-3 postgresql-14-postgis-3-scripts \
    gdal-bin libgdal-dev python3-gdal
```

2. Créer et activer l'environnement virtuel :
```bash
python -m venv venv
source venv/bin/activate
```

3. Installer les dépendances Python :
```bash
pip install -r requirements.txt
```

4. Configurer la base de données :
```bash
sudo -u postgres psql -c "CREATE USER postgres WITH PASSWORD 'postgres';"
sudo -u postgres psql -c "CREATE DATABASE smartqueue OWNER smartqueue;"
sudo -u postgres psql -c "ALTER USER postgres CREATEDB;"
sudo -u postgres psql -d smartqueue -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

5. Appliquer les migrations :
```bash
python manage.py migrate
```

6. Créer un superutilisateur :
```bash
python manage.py createsuperuser
```

## Développement

1. Lancer le serveur de développement :
```bash
python manage.py runserver
```

2. Accéder à l'interface d'administration :
- URL : http://localhost:8000/admin/
- Identifiants : ceux du superutilisateur créé à l'étape 6

## Tests

Exécuter les tests :
```bash
python manage.py test
```
