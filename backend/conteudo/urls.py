from django.urls import path

from .views import EventoListView, NoticiaListView, UnitedNewsListView

urlpatterns = [
    path('eventos/', EventoListView.as_view(), name='evento-list'),
    path('noticias/', NoticiaListView.as_view(), name='noticia-list'),
    path('united-news/', UnitedNewsListView.as_view(), name='united-news-list'),
]