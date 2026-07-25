from django.contrib import admin
from .models import Campus, Pastor, HorarioCulto


class PastorInline(admin.TabularInline):
    model = Pastor
    extra = 1


class HorarioCultoInline(admin.TabularInline):
    model = HorarioCulto
    extra = 1


@admin.register(Campus)
class CampusAdmin(admin.ModelAdmin):
    list_display = ('nome', 'regiao', 'ano_fundacao', 'cor_tema')
    list_filter = ('regiao',)
    search_fields = ('nome',)
    inlines = [PastorInline, HorarioCultoInline]