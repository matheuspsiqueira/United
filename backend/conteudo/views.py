from rest_framework import generics, permissions

from .models import Evento, Noticia, UnitedNews
from .serializers import EventoSerializer, NoticiaSerializer, UnitedNewsSerializer


class EventoListView(generics.ListAPIView):
    """
    GET /api/conteudo/eventos/
    GET /api/conteudo/eventos/?campus=<id>  → filtra por um campus específico
    """
    serializer_class = EventoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Evento.objects.select_related('campus').all()
        campus_id = self.request.query_params.get('campus')
        if campus_id:
            queryset = queryset.filter(campus_id=campus_id)
        return queryset


class NoticiaListView(generics.ListAPIView):
    """
    GET /api/conteudo/noticias/
    GET /api/conteudo/noticias/?campus=<id>  → filtra por um campus específico

    Só retorna notícias ativas (expira_em >= hoje) — o hard-delete
    das expiradas fica pro job da Fase 3.
    """
    serializer_class = NoticiaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Noticia.objects.select_related('campus').ativas()
        campus_id = self.request.query_params.get('campus')
        if campus_id:
            queryset = queryset.filter(campus_id=campus_id)
        return queryset.order_by('-data')


class UnitedNewsListView(generics.ListAPIView):
    """
    GET /api/conteudo/united-news/
    GET /api/conteudo/united-news/?campus=<id>  → filtra por um campus específico

    Como UnitedNews é OneToOne por campus, o filtro por ?campus= sempre
    devolve 0 ou 1 item — front deve pegar results[0] nesse caso.
    """
    serializer_class = UnitedNewsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = UnitedNews.objects.select_related('campus').all()
        campus_id = self.request.query_params.get('campus')
        if campus_id:
            queryset = queryset.filter(campus_id=campus_id)
        return queryset