# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
from notes.models import generate_hash


def update_public_ids(apps, schema_editor):
    # Update from a 32 character integer string to a 8 character base 36 string
    Note = apps.get_model("notes", "Note")
    for note in Note.objects.all():
        note.public_id = generate_hash();
        note.save()

class Migration(migrations.Migration):

    dependencies = [
        ('notes', '0003_auto_20151019_1552'),
    ]

    operations = [
    	migrations.RunPython(update_public_ids),
    ]
