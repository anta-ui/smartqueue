from django.contrib.auth.models import Group, Permission
from django.db import models


class CoreUserGroup(models.Model):
    """Table de liaison entre User et Group"""
    user = models.ForeignKey('core.User', on_delete=models.CASCADE)
    group = models.ForeignKey(Group, on_delete=models.CASCADE)

    class Meta:
        app_label = 'core'
        db_table = 'core_user_groups'
        unique_together = ['user', 'group']


class CoreUserPermission(models.Model):
    """Table de liaison entre User et Permission"""
    user = models.ForeignKey('core.User', on_delete=models.CASCADE)
    permission = models.ForeignKey(Permission, on_delete=models.CASCADE)

    class Meta:
        app_label = 'core'
        db_table = 'core_user_permissions'
        unique_together = ['user', 'permission']
