from django.urls import path

from .views import EventoListView

urlpatterns = [
    path('eventos/', EventoListView.as_view(), name='evento-list'),
]