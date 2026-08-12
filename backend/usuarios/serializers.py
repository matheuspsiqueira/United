from rest_framework import serializers

from campus.serializers import CampusSerializer
from .models import Usuario


class UsuarioSerializer(serializers.ModelSerializer):
    campus = CampusSerializer(read_only=True)

    class Meta:
        model = Usuario
        fields = [
            'id', 'username', 'nome_completo', 'email',
            'campus', 'role', 'foto_perfil', 'senha_temporaria',
        ]


class UsuarioUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['nome_completo', 'email', 'foto_perfil']
        extra_kwargs = {
            'nome_completo': {'required': False},
            'email': {'required': False},
            'foto_perfil': {'required': False},
        }