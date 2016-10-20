from django.db import models
from django.contrib.auth.models import User


def signals_import():
    """ A note on signals.
    The signals need to be imported early on so that they get registered
    by the application. Putting the signals here makes sure of this since
    the models package gets imported on the application startup.
    """
    from tastypie.models import create_api_key

    models.signals.post_save.connect(create_api_key, sender=User)


signals_import()
