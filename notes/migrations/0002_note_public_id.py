# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import notes.models


class Migration(migrations.Migration):

    dependencies = [
        ('notes', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='note',
            name='public_id',
            field=models.CharField(default=notes.models.generate_hash, max_length=32),
        ),
    ]
