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
