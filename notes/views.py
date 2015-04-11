from authentication.views import LoginRequiredViewMixin
from django.views.generic import TemplateView


class NotesView(LoginRequiredViewMixin, TemplateView):
    template_name = "notes/app.html"