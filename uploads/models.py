from cStringIO import StringIO
from django.core.files.uploadedfile import SimpleUploadedFile
from django.db import models
from notes.models import Note
from PIL import Image as PILImage
import os
import urllib2 as urllib

# Create your models here.
class Image(models.Model):
    note = models.ForeignKey(Note)
    image = models.ImageField(upload_to='/')

    def save(self, *args, **kwargs):
        max_size = 900  # Don't exceed 900x900

        if not self.id and not self.image:
            return

        super(Image, self).save(*args, **kwargs)

        #Open the original photo
        img_file = urllib.urlopen(self.image.url)
        im = StringIO(img_file.read())
        img = PILImage.open(im)


        #Resize the image if necessary
        width = img.size[0]
        height = img.size[1]
        ratio = 1.0
        if width > height and width > max_size:
            ratio = float(max_size)/float(width)
        elif height > width and height > max_size:
            ratio = float(max_size)/float(height)

        new_size = (int(width*ratio), int(height*ratio))
        if new_size != img.size:
            #Convert to RGB if needed
            if img.mode not in ('L', 'RGB'):
                img = img.convert('RGB')

            #Resize
            img.thumbnail(new_size, PILImage.ANTIALIAS)

            #Save the image
            temp_handle = StringIO()
            img.save(temp_handle, 'jpeg')
            temp_handle.seek(0)

            #Update the model's ImageField
            suf = SimpleUploadedFile(os.path.split(self.image.name)[-1].split('.')[0], temp_handle.read(), content_type='image/jpeg')
            self.image.save('%s.jpg' % suf.name, suf, save=True)