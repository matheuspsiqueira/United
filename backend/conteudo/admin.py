from django.contrib import admin
from django.utils.html import format_html

from .models import Evento, Noticia, UnitedNews


@admin.register(Evento)
class EventoAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'campus', 'data', 'horario', 'valor')
    list_filter = ('campus',)
    ordering = ('data', 'horario')


@admin.register(Noticia)
class NoticiaAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'campus', 'data', 'expira_em')
    list_filter = ('campus',)
    search_fields = ('titulo',)
    date_hierarchy = 'data'


@admin.register(UnitedNews)
class UnitedNewsAdmin(admin.ModelAdmin):
    list_display = ('campus', 'mes_referencia', 'atualizado_em', 'preview_capa')
    readonly_fields = ('atualizado_em', 'preview_capa')

    def preview_capa(self, obj):
        if not obj.capa:
            return '—'
        return format_html(
            '<img src="{}" style="max-width:200px;max-height:120px;border-radius:8px;" />',
            obj.capa.url,
        )
    preview_capa.short_description = 'Capa'

    def has_add_permission(self, request):
        from campus.models import Campus
        campi_sem_news = Campus.objects.exclude(
            id__in=UnitedNews.objects.values_list('campus_id', flat=True)
        )
        return campi_sem_news.exists()