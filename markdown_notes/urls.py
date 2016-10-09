from django.conf import settings
from django.conf.urls import patterns, include, url
from django.conf.urls.static import static
from django.contrib import admin
from django.views.generic import TemplateView

from news.api import NewsResource
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
v1_api.register(NewsResource())
v1_api.register(CreateUserResource())
v1_api.register(UserResource())
v1_api.register(PasswordRecoveryResource())

urlpatterns = patterns('',
    url(r'^api/', include(v1_api.urls)),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^upload/', include('uploads.urls')),
    url(r'^i/(?P<filename>.+)', S3RedirectView.as_view(), name='image'),
    url(r'^$', TemplateView.as_view(template_name="home.html"), name='homepage'),
    url(r'^feedback/$', TemplateView.as_view(template_name="feedback.html"), name='feedback'),

    url(r'^app/$', NotesView.as_view(), name='index'),
    url(r'^\+(?P<public_id>[a-z0-9]+)/$', SharedNoteRedirectView.as_view(), name='shared_note'),

    url(r'^reset/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,20})/$',
        'django.contrib.auth.views.password_reset_confirm', name='password_reset_confirm',
        kwargs={'template_name': 'auth/password_reset_confirm.html'}),
    url(r'^reset/done/$', 'django.contrib.auth.views.password_reset_complete',
        name='password_reset_complete',
        kwargs={'template_name': 'auth/password_reset_complete.html'}),
) + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
