from django.conf.urls import url
from django.http import HttpResponse
from tastypie.authentication import ApiKeyAuthentication
from tastypie.authorization import Authorization
from tastypie.http import HttpForbidden
from tastypie.resources import ModelResource

from news.models import News


class NewsResource(ModelResource):
    """
    Get and update user profile, also serves as login route for retrieving the ApiKey.
    This resource doesn't have any listing route, the root route /user/ is redirected
    to retrieving the authenticated user's data.
    """

    class Meta:

        authentication = ApiKeyAuthentication()
        authorization = Authorization()

        list_allowed_methods = ['get']
        detail_allowed_methods = ['patch']
        always_return_data = True
        include_resource_uri = False

        queryset = News.objects.all()
        fields = ['id', 'title', 'content', 'news_date']

    def prepend_urls(self):
            return [
                url(r"^(?P<resource_name>%s)/(?P<pk>.*?)/read/$" % self._meta.resource_name,
                    self.wrap_view('mark_news_read'),
                    name="api_mark_news_read"),
            ]

    def get_object_list(self, request):
        return super(NewsResource, self).get_object_list(request).exclude(user=request.user)

    def mark_news_read(self, request, **kwargs):
        """
        Special view which enables to override the root route /user/ for accessing the
        data of currently authenticated user and not the listing of all users.

        :param request:
        :param kwargs:
        :return:
        """
        self.method_check(request, allowed=['patch'])
        self.is_authenticated(request)

        user = getattr(request, 'user', None)
        if not user or user.is_anonymous():
            return HttpForbidden()

        News.objects.get(pk=int(kwargs['pk'])).user.add(user)

        return HttpResponse(status=200)
