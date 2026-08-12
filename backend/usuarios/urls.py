from django.urls import path

from .views import (
    LoginView, MeView, TrocarSenhaView,
    VersiculosFavoritosView, VersiculoFavoritoDetailView,
)

urlpatterns = [
    path('login/', LoginView.as_view()),
    path('me/', MeView.as_view()),
    path('trocar-senha/', TrocarSenhaView.as_view()),
    path('versiculos-favoritos/', VersiculosFavoritosView.as_view()),
    path('versiculos-favoritos/<str:verse_id>/', VersiculoFavoritoDetailView.as_view()),
]