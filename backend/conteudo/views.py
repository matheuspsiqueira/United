from rest_framework import generics, permissions

from .models import Evento
from .serializers import EventoSerializer


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