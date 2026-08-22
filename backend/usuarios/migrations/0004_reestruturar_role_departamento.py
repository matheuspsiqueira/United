from django.db import migrations, models
import django.db.models.deletion


def migrar_nivel_para_role(apps, schema_editor):
    Usuario = apps.get_model('usuarios', 'Usuario')
    mapa = {
        'fundador': 'apostolo',
        'pastor_presidente': 'pastor_presidente',
        'lider': 'lider',
    }
    for usuario in Usuario.objects.exclude(nivel_acesso__isnull=True).exclude(nivel_acesso=''):
        novo_role = mapa.get(usuario.nivel_acesso)
        if novo_role:
            usuario.role = novo_role
            usuario.save(update_fields=['role'])


def reverter_role(apps, schema_editor):
    pass


def preencher_departamento(apps, schema_editor):
    VoluntarioPerfil = apps.get_model('usuarios', 'VoluntarioPerfil')
    Departamento = apps.get_model('departamentos', 'Departamento')

    for perfil in VoluntarioPerfil.objects.filter(departamento__isnull=True).select_related('usuario'):
        campus = perfil.usuario.campus
        if campus is None:
            continue
        departamento, _ = Departamento.objects.get_or_create(
            campus=campus, nome='Geral',
            defaults={
                'acesso_dashboard': False,
                'visao_geral_voluntarios': False,
                'aprova_membros': False,
                'edita_membros': False,
            },
        )
        perfil.departamento = departamento
        perfil.save(update_fields=['departamento'])


def reverter_departamento(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('usuarios', '0003_cadastropendente'),
        ('departamentos', '0003_departamento_edita_membros'),
    ]

    operations = [
        migrations.AlterField(
            model_name='usuario',
            name='role',
            field=models.CharField(
                choices=[
                    ('membro', 'Membro'),
                    ('voluntario', 'Voluntário'),
                    ('lider', 'Líder'),
                    ('pastor_presidente', 'Pastor Presidente'),
                    ('apostolo', 'Apóstolo/Fundador'),
                ],
                default='membro', max_length=20,
            ),
        ),
        migrations.RunPython(migrar_nivel_para_role, reverter_role),
        migrations.RemoveField(
            model_name='usuario',
            name='nivel_acesso',
        ),
        migrations.RunPython(preencher_departamento, reverter_departamento),
        migrations.AlterField(
            model_name='voluntarioperfil',
            name='departamento',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.PROTECT,
                related_name='voluntarios', to='departamentos.departamento',
            ),
        ),
    ]