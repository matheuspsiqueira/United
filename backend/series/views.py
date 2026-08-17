from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Serie
from .serializers import SerieDetalheSerializer, SerieListSerializer


class SerieListView(generics.ListAPIView):
    serializer_class = SerieListSerializer
    permission_classes = [IsAuthenticated]
    queryset = Serie.objects.filter(ativa=True).select_related('campus')


class SerieDetalheView(generics.RetrieveAPIView):
    serializer_class = SerieDetalheSerializer
    permission_classes = [IsAuthenticated]
    queryset = Serie.objects.filter(ativa=True).select_related('campus').prefetch_related('episodios')