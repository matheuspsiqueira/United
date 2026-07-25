from django.contrib.auth.models import AbstractUser
from django.db import models

from campus.models import Campus


class Usuario(AbstractUser):
    ROLE_CHOICES = [
        ('membro', 'Membro'),
        ('voluntario', 'Voluntário'),
    ]

    nome_completo = models.CharField(max_length=150)
    campus = models.ForeignKey(
        Campus, related_name='usuarios', on_delete=models.PROTECT,
        null=True, blank=True,
    )
    foto_perfil = models.ImageField(upload_to='perfis/', blank=True, null=True)
    senha_temporaria = models.BooleanField(default=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='membro')

    def __str__(self):
        return self.nome_completo


class VoluntarioPerfil(models.Model):
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE)
    data_aprovacao = models.DateField()

    def __str__(self):
        return f'Voluntário: {self.usuario.nome_completo}'


class VersiculoFavorito(models.Model):
    usuario = models.ForeignKey(Usuario, related_name='versiculos_favoritos', on_delete=models.CASCADE)
    verse_id = models.CharField(max_length=50)
    cor = models.CharField(max_length=7)

    class Meta:
        unique_together = ('usuario', 'verse_id')

    def __str__(self):
        return f'{self.usuario.nome_completo} — {self.verse_id}'