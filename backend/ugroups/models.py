from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models

from campus.models import Campus


class UGroup(models.Model):
    class DiaSemana(models.TextChoices):
        SEGUNDA = 'segunda', 'Segunda-feira'
        TERCA = 'terca', 'Terça-feira'
        QUARTA = 'quarta', 'Quarta-feira'
        QUINTA = 'quinta', 'Quinta-feira'
        SEXTA = 'sexta', 'Sexta-feira'
        SABADO = 'sabado', 'Sábado'
        DOMINGO = 'domingo', 'Domingo'

    campus = models.ForeignKey(Campus, on_delete=models.CASCADE, related_name='ugroups')
    nome = models.CharField(max_length=100)
    endereco = models.CharField(max_length=255)
    dia_semana = models.CharField(max_length=10, choices=DiaSemana.choices)
    horario = models.TimeField()
    observacao = models.CharField(max_length=100, blank=True)
    pastor_apoio = models.CharField(
        max_length=150, blank=True,
        help_text='Texto livre, ex: "Prs. Jackson e Danúbia". Não vincula usuário nenhum.',
    )
    lideres = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='ugroups_liderados',
        blank=True,
    )
    ativo = models.BooleanField(default=True)

    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['nome']

    def __str__(self):
        return f'{self.nome} ({self.campus.nome})'


class UGroupMembro(models.Model):
    ugroup = models.ForeignKey(UGroup, on_delete=models.CASCADE, related_name='membros')
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ugroups_participando'
    )
    ativo = models.BooleanField(default=True)
    entrou_em = models.DateField(auto_now_add=True)

    class Meta:
        unique_together = ('ugroup', 'usuario')

    def clean(self):
        if self.usuario_id and self.usuario.campus_id != self.ugroup.campus_id:
            raise ValidationError('Esse usuário pertence a outro campus e não pode ser adicionado a este uGroup.')

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.usuario} em {self.ugroup.nome}'


class UGroupEncontro(models.Model):
    ugroup = models.ForeignKey(UGroup, on_delete=models.CASCADE, related_name='encontros')
    data = models.DateField()
    registrado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True,
        related_name='ugroup_encontros_registrados',
    )
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('ugroup', 'data')
        ordering = ['-data']

    def __str__(self):
        return f'{self.ugroup.nome} — {self.data}'


class UGroupPresenca(models.Model):
    encontro = models.ForeignKey(UGroupEncontro, on_delete=models.CASCADE, related_name='presencas')
    membro = models.ForeignKey(UGroupMembro, on_delete=models.CASCADE, related_name='presencas')
    presente = models.BooleanField(default=False)

    class Meta:
        unique_together = ('encontro', 'membro')

    def __str__(self):
        status = 'presente' if self.presente else 'ausente'
        return f'{self.membro.usuario} — {status} ({self.encontro.data})'