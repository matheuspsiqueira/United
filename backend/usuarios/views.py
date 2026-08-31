from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import VersiculoFavorito
from .serializers import UsuarioSerializer, UsuarioUpdateSerializer, VersiculoFavoritoSerializer, PosicaoLeituraBiblia, PosicaoLeituraBibliaSerializer


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response(
                {'detail': 'Usuário e senha são obrigatórios.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        usuario = authenticate(request, username=username, password=password)

        if usuario is None:
            return Response(
                {'detail': 'Usuário ou senha inválidos.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        token, _ = Token.objects.get_or_create(user=usuario)
        return Response({
            'token': token.key,
            'usuario': UsuarioSerializer(usuario, context={'request': request}).data,
        })


class MeView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        return Response(UsuarioSerializer(request.user, context={'request': request}).data)

    def patch(self, request):
        serializer = UsuarioUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UsuarioSerializer(request.user, context={'request': request}).data)


class TrocarSenhaView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        senha_atual = request.data.get('senha_atual')
        nova_senha = request.data.get('nova_senha')

        if not senha_atual or not nova_senha:
            return Response(
                {'detail': 'Senha atual e nova senha são obrigatórias.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(nova_senha) < 6:
            return Response(
                {'detail': 'A nova senha precisa ter pelo menos 6 caracteres.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        usuario = request.user

        if not usuario.check_password(senha_atual):
            return Response(
                {'detail': 'Senha atual incorreta.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        usuario.set_password(nova_senha)
        usuario.senha_temporaria = False
        usuario.save()

        return Response(UsuarioSerializer(usuario, context={'request': request}).data)


class VersiculosFavoritosView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        favoritos = VersiculoFavorito.objects.filter(usuario=request.user)
        return Response(VersiculoFavoritoSerializer(favoritos, many=True).data)

    def post(self, request):
        verse_id = request.data.get('verse_id')
        cor = request.data.get('cor')

        if not verse_id or not cor:
            return Response(
                {'detail': 'verse_id e cor são obrigatórios.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        favorito, _ = VersiculoFavorito.objects.update_or_create(
            usuario=request.user, verse_id=verse_id,
            defaults={'cor': cor},
        )
        return Response(VersiculoFavoritoSerializer(favorito).data)


class VersiculoFavoritoDetailView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def delete(self, request, verse_id):
        apagados, _ = VersiculoFavorito.objects.filter(
            usuario=request.user, verse_id=verse_id,
        ).delete()
        if not apagados:
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)


class PosicaoLeituraBibliaView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        posicao = PosicaoLeituraBiblia.objects.filter(usuario=request.user).first()
        if not posicao:
            return Response(None, status=status.HTTP_200_OK)
        return Response(PosicaoLeituraBibliaSerializer(posicao).data)

    def post(self, request):
        posicao, _ = PosicaoLeituraBiblia.objects.update_or_create(
            usuario=request.user,
            defaults={
                'versao': request.data.get('versao', 'nvi'),
                'livro_slug': request.data.get('livro_slug'),
                'capitulo': request.data.get('capitulo', 1),
            },
        )
        return Response(PosicaoLeituraBibliaSerializer(posicao).data)