# Utiliser une image Python officielle
FROM python:3.12-slim

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers nécessaires
COPY requirements.txt /app/

# Installer les dépendances
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copier le reste du code
COPY . /app/

# Exposer le port 8000
EXPOSE 8000

# Commande pour démarrer le serveur Django
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
