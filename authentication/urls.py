from django.conf.urls import patterns, url, include
from authentication.views import *

urlpatterns = patterns('',
    url(r'^account/$', UserUpdate.as_view(), name='user_update'),
    url(r'^signup/$', UserSignup.as_view(), name='signup'),
    url(r'^login/$', 'django.contrib.auth.views.login', name='login', kwargs={'template_name':'auth/login.html'}),
    url(r'^logout/$', 'django.contrib.auth.views.logout', name='logout', kwargs={'next_page':'/'}),

    url(r'^password_reset/$', 'django.contrib.auth.views.password_reset', name='password_reset',
        kwargs={'template_name':'auth/password_reset_form.html'}),
    url(r'^password_reset/done/$', 'django.contrib.auth.views.password_reset_done',
        name='password_reset_done', kwargs={'template_name':'auth/password_reset_done.html'}),
    url(r'^reset/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,20})/$',
        'django.contrib.auth.views.password_reset_confirm', name='password_reset_confirm',
        kwargs={'template_name':'auth/password_reset_confirm.html'}),
    url(r'^reset/done/$', 'django.contrib.auth.views.password_reset_complete', name='password_reset_complete',
        kwargs={'template_name':'auth/password_reset_complete.html'}),
)
