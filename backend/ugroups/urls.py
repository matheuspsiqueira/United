from django.urls import path

from .views import UGroupViewSet

app_name = 'ugroups'

urlpatterns = [
    path('', UGroupViewSet.as_view({'get': 'list'}), name='ugroup-list'),
    path('<int:pk>/', UGroupViewSet.as_view({'get': 'retrieve'}), name='ugroup-detail'),
]