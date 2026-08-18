from django.contrib import admin
from .models import Campus, Pastor, HorarioCulto, RedeSocial


class PastorInline(admin.TabularInline):
    model = Pastor
    extra = 1


class HorarioCultoInline(admin.TabularInline):
    model = HorarioCulto
    extra = 1


class RedeSocialInline(admin.TabularInline):
    model = RedeSocial
    extra = 1


@admin.register(Campus)
class CampusAdmin(admin.ModelAdmin):
    list_display = ('nome', 'regiao', 'ano_fundacao', 'cor_tema', 'titulo_pastoral')
    list_filter = ('regiao',)
    search_fields = ('nome',)
    inlines = [PastorInline, HorarioCultoInline, RedeSocialInline]