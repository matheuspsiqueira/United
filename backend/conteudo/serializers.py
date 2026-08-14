from rest_framework import serializers

from campus.models import Campus
from .models import Evento


class CampusMiniSerializer(serializers.ModelSerializer):
    """Representação enxuta do campus, só o necessário pra UI (accent, nome, agrupamento)."""
    corTema = serializers.CharField(source='cor_tema')  # ajuste o source se o campo no model tiver outro nome

    class Meta:
        model = Campus
        fields = ['id', 'nome', 'corTema']


class EventoSerializer(serializers.ModelSerializer):
    campus = CampusMiniSerializer(read_only=True)
    capa = serializers.SerializerMethodField()

    class Meta:
        model = Evento
        fields = [
            'id', 'campus', 'titulo', 'descricao', 'data', 'horario',
            'valor', 'link_ingresso', 'capa',
        ]

    def get_capa(self, obj):
        if not obj.capa:
            return None
        request = self.context.get('request')
        url = obj.capa.url
        return request.build_absolute_uri(url) if request else url