from django import forms

from series.models import Episodio, Serie


class SerieForm(forms.ModelForm):
    class Meta:
        model = Serie
        fields = ('campus', 'titulo', 'descricao', 'capa', 'data_lancamento', 'ativa')
        widgets = {'descricao': forms.Textarea(attrs={'rows': 3})}


class EpisodioForm(forms.ModelForm):
    class Meta:
        model = Episodio
        fields = ('numero', 'titulo', 'youtube_url')