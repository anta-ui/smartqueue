from django.db import migrations

def create_default_queue_types(apps, schema_editor):
    Organization = apps.get_model('core', 'Organization')
    OrganizationBranch = apps.get_model('core', 'OrganizationBranch')  # Changé ici
    QueueType = apps.get_model('queues', 'QueueType')
    
    # Récupérer ou créer la première organisation
    organization = Organization.objects.first()
    if not organization:
        return  # Ne rien faire s'il n'y a pas d'organisation
    
    # Récupérer ou créer une branche par défaut
    branch, _ = OrganizationBranch.objects.get_or_create(  # Changé ici
        organization=organization,
        defaults={'name': 'Branche principale'}
    )
    
    # Créer les types de files par défaut
    default_types = [
        {
            'name': 'File Standard',
            'category': 'PE',
            'organization': organization,
            'branch': branch
        },
        {
            'name': 'File Véhicules',
            'category': 'VE',
            'organization': organization,
            'branch': branch
        },
        {
            'name': 'File Mixte',
            'category': 'MI',
            'organization': organization,
            'branch': branch
        }
    ]
    
    for type_data in default_types:
        QueueType.objects.get_or_create(
            name=type_data['name'],
            category=type_data['category'],
            organization=type_data['organization'],
            branch=type_data['branch']
        )

def reverse_default_queue_types(apps, schema_editor):
    QueueType = apps.get_model('queues', 'QueueType')
    QueueType.objects.all().delete()

class Migration(migrations.Migration):
    dependencies = [
        ('queues', '0001_initial'),  # Ajustez selon votre dernière migration
        ('core', '0002_branch'),     # Ajustez selon votre dernière migration core
    ]

    operations = [
        migrations.RunPython(
            create_default_queue_types,
            reverse_default_queue_types
        )
    ]