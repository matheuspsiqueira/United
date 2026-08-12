from rest_framework import serializers

from campus.serializers import CampusSerializer
from .models import Usuario, VersiculoFavorito


class UsuarioSerializer(serializers.ModelSerializer):
    campus = CampusSerializer(read_only=True)
    foto_perfil = serializers.SerializerMethodField()

    class Meta:
        model = Usuario
        fields = [
            'id', 'username', 'nome_completo', 'email',
            'campus', 'role', 'foto_perfil', 'senha_temporaria',
        ]

    def get_foto_perfil(self, obj):
        if not obj.foto_perfil:
            return None
        request = self.context.get('request')
        url = obj.foto_perfil.url
        return request.build_absolute_uri(url) if request else url


class UsuarioUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['nome_completo', 'email', 'foto_perfil']
        extra_kwargs = {
            'nome_completo': {'required': False},
            'email': {'required': False},
            'foto_perfil': {'required': False},
        }


class VersiculoFavoritoSerializer(serializers.ModelSerializer):
    class Meta:
        model = VersiculoFavorito
        fields = ['verse_id', 'cor']