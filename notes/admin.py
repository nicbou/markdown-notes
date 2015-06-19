from django.contrib import admin
from notes.models import Note

class NoteAdmin(admin.ModelAdmin):
    list_display = (
        'user',
        'title',
        'date_created',
        'date_updated',
        'deleted',
    )

admin.site.register(Note, NoteAdmin)