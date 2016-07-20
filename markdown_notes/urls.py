from django.conf import settings
from django.conf.urls import patterns, include, url
from django.conf.urls.static import static
from django.contrib import admin
from django.views.generic import TemplateView
from notes.api import NoteResource, DummyNoteResource, SharedNoteResource, NotebookResource
from authentication.api import *
from notes.views import NotesView, SharedNoteRedirectView
from tastypie.api import Api
from uploads.views import S3RedirectView

# API urls
v1_api = Api(api_name='v1')
v1_api.register(NoteResource())
v1_api.register(NotebookResource())
v1_api.register(DummyNoteResource())
v1_api.register(SharedNoteResource())
v1_api.register(CreateUserResource())
v1_api.register(UserResource())

urlpatterns = patterns('',
    url(r'^api/', include(v1_api.urls)),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^upload/', include('uploads.urls')),
    url(r'^i/(?P<filename>.+)', S3RedirectView.as_view(), name='image'),
    url(r'^$', TemplateView.as_view(template_name="home.html"), name='homepage'),
    url(r'^feedback/$', TemplateView.as_view(template_name="feedback.html"), name='feedback'),

    url(r'^app/$', NotesView.as_view(), name='index'),
    url(r'^\+(?P<public_id>[a-z0-9]+)/$', SharedNoteRedirectView.as_view(), name='shared_note'),
) + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
