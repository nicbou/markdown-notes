from authentication.views import LoginRequiredViewMixin
from django.core.urlresolvers import reverse_lazy
from django.views.generic import TemplateView
from django.views.generic.base import RedirectView


class NotesView(TemplateView):
    template_name = "notes/app.html"


class SharedNoteRedirectView(RedirectView):
    permanent = False
    query_string = False
    pattern_name = 'index'

    def get_redirect_url(self, *args, **kwargs):
        return reverse_lazy('index') + '#/' + kwargs.get('public_id')