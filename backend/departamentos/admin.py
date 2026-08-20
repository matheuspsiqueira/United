from django.contrib import admin

from .models import Departamento


@admin.register(Departamento)
class DepartamentoAdmin(admin.ModelAdmin):
    list_display = ('nome', 'campus', 'acesso_dashboard', 'visao_geral_voluntarios', 'aprova_membros')
    list_filter = ('campus', 'acesso_dashboard', 'aprova_membros')
    filter_horizontal = ('lideres',)