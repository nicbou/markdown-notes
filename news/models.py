from django.contrib.auth.models import User
from django.db import models


class News(models.Model):
    """
    Model for one-time only news.
    """
    user = models.ManyToManyField(User, blank=True)
    title = models.CharField(max_length=255)
    content = models.TextField()
    news_date = models.DateTimeField()


def mark_news_read_for_new_user(sender, **kwargs):
    """
    When new User is created, all News which were published will be
    marked for him as 'read', so he doesn't get avalanche of News.

    :param sender:
    :param kwargs:
    :return:
    """
    if kwargs["created"]:
        user_id = kwargs["instance"].id
        ThroughModel = News.user.through
        ThroughModel.objects.bulk_create([ThroughModel(user_id=user_id, news_id=news_id) for news_id in News.objects.values_list('id', flat=True)])

models.signals.post_save.connect(mark_news_read_for_new_user, sender=User)
