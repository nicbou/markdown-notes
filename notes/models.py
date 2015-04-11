from django.db import models
from django.contrib.auth.models import User
from django.db.models.query import QuerySet

class SoftDeletionQuerySet(QuerySet):
    def delete(self):
        # Bulk delete bypasses individual objects' delete methods.
        return super(SoftDeletionQuerySet, self).update(deleted=True)

    def hard_delete(self):
        return super(SoftDeletionQuerySet, self).delete()

    def active(self):
        return self.filter(deleted=False)

    def deleted(self):
        return self.exclude(deleted=False)

class SoftDeletionManager(models.Manager):
    def __init__(self, *args, **kwargs):
        self.active_only = kwargs.pop('active_only', True)
        super(SoftDeletionManager, self).__init__(*args, **kwargs)

    def get_queryset(self):
        if self.active_only:
            return SoftDeletionQuerySet(self.model).filter(deleted=False)
        return SoftDeletionQuerySet(self.model)

    def hard_delete(self):
        return self.get_queryset().hard_delete()

class SoftDeletionModel(models.Model):
    """
    Abstract model for items that can only be
    """
    deleted = models.BooleanField(default=False)

    objects = SoftDeletionManager()
    all_objects = SoftDeletionManager(active_only=False)

    class Meta:
        abstract = True

    def delete(self):
        self.deleted = True
        self.save()

    def hard_delete(self):
        super(SoftDeletionModel, self).delete()

class Note(SoftDeletionModel):
    """
    Model for individual notes.
    """
    user = models.ForeignKey(User)
    title = models.CharField(max_length=255)
    content = models.TextField()
    date_created = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)

    objects = SoftDeletionManager()

    def __unicode__(self):
        return "%s by %s" % (self.title, self.user)

    class Meta:
        ordering = ['-date_updated', 'title']

class DummyNote(Note):
    """
    Public, read-only notes available to all users in the demo
    """
    objects = SoftDeletionManager()

    class Meta:
        ordering = ['-date_updated', 'title']