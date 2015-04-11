from django.conf.urls import patterns, url, include
from authentication.views import *

urlpatterns = patterns('',
    url(r'^account/$', UserUpdate.as_view(), name='user_update'),
    url(r'^signup/$', UserSignup.as_view(), name='signup'),
    url(r'^login/$', 'django.contrib.auth.views.login', name='login', kwargs={'template_name':'auth/login.html'}),
    url(r'^logout/$', 'django.contrib.auth.views.logout', name='logout', kwargs={'next_page':'/'}),
)
