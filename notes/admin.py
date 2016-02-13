from django.contrib import admin
from notes.models import Note, Notebook


class NoteAdmin(admin.ModelAdmin):
    list_display = (
        'user',
        'title',
        'date_created',
        'date_updated',
        'deleted',
    )

    def get_queryset(self, request):
        return Note.all_objects.all()


class NotebookAdmin(admin.ModelAdmin):
    list_display = (
        'user',
        'title',
    )


admin.site.register(Note, NoteAdmin)
admin.site.register(Notebook, NotebookAdmin)
