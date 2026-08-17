import re
from django.core.validators import URLValidator
from django.db import models

from campus.models import Campus


def extrair_youtube_id(url):
    """Extrai o ID do vídeo a partir de diferentes formatos de URL do YouTube."""
    padroes = [
        r'(?:youtube\.com/watch\?v=|youtube\.com/embed/|youtu\.be/)([\w-]{11})',
    ]
    for padrao in padroes:
        match = re.search(padrao, url)
        if match:
            return match.group(1)
    return None


class Serie(models.Model):
    campus = models.ForeignKey(Campus, on_delete=models.CASCADE, related_name='series')
    titulo = models.CharField(max_length=150)
    descricao = models.TextField(blank=True)
    capa = models.ImageField(upload_to='series/capas/')
    data_lancamento = models.DateField(help_text='Mês/data de referência da série')
    ativa = models.BooleanField(default=True)
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-data_lancamento']

    def __str__(self):
        return f'{self.titulo} ({self.campus.nome})'

    @property
    def quantidade_episodios(self):
        return self.episodios.count()


class Episodio(models.Model):
    serie = models.ForeignKey(Serie, on_delete=models.CASCADE, related_name='episodios')
    numero = models.PositiveSmallIntegerField()
    titulo = models.CharField(max_length=150)
    youtube_url = models.URLField(validators=[URLValidator()])
    duracao_minutos = models.PositiveSmallIntegerField(blank=True, null=True)

    class Meta:
        ordering = ['numero']
        unique_together = ('serie', 'numero')

    def __str__(self):
        return f'{self.serie.titulo} — Ep. {self.numero}'

    @property
    def youtube_id(self):
        return extrair_youtube_id(self.youtube_url)

    @property
    def thumbnail_url(self):
        yid = self.youtube_id
        return f'https://img.youtube.com/vi/{yid}/hqdefault.jpg' if yid else None