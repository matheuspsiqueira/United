from rest_framework import serializers

from campus.models import Campus
from .models import Evento, Noticia, UnitedNews


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


class NoticiaSerializer(serializers.ModelSerializer):
    campus = CampusMiniSerializer(read_only=True)

    class Meta:
        model = Noticia
        fields = [
            'id', 'campus', 'titulo', 'conteudo', 'data', 'expira_em',
        ]
        # sem capa — Noticia é texto-only, conforme decidido


class UnitedNewsSerializer(serializers.ModelSerializer):
    campus = CampusMiniSerializer(read_only=True)
    video = serializers.SerializerMethodField()
    capa = serializers.SerializerMethodField()

    class Meta:
        model = UnitedNews
        fields = [
            'id', 'campus', 'mes_referencia', 'video', 'capa', 'atualizado_em',
        ]

    def get_video(self, obj):
        if not obj.video:
            return None
        request = self.context.get('request')
        url = obj.video.url
        return request.build_absolute_uri(url) if request else url

    def get_capa(self, obj):
        if not obj.capa:
            return None
        request = self.context.get('request')
        url = obj.capa.url
        return request.build_absolute_uri(url) if request else url