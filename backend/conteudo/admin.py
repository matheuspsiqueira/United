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
    list_display = ('campus', 'mes_referencia', 'atualizado_em', 'preview_video')
    readonly_fields = ('atualizado_em', 'preview_video')

    def preview_video(self, obj):
        if not obj.video:
            return '—'
        return format_html(
            '<video src="{}" controls style="max-width:320px;max-height:200px;"></video>',
            obj.video.url,
        )
    preview_video.short_description = 'Prévia'

    def has_add_permission(self, request):
        """
        UnitedNews é OneToOne por campus — se todo campus já tem um registro,
        não faz sentido permitir 'Adicionar'. O responsável deve editar o
        existente pra substituir o vídeo do mês.
        """
        from campus.models import Campus
        campi_sem_news = Campus.objects.exclude(
            id__in=UnitedNews.objects.values_list('campus_id', flat=True)
        )
        return campi_sem_news.exists()