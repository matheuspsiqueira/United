from django import forms
from django.contrib import admin

from usuarios.models import Usuario
from .models import UGroup, UGroupMembro, UGroupEncontro, UGroupPresenca


class UGroupAdminForm(forms.ModelForm):
    class Meta:
        model = UGroup
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        campus_id = self.instance.campus_id or self.data.get('campus') or self.initial.get('campus')
        if campus_id:
            self.fields['lideres'].queryset = Usuario.objects.filter(campus_id=campus_id, role='lider')
        else:
            self.fields['lideres'].queryset = Usuario.objects.filter(role='lider')


class UGroupMembroInline(admin.TabularInline):
    model = UGroupMembro
    extra = 1


@admin.register(UGroup)
class UGroupAdmin(admin.ModelAdmin):
    form = UGroupAdminForm
    list_display = ('nome', 'campus', 'dia_semana', 'horario', 'ativo')
    list_filter = ('campus', 'dia_semana', 'ativo')
    filter_horizontal = ('lideres',)
    inlines = [UGroupMembroInline]


class UGroupPresencaInline(admin.TabularInline):
    model = UGroupPresenca
    extra = 0


@admin.register(UGroupEncontro)
class UGroupEncontroAdmin(admin.ModelAdmin):
    list_display = ('ugroup', 'data', 'registrado_por')
    list_filter = ('ugroup__campus',)
    inlines = [UGroupPresencaInline]


admin.site.register(UGroupMembro)