from django.urls import path

from .views import LoginView, MeView, TrocarSenhaView

urlpatterns = [
    path('login/', LoginView.as_view()),
    path('me/', MeView.as_view()),
    path('trocar-senha/', TrocarSenhaView.as_view()),
]