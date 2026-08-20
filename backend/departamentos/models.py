from django.conf import settings
from django.db import models

from campus.models import Campus


class Departamento(models.Model):
    campus = models.ForeignKey(Campus, related_name='departamentos', on_delete=models.CASCADE)
    nome = models.CharField(max_length=100)
    lideres = models.ManyToManyField(
        settings.AUTH_USER_MODEL, related_name='departamentos_liderados', blank=True,
    )
    acesso_dashboard = models.BooleanField(default=False)
    visao_geral_voluntarios = models.BooleanField(default=False)
    aprova_membros = models.BooleanField(default=False)

    class Meta:
        unique_together = ('campus', 'nome')

    def __str__(self):
        return f'{self.nome} — {self.campus.nome}'