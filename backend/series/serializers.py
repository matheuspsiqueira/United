from rest_framework import serializers

from .models import Episodio, Serie


class EpisodioSerializer(serializers.ModelSerializer):
    thumbnail_url = serializers.ReadOnlyField()
    youtube_id = serializers.ReadOnlyField()

    class Meta:
        model = Episodio
        fields = ['id', 'numero', 'titulo', 'youtube_url', 'youtube_id', 'thumbnail_url', 'duracao_minutos']


class SerieListSerializer(serializers.ModelSerializer):
    """Enxuto pra listagem em card — sem episódios."""
    campus_nome = serializers.CharField(source='campus.nome', read_only=True)
    campus_cor_tema = serializers.CharField(source='campus.cor_tema', read_only=True)
    quantidade_episodios = serializers.ReadOnlyField()
    capa = serializers.SerializerMethodField()

    class Meta:
        model = Serie
        fields = [
            'id', 'titulo', 'campus', 'campus_nome', 'campus_cor_tema',
            'capa', 'data_lancamento', 'quantidade_episodios',
        ]

    def get_capa(self, obj):
        request = self.context.get('request')
        if obj.capa and request:
            return request.build_absolute_uri(obj.capa.url)
        return None


class SerieDetalheSerializer(SerieListSerializer):
    """Completo pra tela de detalhe — traz os episódios."""
    episodios = EpisodioSerializer(many=True, read_only=True)

    class Meta(SerieListSerializer.Meta):
        fields = SerieListSerializer.Meta.fields + ['descricao', 'episodios']