from rest_framework import serializers

from usuarios.serializers import UsuarioSerializer
from .models import UGroup, UGroupMembro, UGroupEncontro, UGroupPresenca


class UGroupSerializer(serializers.ModelSerializer):
    lideres = UsuarioSerializer(many=True, read_only=True)
    dia_semana_display = serializers.CharField(source='get_dia_semana_display', read_only=True)

    class Meta:
        model = UGroup
        fields = [
            'id', 'campus', 'nome', 'endereco', 'dia_semana', 'dia_semana_display',
            'horario', 'observacao', 'pastor_apoio', 'lideres', 'ativo',
        ]
        read_only_fields = ['campus']


class UGroupCriarSerializer(serializers.ModelSerializer):
    lideres_ids = serializers.PrimaryKeyRelatedField(
        source='lideres', many=True, queryset=UGroupMembro._meta.get_field('usuario').related_model.objects.all(),
        required=False,
    )

    class Meta:
        model = UGroup
        fields = [
            'id', 'campus', 'nome', 'endereco', 'dia_semana', 'horario',
            'observacao', 'pastor_apoio', 'lideres_ids', 'ativo',
        ]

    def validate(self, data):
        campus = data.get('campus') or getattr(self.instance, 'campus', None)
        lideres = data.get('lideres')
        if lideres and campus:
            fora_do_campus = [u for u in lideres if u.campus_id != campus.id]
            if fora_do_campus:
                nomes = ', '.join(u.get_full_name() or u.username for u in fora_do_campus)
                raise serializers.ValidationError(
                    f'Só é possível adicionar líderes do mesmo campus do uGroup. Fora do campus: {nomes}.'
                )
        return data


class UGroupMembroSerializer(serializers.ModelSerializer):
    usuario = UsuarioSerializer(read_only=True)
    usuario_id = serializers.PrimaryKeyRelatedField(
        queryset=UGroupMembro._meta.get_field('usuario').related_model.objects.all(),
        source='usuario', write_only=True,
    )

    class Meta:
        model = UGroupMembro
        fields = ['id', 'usuario', 'usuario_id', 'ativo', 'entrou_em']

    def validate_usuario_id(self, usuario):
        ugroup = self.context['ugroup']
        if usuario.campus_id != ugroup.campus_id:
            raise serializers.ValidationError('Esse usuário pertence a outro campus.')
        return usuario


class UGroupPresencaSerializer(serializers.ModelSerializer):
    membro_id = serializers.PrimaryKeyRelatedField(source='membro', queryset=UGroupMembro.objects.all())

    class Meta:
        model = UGroupPresenca
        fields = ['id', 'membro_id', 'presente']


class UGroupEncontroSerializer(serializers.ModelSerializer):
    presencas = UGroupPresencaSerializer(many=True)

    class Meta:
        model = UGroupEncontro
        fields = ['id', 'ugroup', 'data', 'registrado_por', 'presencas']
        read_only_fields = ['ugroup', 'registrado_por']

    def create(self, validated_data):
        presencas_data = validated_data.pop('presencas')
        encontro = UGroupEncontro.objects.create(**validated_data)
        for presenca in presencas_data:
            UGroupPresenca.objects.create(encontro=encontro, **presenca)
        return encontro