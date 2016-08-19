from django.conf.urls import url
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password

from tastypie.authentication import (
    Authentication, ApiKeyAuthentication,
    MultiAuthentication)
from tastypie.authentication import BasicAuthentication as _BasicAuthentication
from tastypie.authorization import Authorization
from tastypie.resources import ModelResource
from tastypie.utils import trailing_slash

from .exceptions import CustomBadRequest


class BasicAuthentication(_BasicAuthentication):
    """
    Customized Tastypie BasicAuthentication which returns HTTP 403 code for unauthorized requests.
    For more: https://github.com/django-tastypie/django-tastypie/issues/117
    """
    def _unauthorized(self):
        response = super(BasicAuthentication, self)._unauthorized()
        response.status_code = 403
        return response


class CreateUserResource(ModelResource):
    class Meta:
        allowed_methods = ['post']
        detail_allowed_methods = []
        always_return_data = True
        include_resource_uri = False

        authentication = Authentication()
        authorization = Authorization()

        queryset = User.objects.all().select_related("api_key")
        resource_name = 'create_user'
        fields = ['email', 'username', 'api_key']

    def obj_create(self, bundle, **kwargs):
        REQUIRED_USER_FIELDS = ("username", "email", "password")
        for field in REQUIRED_USER_FIELDS:
            if field not in bundle.data:
                raise CustomBadRequest(
                    code="missing_key",
                    message="Must provide {missing_key} when creating a user."
                        .format(missing_key=field))

        try:
            email = bundle.data["email"]
            username = bundle.data["username"]

            if User.objects.filter(email=email):
                raise CustomBadRequest(
                    code="duplicate_exception",
                    message="That email is already used.")

            if User.objects.filter(username=username):
                raise CustomBadRequest(
                    code="duplicate_exception",
                    message="That username is already used.")

        except KeyError as missing_key:
            raise CustomBadRequest(
                code="missing_key",
                message="Must provide {missing_key} when creating a user."
                    .format(missing_key=missing_key))
        except User.DoesNotExist:
            pass

        raw_password = bundle.data.pop('password')
        kwargs["password"] = make_password(raw_password)

        return super(CreateUserResource, self).obj_create(bundle, **kwargs)

    def dehydrate(self, bundle):
        bundle.data['api_key'] = bundle.obj.api_key.key

        return bundle


class UserResource(ModelResource):
    """
    Get and update user profile, also serves as login route for retrieving the ApiKey.
    """

    class Meta:
        # For authentication, allow both basic and api key so that the key
        # can be grabbed, if needed.
        authentication = MultiAuthentication(
            BasicAuthentication(),
            ApiKeyAuthentication())
        authorization = Authorization()

        list_allowed_methods = []
        detail_allowed_methods = ['get', 'patch']
        always_return_data = True
        include_resource_uri = False

        queryset = User.objects.all().select_related("api_key")
        fields = ['email', 'username', 'api_key']

    def prepend_urls(self):
        return [
            url(r"^(?P<resource_name>%s)%s$" % (self._meta.resource_name, trailing_slash()),
                self.wrap_view('current_user_redirect'), name="api_current_user_redirect"),
        ]

    def current_user_redirect(self, request, **kwargs):
        """
        Special view which enables to override the root route "/" for accessing the
        data of currently authenticated user.
        :param request:
        :param kwargs:
        :return:
        """
        self.method_check(request, allowed=['get', 'patch'])
        self.is_authenticated(request)

        user = getattr(request, 'user', None)
        if user and not user.is_anonymous():
            return self.dispatch_detail(request, pk=str(request.user.id))

    def update_in_place(self, request, original_bundle, new_data):
        """
        Validation for duplicates of username and email through PATCH requests.
        :param request:
        :param original_bundle:
        :param new_data:
        :return:
        """
        try:
            email = new_data["email"]
            if User.objects.filter(email=email):
                raise CustomBadRequest(
                    code="duplicate_exception",
                    message="That email is already used.")
        except KeyError:
            pass
        except User.DoesNotExist:
            pass

        try:
            username = new_data["username"]
            if User.objects.filter(username=username):
                raise CustomBadRequest(
                    code="duplicate_exception",
                    message="That username is already used.")
        except KeyError:
            pass
        except User.DoesNotExist:
            pass

        return super(UserResource, self).update_in_place(request, original_bundle, new_data)

    def authorized_read_list(self, object_list, bundle):
        return object_list.filter(id=bundle.request.user.id).select_related()

    def hydrate(self, bundle):
        try:
            raw_password = bundle.data.pop('password')
            bundle.obj.set_password(raw_password)
        except KeyError:
            pass

        return bundle

    def dehydrate(self, bundle):
        if bundle.obj.pk == bundle.request.user.pk:
            bundle.data['api_key'] = bundle.obj.api_key.key

        return bundle
