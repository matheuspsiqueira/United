from rest_framework import serializers
from .models import Campus, Pastor, HorarioCulto


class PastorSerializer(serializers.ModelSerializer):
    foto = serializers.SerializerMethodField()

    class Meta:
        model = Pastor
        fields = ['id', 'nome', 'foto']

    def get_foto(self, obj):
        if obj.foto:
            request = self.context.get('request')
            url = obj.foto.url
            return request.build_absolute_uri(url) if request else url
        return None


class HorarioCultoSerializer(serializers.ModelSerializer):
    dia = serializers.CharField(source='get_dia_semana_display', read_only=True)
    hora = serializers.SerializerMethodField()

    class Meta:
        model = HorarioCulto
        fields = ['dia', 'hora']

    def get_hora(self, obj):
        return obj.hora.strftime('%H:%M')


class ProximoCultoSerializer(serializers.Serializer):
    data = serializers.DateField()
    hora = serializers.TimeField(format='%H:%M')
    dia_semana = serializers.CharField()


class CampusSerializer(serializers.ModelSerializer):
    corTema = serializers.CharField(source='cor_tema')
    anoFundacao = serializers.IntegerField(source='ano_fundacao')
    pastores = PastorSerializer(many=True, read_only=True)
    horarios = HorarioCultoSerializer(many=True, read_only=True)

    class Meta:
        model = Campus
        fields = [
            'id', 'nome', 'regiao', 'corTema', 'endereco',
            'pastores', 'anoFundacao', 'horarios',
        ]