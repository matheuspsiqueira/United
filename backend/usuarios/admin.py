import secrets
import string

from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UsernameField
from django.utils.html import format_html

from .models import Usuario, VoluntarioPerfil, VersiculoFavorito


def gerar_senha_provisoria(tamanho=8):
    alfabeto = string.ascii_uppercase + string.ascii_lowercase + string.digits
    return ''.join(secrets.choice(alfabeto) for _ in range(tamanho))


class UsuarioCreationForm(forms.ModelForm):
    """Form de criação sem campos de senha — ela é gerada automaticamente no save()."""

    class Meta:
        model = Usuario
        fields = ('username', 'nome_completo', 'email', 'campus', 'role')
        field_classes = {'username': UsernameField}

    def save(self, commit=True):
        usuario = super().save(commit=False)
        senha = gerar_senha_provisoria()
        usuario.set_password(senha)
        usuario.senha_temporaria = True
        usuario._senha_gerada = senha
        if commit:
            usuario.save()
        return usuario


@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    add_form = UsuarioCreationForm
    model = Usuario

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'nome_completo', 'email', 'campus', 'role'),
        }),
    )

    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Dados pessoais', {'fields': ('nome_completo', 'email', 'foto_perfil', 'campus', 'role')}),
        ('Status', {'fields': ('senha_temporaria', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Datas', {'fields': ('last_login', 'date_joined')}),
    )

    list_display = ('username', 'nome_completo', 'campus', 'role', 'senha_temporaria', 'is_active')
    list_filter = ('role', 'campus', 'senha_temporaria', 'is_active')
    search_fields = ('username', 'nome_completo', 'email')

    actions = ['resetar_senha_provisoria']

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        senha_gerada = getattr(obj, '_senha_gerada', None)
        if senha_gerada:
            self.message_user(
                request,
                format_html(
                    'Usuário <strong>{}</strong> criado. Senha provisória: <strong>{}</strong> '
                    '(anote agora — essa mensagem não aparece de novo).',
                    obj.username, senha_gerada,
                ),
            )

    def resetar_senha_provisoria(self, request, queryset):
        """Ação em massa: gera uma nova senha provisória pra usuários selecionados
        (útil se a pessoa perdeu a senha antes de trocar)."""
        senhas = []
        for usuario in queryset:
            nova_senha = gerar_senha_provisoria()
            usuario.set_password(nova_senha)
            usuario.senha_temporaria = True
            usuario.save()
            senhas.append(f'{usuario.username}: {nova_senha}')

        self.message_user(request, format_html('<br>'.join(senhas)))
    resetar_senha_provisoria.short_description = 'Gerar nova senha provisória'


@admin.register(VoluntarioPerfil)
class VoluntarioPerfilAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'data_aprovacao')


@admin.register(VersiculoFavorito)
class VersiculoFavoritoAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'verse_id', 'cor')