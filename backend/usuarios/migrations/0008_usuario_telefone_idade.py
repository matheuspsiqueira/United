from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('usuarios', '0007_janelacandidaturavoluntario_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='usuario',
            name='telefone',
            field=models.CharField(max_length=20, blank=True),
        ),
        migrations.AddField(
            model_name='usuario',
            name='idade',
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
    ]