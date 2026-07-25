import calendar

from django.db import models
from django.utils import timezone

from campus.models import Campus


class Evento(models.Model):
    campus = models.ForeignKey(Campus, related_name='eventos', on_delete=models.CASCADE)
    titulo = models.CharField(max_length=150)
    descricao = models.TextField()
    data = models.DateField()
    capa = models.ImageField(upload_to='eventos/', blank=True, null=True)

    def __str__(self):
        return self.titulo


class NoticiaManager(models.Manager):
    def ativas(self):
        return self.filter(expira_em__gte=timezone.now().date())


class Noticia(models.Model):
    campus = models.ForeignKey(Campus, related_name='noticias', on_delete=models.CASCADE)
    titulo = models.CharField(max_length=150)
    conteudo = models.TextField()
    data = models.DateField()
    expira_em = models.DateField(blank=True, null=True)

    objects = NoticiaManager()

    def save(self, *args, **kwargs):
        if not self.expira_em:
            ultimo_dia = calendar.monthrange(self.data.year, self.data.month)[1]
            self.expira_em = self.data.replace(day=ultimo_dia)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.titulo

    # TODO Fase 3 (pós-MVP): job agendado dia 20, deletando
    # Noticia.objects.filter(expira_em__lt=timezone.now().date())


class UnitedNews(models.Model):
    campus = models.OneToOneField(Campus, related_name='united_news', on_delete=models.CASCADE)
    mes_referencia = models.CharField(max_length=20)
    video = models.FileField(upload_to='united_news/')
    atualizado_em = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'UnitedNews — {self.campus.nome} ({self.mes_referencia})'