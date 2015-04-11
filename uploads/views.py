from models import Image
from forms import ImageUploadForm
from django.http import HttpResponse, HttpResponseForbidden
from django.views.generic.base import RedirectView
from django.conf import settings

class S3RedirectView(RedirectView):
    """
    Legacy function. For a time, we piped markdownnotes.com/i/ to
    the Amazon S3 URL. We now use a custom subdomain (i.markdownnotes.com)
    for that. This is just to avoid breaking current image links.
    """
    permanent = True

    def get_redirect_url(self, *args, **kwargs):
        return settings.MEDIA_URL + kwargs['filename']

def upload_image(request):
    """
    Handles image uploads and assigns them to the correct user. Resizes the image before uploading.

    The uploaded image's URL is in the HTTP header (Location)
    """
    if request.method == 'POST':
        form = ImageUploadForm(request.POST, request.FILES)
        if form.is_valid():
            img = Image()
            img.user = request.user
            img.note_id = form.cleaned_data['note']
            img.image = form.cleaned_data['image']
            img.save()

            # Build a response
            response = HttpResponse(status=201)
            response['Location'] = img.image.url.replace(settings.AWS_MEDIA_URL,settings.MEDIA_URL,1)
            return response
        else:
            return HttpResponse(status=400)
    return HttpResponseForbidden()