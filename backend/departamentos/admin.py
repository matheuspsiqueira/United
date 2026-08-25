from django.contrib import admin

from .models import Departamento


@admin.register(Departamento)
class DepartamentoAdmin(admin.ModelAdmin):
    list_display = (
        'nome', 'tipo', 'total_lideres', 'total_voluntarios',
        'acesso_dashboard', 'visao_geral_voluntarios', 'aprova_membros', 'edita_membros',
    )
    list_filter = ('tipo', 'acesso_dashboard', 'aprova_membros', 'edita_membros')
    filter_horizontal = ('lideres',)

    def total_lideres(self, obj):
        return obj.lideres.count()
    total_lideres.short_description = 'Líderes'

    def total_voluntarios(self, obj):
        return obj.voluntarios.count()
    total_voluntarios.short_description = 'Voluntários'