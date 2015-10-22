from authentication.views import LoginRequiredViewMixin
from django.views.generic import TemplateView


class NotesView(TemplateView):
    template_name = "notes/app.html"