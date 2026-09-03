from django import forms

from ugroups.models import UGroup, UGroupMembro
from usuarios.models import Usuario


class UGroupForm(forms.ModelForm):
    class Meta:
        model = UGroup
        fields = ['campus', 'nome', 'endereco', 'dia_semana', 'horario', 'observacao', 'pastor_apoio']
        widgets = {
            'horario': forms.TimeInput(attrs={'type': 'time'}),
        }


class UGroupLiderAdicionarForm(forms.Form):
    lider = forms.ModelChoiceField(queryset=Usuario.objects.none(), label='Líder')

    def __init__(self, *args, ugroup, **kwargs):
        super().__init__(*args, **kwargs)
        self.ugroup = ugroup
        ja_lideram = ugroup.lideres.values_list('id', flat=True)
        self.fields['lider'].queryset = Usuario.objects.filter(
            campus=ugroup.campus, role='lider'
        ).exclude(id__in=ja_lideram).order_by('first_name')

    def save(self):
        self.ugroup.lideres.add(self.cleaned_data['lider'])


class UGroupMembroAdicionarForm(forms.Form):
    usuario = forms.ModelChoiceField(queryset=Usuario.objects.none(), label='Usuário')

    def __init__(self, *args, ugroup, **kwargs):
        super().__init__(*args, **kwargs)
        self.ugroup = ugroup
        ja_cadastrados = ugroup.membros.values_list('usuario_id', flat=True)
        self.fields['usuario'].queryset = Usuario.objects.filter(
            campus=ugroup.campus
        ).exclude(id__in=ja_cadastrados).order_by('first_name')

    def save(self):
        return UGroupMembro.objects.create(ugroup=self.ugroup, usuario=self.cleaned_data['usuario'])


class UGroupFrequenciaDataForm(forms.Form):
    data = forms.DateField(widget=forms.DateInput(attrs={'type': 'date'}))