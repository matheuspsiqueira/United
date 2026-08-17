from django.contrib import admin

from .models import Episodio, Serie


class EpisodioInline(admin.TabularInline):
    model = Episodio
    extra = 1


@admin.register(Serie)
class SerieAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'campus', 'data_lancamento', 'quantidade_episodios', 'ativa')
    list_filter = ('campus', 'ativa')
    inlines = [EpisodioInline]