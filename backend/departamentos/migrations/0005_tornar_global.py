from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('departamentos', '0004_departamento_tipo'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='departamento',
            unique_together=set(),
        ),
        migrations.RemoveField(
            model_name='departamento',
            name='campus',
        ),
        migrations.AlterField(
            model_name='departamento',
            name='nome',
            field=models.CharField(max_length=100, unique=True),
        ),
        migrations.AlterModelOptions(
            name='departamento',
            options={'ordering': ['nome']},
        ),
    ]