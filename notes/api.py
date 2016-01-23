from django.conf.urls import url
from django.core.exceptions import ObjectDoesNotExist
from notes.models import Note, DummyNote
from tastypie.authentication import SessionAuthentication
from tastypie.authorization import Authorization
from tastypie.resources import ModelResource
from tastypie.exceptions import Unauthorized, NotFound
import datetime


class UserNotesAuthorization(Authorization):
    """
    Only allows a user to modify its own notes
    """
    def read_list(self, object_list, bundle):
        # This assumes a ``QuerySet`` from ``ModelResource``.
        return object_list.filter(user=bundle.request.user)

    def read_detail(self, object_list, bundle):
        # Is the requested object owned by the user?
        return bundle.obj.user == bundle.request.user

    def create_list(self, object_list, bundle):
        # Assuming they are auto-assigned to ``user``.
        return object_list

    def create_detail(self, object_list, bundle):
        return bundle.obj.user == bundle.request.user

    def update_list(self, object_list, bundle):
        allowed = []

        # Since they may not all be saved, iterate over them.
        for obj in object_list:
            if obj.user == bundle.request.user:
                allowed.append(obj)

        return allowed

    def update_detail(self, object_list, bundle):
        return bundle.obj.user == bundle.request.user

    def delete_list(self, object_list, bundle):
        raise Unauthorized()

    def delete_detail(self, object_list, bundle):
        return bundle.obj.user == bundle.request.user


class NoteResource(ModelResource):
    class Meta:
        queryset = Note.objects.all()
        resource_name = 'note'

        list_allowed_methods = ['get', 'post', 'put', 'delete']
        authentication = SessionAuthentication()
        authorization = UserNotesAuthorization()
        always_return_data = True

    def get_object_list(self, request):
        return super(NoteResource, self).get_object_list(request).filter(user=request.user, deleted=False)

    def obj_create(self, bundle, **kwargs):
        """
        Assign created notes to the current user
        """
        return super(NoteResource, self).obj_create(bundle, user=bundle.request.user, date_created=datetime.datetime.now())

    def obj_delete(self, bundle, **kwargs):
        """
        A rewrite of obj_delete with support for soft deletion
        """
        if not hasattr(bundle.obj, 'delete'):
            try:
                bundle.obj = self.obj_get(bundle=bundle, **kwargs)
            except ObjectDoesNotExist:
                raise NotFound("A model instance matching the provided arguments could not be found.")

        self.authorized_delete_detail(self.get_object_list(bundle.request), bundle)

        hard_delete = bundle.request.GET.get('trash', '').lower() in ['true', '1']

        if hard_delete:
            bundle.obj.hard_delete()
        else:
            bundle.obj.delete()

    def apply_authorization_limits(self, request, object_list):
        """
        Return the user's notes
        """
        return object_list.filter(user=request.user)

    def alter_detail_data_to_serialize(self, request, bundle):
        """
        Avoid returning the full note data, since we only need a few fields on the client side
        """
        if request.method == 'POST':
            bundle.data = {
                'id': bundle.data['id'],
                'public_id': bundle.data['public_id'],
                'date_updated': bundle.data['date_updated'],
            }
        return bundle


class SharedNotesAuthorization(Authorization):
    """
    Only allows a user to modify its own notes
    """
    def read_list(self, object_list, bundle):
        raise Unauthorized()

    def read_detail(self, object_list, bundle):
        return True

    def create_list(self, object_list, bundle):
        raise Unauthorized()

    def create_detail(self, object_list, bundle):
        raise Unauthorized()

    def update_list(self, object_list, bundle):
        raise Unauthorized()

    def update_detail(self, object_list, bundle):
        raise Unauthorized()

    def delete_list(self, object_list, bundle):
        raise Unauthorized()

    def delete_detail(self, object_list, bundle):
        raise Unauthorized()


class SharedNoteResource(ModelResource):
    """
    Shared notes are accessible by all, but use a public hash instead of an id
    """
    class Meta:
        queryset = Note.objects.all()
        resource_name = 'shared-note'
        list_allowed_methods = ['get', ]
        authorization = SharedNotesAuthorization()

    def prepend_urls(self):
        return [
            url(r"^(?P<resource_name>%s)/(?P<public_id>[a-zA-Z0-9]+)/$" % self._meta.resource_name, self.wrap_view('dispatch_detail'), name="api_dispatch_detail"),
        ]


class DummyNoteResource(ModelResource):
    """
    Dummy notes API. Returns a preset list of notes, doesn't obey save requests
    """
    class Meta:
        queryset = DummyNote.objects.all()
        resource_name = 'note-dummy'

        list_allowed_methods = ['get', ]

    def get_object_list(self, request):
        return super(DummyNoteResource, self).get_object_list(request).filter(deleted=False)
