# Django settings for markdown_notes project.
from django.core.urlresolvers import reverse_lazy
from datetime import date, timedelta
import os

DEBUG = True
TEMPLATE_DEBUG = DEBUG

# Site
SITE_NAME = 'Markdown-Notes'
SITE_DOMAIN = 'MarkdownNotes.com'

# Emails
ADMINS = ()
MANAGERS = ADMINS

EMAIL_HOST = 'smtp.mailgun.org'
EMAIL_HOST_USER = 'postmaster@markdownnotes.com'
EMAIL_HOST_PASSWORD = 'password'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
DEFAULT_FROM_EMAIL = 'noreply@markdownnotes.com'

# Databases
DATABASES = {}

# Locales
TIME_ZONE = 'UTC'
LANGUAGE_CODE = 'en-us'
SITE_ID = 1
USE_I18N = True
USE_L10N = True
USE_TZ = True

# URLs
MEDIA_ROOT = 'files'
MEDIA_URL = 'http://i.markdownnotes.com/'
STATIC_ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'staticfiles')
STATIC_URL = '/static/'
ROOT_URLCONF = 'markdown_notes.urls'
LOGIN_URL = '/app/'
LOGIN_REDIRECT_URL = reverse_lazy('index')
ADMIN_MEDIA_PREFIX = STATIC_URL + 'admin/'

# Amazon S3
DEFAULT_FILE_STORAGE = 'storages.backends.s3boto.S3BotoStorage'
AWS_ACCESS_KEY_ID = 'ABCDEFGHIJ1234567890'
AWS_SECRET_ACCESS_KEY = '1234567890abcdefghij1234567890abcdefghij'
AWS_STORAGE_BUCKET_NAME = 'i.markdownnotes.com'
AWS_QUERYSTRING_AUTH = False  # Removes the signature from the querystring
AWS_S3_FILE_OVERWRITE = False
AWS_MEDIA_URL = 'https://' + AWS_STORAGE_BUCKET_NAME + '.s3.amazonaws.com/'

far_future = date.today() + timedelta(days=365 * 10)
AWS_HEADERS = {
    'Cache-Control': 'max-age=172800',
    'Expires': far_future.strftime('%a, %d %b %Y 20:00:00 GMT'),  # Long term expires headers on images
}

# Tastypie
API_LIMIT_PER_PAGE = 200
TASTYPIE_DATETIME_FORMATTING = 'iso-8601-strict'  # Javascript-parsable date format

# General config
SECRET_KEY = 'secret'
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
ALLOWED_HOSTS = ['markdownnotes.com', '*.markdownnotes.com', 'www.markdownnotes.com']
SESSION_SERIALIZER = 'django.contrib.sessions.serializers.JSONSerializer'
CSRF_COOKIE_NAME = "XSRF-TOKEN"  # For AngularJS compatibility
WSGI_APPLICATION = 'markdown_notes.wsgi.application'
TEST_RUNNER = 'django.test.runner.DiscoverRunner'

INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.admin',
    'storages',
    'tastypie',
    'notes',
    'uploads',
    'compressor',
    'authentication',
    'django_libsass',
)

STATICFILES_DIRS = (
    os.path.join(os.path.dirname(__file__), "../frontend"),
)
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
    'compressor.finders.CompressorFinder',
)
COMPRESS_PRECOMPILERS = (
    ('text/x-scss', 'django_libsass.SassCompiler'),
)

TEMPLATE_DIRS = (
    os.path.join(os.path.dirname(__file__), "../templates"),  # templates dir at the project root
)
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
)

MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'notes.middleware.AngularCSRFRename',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
)

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {
            "level": "INFO",
            "class": "logging.StreamHandler",
        },
        "mail_admins": {
            "level": "ERROR",
            "class": "django.utils.log.AdminEmailHandler",
        }
    },
    "loggers": {
        "": {
            "handlers": ["console", "mail_admins"],
        }
    }
}

try:
    from local_settings import *
except ImportError:
    pass