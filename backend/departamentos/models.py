from django.conf import settings
from django.db import models


class Departamento(models.Model):
    TIPO_CHOICES = [
        ('aberto', 'Aberto'),
        ('fechado', 'Fechado'),
    ]

    nome = models.CharField(max_length=100, unique=True)
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES, default='aberto')
    lideres = models.ManyToManyField(
        settings.AUTH_USER_MODEL, related_name='departamentos_liderados', blank=True,
    )
    acesso_dashboard = models.BooleanField(default=False)
    visao_geral_voluntarios = models.BooleanField(default=False)
    aprova_membros = models.BooleanField(default=False)
    edita_membros = models.BooleanField(default=False)
    cria_conteudo = models.BooleanField(default=False)
    edita_conteudo = models.BooleanField(default=False)

    class Meta:
        ordering = ['nome']

    def __str__(self):
        return self.nome