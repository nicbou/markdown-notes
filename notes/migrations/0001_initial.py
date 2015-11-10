# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Note',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('deleted', models.BooleanField(default=False)),
                ('title', models.CharField(max_length=255)),
                ('content', models.TextField()),
                ('date_created', models.DateTimeField(auto_now_add=True)),
                ('date_updated', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['-date_updated', 'title'],
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='DummyNote',
            fields=[
                ('note_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='notes.Note')),
            ],
            options={
                'ordering': ['-date_updated', 'title'],
            },
            bases=('notes.note',),
        ),
        migrations.AddField(
            model_name='note',
            name='user',
            field=models.ForeignKey(to=settings.AUTH_USER_MODEL),
            preserve_default=True,
        ),
    ]
