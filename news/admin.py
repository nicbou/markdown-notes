from django.contrib import admin

from news.models import News


class NewsAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'news_date',
    )
    exclude = ('user',)


admin.site.register(News, NewsAdmin)
