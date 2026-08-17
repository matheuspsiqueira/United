from django.urls import path

from .views import SerieDetalheView, SerieListView

urlpatterns = [
    path('', SerieListView.as_view(), name='serie-list'),
    path('<int:pk>/', SerieDetalheView.as_view(), name='serie-detalhe'),
]