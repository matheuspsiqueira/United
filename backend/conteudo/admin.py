from django.contrib import admin
from .models import Evento, Noticia, UnitedNews


@admin.register(Evento)
class EventoAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'campus', 'data')
    list_filter = ('campus',)
    search_fields = ('titulo',)
    date_hierarchy = 'data'


@admin.register(Noticia)
class NoticiaAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'campus', 'data', 'expira_em')
    list_filter = ('campus',)
    search_fields = ('titulo',)
    date_hierarchy = 'data'


@admin.register(UnitedNews)
class UnitedNewsAdmin(admin.ModelAdmin):
    list_display = ('campus', 'mes_referencia', 'atualizado_em')