from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Campus
from .serializers import CampusSerializer, ProximoCultoSerializer


class CampusViewSet(viewsets.ReadOnlyModelViewSet):
    # Read-only: escrita continua pelo Django admin durante o dev.
    queryset = Campus.objects.prefetch_related('pastores', 'horarios').all()
    serializer_class = CampusSerializer
    permission_classes = [permissions.AllowAny]  # TODO BACKEND: revisar quando auth entrar

    @action(detail=True, methods=['get'], url_path='proximo-culto')
    def proximo_culto(self, request, pk=None):
        campus = self.get_object()
        proximo = campus.proximo_culto()
        if proximo is None:
            return Response(None)
        return Response(ProximoCultoSerializer(proximo).data)