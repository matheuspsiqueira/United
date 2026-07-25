from django.db import models


class Campus(models.Model):
    REGIAO_CHOICES = [
        ('RJ', 'Rio de Janeiro'),
        ('SP', 'São Paulo'),
        ('PT', 'Portugal'),
    ]

    nome = models.CharField(max_length=100)
    regiao = models.CharField(max_length=2, choices=REGIAO_CHOICES)
    endereco = models.CharField(max_length=255)
    cor_tema = models.CharField(max_length=7)
    ano_fundacao = models.PositiveIntegerField()
    descricao = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nome

    def proximo_culto(self):
        from django.utils import timezone
        from datetime import datetime, timedelta

        horarios = list(self.horarios.all())
        if not horarios:
            return None

        agora = timezone.localtime()
        hoje_weekday = agora.weekday()
        melhor_dt = None
        melhor_horario = None

        for h in horarios:
            dias_ate = (h.dia_semana - hoje_weekday) % 7
            candidato = agora.date() + timedelta(days=dias_ate)
            candidato_dt = timezone.make_aware(datetime.combine(candidato, h.hora))

            if candidato_dt <= agora:
                candidato_dt += timedelta(days=7)

            if melhor_dt is None or candidato_dt < melhor_dt:
                melhor_dt = candidato_dt
                melhor_horario = h

        return {
            'data': melhor_dt.date(),
            'hora': melhor_horario.hora,
            'dia_semana': melhor_horario.get_dia_semana_display(),
        }


class Pastor(models.Model):
    campus = models.ForeignKey(Campus, related_name='pastores', on_delete=models.CASCADE)
    nome = models.CharField(max_length=150)
    foto = models.ImageField(upload_to='pastores/', blank=True, null=True)

    def __str__(self):
        return self.nome


class HorarioCulto(models.Model):
    DIA_CHOICES = [
        (0, 'Segunda-feira'),
        (1, 'Terça-feira'),
        (2, 'Quarta-feira'),
        (3, 'Quinta-feira'),
        (4, 'Sexta-feira'),
        (5, 'Sábado'),
        (6, 'Domingo'),
    ]

    campus = models.ForeignKey(Campus, related_name='horarios', on_delete=models.CASCADE)
    dia_semana = models.IntegerField(choices=DIA_CHOICES)
    hora = models.TimeField()

    def __str__(self):
        return f'{self.campus.nome} — {self.get_dia_semana_display()} {self.hora.strftime("%H:%M")}'