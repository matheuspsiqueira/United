from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import Usuario, VoluntarioPerfil, VersiculoFavorito


class VoluntarioPerfilInline(admin.StackedInline):
    model = VoluntarioPerfil
    extra = 0
    can_delete = True


@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    list_display = ('username', 'nome_completo', 'campus', 'role', 'senha_temporaria', 'is_active')
    list_filter = ('role', 'campus', 'senha_temporaria')
    search_fields = ('username', 'nome_completo')
    inlines = [VoluntarioPerfilInline]

    fieldsets = UserAdmin.fieldsets + (
        ('Dados United', {
            'fields': ('nome_completo', 'campus', 'foto_perfil', 'senha_temporaria', 'role'),
        }),
    )


@admin.register(VersiculoFavorito)
class VersiculoFavoritoAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'verse_id', 'cor')
    list_filter = ('cor',)
    search_fields = ('usuario__username', 'verse_id')