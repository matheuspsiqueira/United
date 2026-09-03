from rest_framework import viewsets, permissions

from .models import UGroup
from .serializers import UGroupSerializer


class UGroupViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UGroupSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UGroup.objects.filter(campus=self.request.user.campus, ativo=True)