from django.contrib.auth.models import AbstractUser
from django.db import models

from campus.models import Campus


class Usuario(AbstractUser):
    ROLE_CHOICES = [
        ('membro', 'Membro'),
        ('voluntario', 'Voluntário'),
        ('lider', 'Líder'),
        ('pastor_presidente', 'Pastor Presidente'),
        ('apostolo', 'Apóstolo/Fundador'),
    ]

    nome_completo = models.CharField(max_length=150)
    campus = models.ForeignKey(
        Campus, related_name='usuarios', on_delete=models.PROTECT,
        null=True, blank=True,
    )
    telefone = models.CharField(max_length=20, blank=True)
    idade = models.PositiveIntegerField(blank=True, null=True)
    foto_perfil = models.ImageField(upload_to='perfis/', blank=True, null=True)
    senha_temporaria = models.BooleanField(default=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='membro')

    def __str__(self):
        return self.nome_completo


class VoluntarioPerfil(models.Model):
    """Só existe para role == 'voluntario'. Líder pra cima usa departamentos_liderados."""
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE)
    departamento = models.ForeignKey(
        'departamentos.Departamento', related_name='voluntarios',
        on_delete=models.PROTECT,
    )
    data_aprovacao = models.DateField()

    def __str__(self):
        return f'Voluntário: {self.usuario.nome_completo} — {self.departamento.nome}'


class VersiculoFavorito(models.Model):
    usuario = models.ForeignKey(Usuario, related_name='versiculos_favoritos', on_delete=models.CASCADE)
    verse_id = models.CharField(max_length=50)
    cor = models.CharField(max_length=7)

    class Meta:
        unique_together = ('usuario', 'verse_id')

    def __str__(self):
        return f'{self.usuario.nome_completo} — {self.verse_id}'


class CadastroPendente(models.Model):
    STATUS_CHOICES = [
        ('pendente', 'Pendente'),
        ('aprovado', 'Aprovado'),
        ('recusado', 'Recusado'),
    ]

    nome_completo = models.CharField(max_length=150)
    idade = models.PositiveIntegerField(blank=True, null=True)
    telefone = models.CharField(max_length=20, blank=True)
    campus = models.ForeignKey(Campus, related_name='cadastros_pendentes', on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pendente')
    usuario_criado = models.ForeignKey(
        Usuario, related_name='cadastro_origem', on_delete=models.SET_NULL, null=True, blank=True,
    )
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.nome_completo} — {self.get_status_display()}'


class CadastroVoluntario(models.Model):
    STATUS_CHOICES = [
        ('pendente', 'Pendente'),
        ('aprovado', 'Aprovado'),
        ('recusado', 'Recusado'),
    ]

    membro = models.ForeignKey(
        Usuario, related_name='candidaturas_voluntario', on_delete=models.CASCADE,
    )
    departamento_opcao_1 = models.ForeignKey(
        'departamentos.Departamento', related_name='+', on_delete=models.PROTECT,
    )
    departamento_opcao_2 = models.ForeignKey(
        'departamentos.Departamento', related_name='+', on_delete=models.PROTECT,
        null=True, blank=True,
    )
    departamento_opcao_3 = models.ForeignKey(
        'departamentos.Departamento', related_name='+', on_delete=models.PROTECT,
        null=True, blank=True,
    )
    departamento_fechado = models.ForeignKey(
        'departamentos.Departamento', related_name='+', on_delete=models.PROTECT,
        null=True, blank=True,
    )
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pendente')
    departamento_aprovado = models.ForeignKey(
        'departamentos.Departamento', related_name='+', on_delete=models.SET_NULL,
        null=True, blank=True,
    )
    aprovado_por = models.ForeignKey(
        Usuario, related_name='candidaturas_aprovadas', on_delete=models.SET_NULL,
        null=True, blank=True,
    )
    aceitou_termo = models.BooleanField(default=False)
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.membro.nome_completo} — {self.get_status_display()}'


class PermissaoIndividual(models.Model):
    """Overrides pontuais por cima do padrão do Departamento. null = usa o padrão."""
    usuario = models.OneToOneField(Usuario, related_name='permissao_individual', on_delete=models.CASCADE)
    acesso_dashboard = models.BooleanField(null=True, blank=True)
    aprova_membros = models.BooleanField(null=True, blank=True)
    edita_membros = models.BooleanField(null=True, blank=True)
    visao_geral_voluntarios = models.BooleanField(null=True, blank=True)
    cria_conteudo = models.BooleanField(null=True)
    edita_conteudo = models.BooleanField(null=True)

    def __str__(self):
        return f'Permissões individuais — {self.usuario.nome_completo}'


class JanelaCandidaturaVoluntario(models.Model):
    """Singleton — controla se o formulário público de candidatura está liberado."""
    aberta = models.BooleanField(default=False)
    atualizado_em = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        pass  # nunca deleta — é singleton

    @classmethod
    def esta_aberta(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj.aberta

    def __str__(self):
        return 'Aberta' if self.aberta else 'Fechada'