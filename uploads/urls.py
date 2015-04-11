from django.conf.urls import patterns, url

urlpatterns = patterns('',
    url(r'^image/$', 'uploads.views.upload_image', name='upload_image'),
)