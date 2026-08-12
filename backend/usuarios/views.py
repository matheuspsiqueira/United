from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import UsuarioSerializer, UsuarioUpdateSerializer


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
            'usuario': UsuarioSerializer(usuario).data,
        })


class MeView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        return Response(UsuarioSerializer(request.user).data)

    def patch(self, request):
        serializer = UsuarioUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UsuarioSerializer(request.user).data)


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

        return Response(UsuarioSerializer(usuario).data)