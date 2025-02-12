# Dépendances Backend SmartQueue

Ce document liste toutes les dépendances système (apt) nécessaires pour faire fonctionner le backend SmartQueue.

## Base de données

```bash
# PostgreSQL et PostGIS
sudo apt-get install -y postgresql postgresql-contrib
sudo apt-get install -y postgresql-14-postgis-3 postgresql-14-postgis-3-scripts
```

## Géospatial

```bash
# GDAL et dépendances
sudo apt-get install -y gdal-bin libgdal-dev python3-gdal
sudo apt-get install -y libgeos-c1v5 libgeos-dev
sudo apt-get install -y proj-bin proj-data
```

## Bibliothèques système

```bash
# Dépendances Python
sudo apt-get install -y python3-dev python3-pip python3-venv

# Dépendances pour Pillow (traitement d'images)
sudo apt-get install -y libjpeg-dev libpng-dev libtiff-dev

# Dépendances pour les formats de données
sudo apt-get install -y libxml2-dev libxslt1-dev
sudo apt-get install -y libffi-dev

# Dépendances pour la compression
sudo apt-get install -y zlib1g-dev liblzma-dev

# Dépendances SSL
sudo apt-get install -y libssl-dev

# Dépendances pour psycopg2 (PostgreSQL)
sudo apt-get install -y libpq-dev

# Dépendances pour les websockets
sudo apt-get install -y libev-dev
```

## Installation en une seule commande

Pour installer toutes les dépendances en une seule commande :

```bash
sudo apt-get update && sudo apt-get install -y \
    postgresql postgresql-contrib \
    postgresql-14-postgis-3 postgresql-14-postgis-3-scripts \
    gdal-bin libgdal-dev python3-gdal \
    libgeos-c1v5 libgeos-dev \
    proj-bin proj-data \
    python3-dev python3-pip python3-venv \
    libjpeg-dev libpng-dev libtiff-dev \
    libxml2-dev libxslt1-dev \
    libffi-dev \
    zlib1g-dev liblzma-dev \
    libssl-dev \
    libpq-dev \
    libev-dev
```

## Configuration post-installation

Après l'installation des paquets, il faut :

1. Créer l'utilisateur et la base de données PostgreSQL :
```bash
sudo -u postgres psql -c "CREATE USER smartqueue WITH PASSWORD 'smartqueue';"
sudo -u postgres psql -c "CREATE DATABASE smartqueue OWNER smartqueue;"
sudo -u postgres psql -c "ALTER USER smartqueue CREATEDB;"
```

2. Activer l'extension PostGIS :
```bash
sudo -u postgres psql -d smartqueue -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

3. Créer les liens symboliques pour GEOS si nécessaire :
```bash
sudo ln -s /usr/lib/x86_64-linux-gnu/libgeos_c.so /usr/lib/libgeos_c.so
sudo ln -s /usr/lib/x86_64-linux-gnu/libgeos.so /usr/lib/libgeos.so
```
