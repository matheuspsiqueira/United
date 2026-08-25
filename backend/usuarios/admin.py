from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UsernameField
from django.utils import timezone
from django.utils.html import format_html

from departamentos.models import Departamento
from .models import Usuario, VoluntarioPerfil, VersiculoFavorito, CadastroPendente, CadastroVoluntario, PermissaoIndividual, JanelaCandidaturaVoluntario
from .utils import gerar_senha_provisoria


class UsuarioCreationForm(forms.ModelForm):
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


class UsuarioChangeForm(forms.ModelForm):
    departamentos_liderados = forms.ModelMultipleChoiceField(
        queryset=Departamento.objects.order_by('nome'),
        required=False,
        widget=admin.widgets.FilteredSelectMultiple('departamentos liderados', False),
        help_text='Preencher apenas para usuários com papel Líder.',
    )

    class Meta:
        model = Usuario
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance.pk:
            self.fields['departamentos_liderados'].initial = self.instance.departamentos_liderados.all()

    def save(self, commit=True):
        usuario = super().save(commit)
        if usuario.pk:
            usuario.departamentos_liderados.set(self.cleaned_data['departamentos_liderados'])
        return usuario


class VoluntarioPerfilInline(admin.StackedInline):
    model = VoluntarioPerfil
    extra = 0
    max_num = 1
    min_num = 1
    verbose_name = 'Perfil de voluntário'
    verbose_name_plural = 'Perfil de voluntário'
    fields = ('departamento', 'data_aprovacao')

    def get_formset(self, request, obj=None, **kwargs):
        formset = super().get_formset(request, obj, **kwargs)
        formset.form.base_fields['data_aprovacao'].initial = timezone.now().date()
        return formset


@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    add_form = UsuarioCreationForm
    form = UsuarioChangeForm
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
        ('Liderança', {'fields': ('departamentos_liderados',)}),
        ('Status', {'fields': ('senha_temporaria', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Datas', {'fields': ('last_login', 'date_joined')}),
    )

    filter_horizontal = ('groups', 'user_permissions')

    list_display = (
        'username', 'nome_completo', 'campus', 'role',
        'departamento_voluntario', 'senha_temporaria', 'is_active',
    )
    list_filter = ('role', 'campus', 'senha_temporaria', 'is_active')
    search_fields = ('username', 'nome_completo', 'email')

    actions = ['resetar_senha_provisoria']

    def get_form(self, request, obj=None, **kwargs):
        if obj is None:
            return super().get_form(request, obj, **kwargs)
        return super().get_form(request, obj, form=UsuarioChangeForm, **kwargs)

    def get_inlines(self, request, obj):
        if obj and obj.role == 'voluntario':
            return [VoluntarioPerfilInline]
        return []

    def departamento_voluntario(self, obj):
        perfil = getattr(obj, 'voluntarioperfil', None)
        return perfil.departamento if perfil else '—'
    departamento_voluntario.short_description = 'Departamento'

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
    list_display = ('usuario', 'data_aprovacao', 'departamento')
    list_filter = ('departamento',)


@admin.register(VersiculoFavorito)
class VersiculoFavoritoAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'verse_id', 'cor')


@admin.register(CadastroPendente)
class CadastroPendenteAdmin(admin.ModelAdmin):
    list_display = ('nome_completo', 'campus', 'status', 'criado_em')
    list_filter = ('status', 'campus')

@admin.register(CadastroVoluntario)
class CadastroVoluntarioAdmin(admin.ModelAdmin):
    list_display = ('membro', 'departamento_opcao_1', 'status', 'criado_em')
    list_filter = ('status', 'departamento_opcao_1')


@admin.register(PermissaoIndividual)
class PermissaoIndividualAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'acesso_dashboard', 'aprova_membros', 'edita_membros', 'visao_geral_voluntarios')


@admin.register(JanelaCandidaturaVoluntario)
class JanelaCandidaturaVoluntarioAdmin(admin.ModelAdmin):
    list_display = ('aberta', 'atualizado_em')

    def has_add_permission(self, request):
        return not JanelaCandidaturaVoluntario.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False