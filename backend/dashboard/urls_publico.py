from django.urls import path

from . import views

app_name = 'candidatura'

urlpatterns = [
    path('', views.CandidaturaVoluntarioIdentificarView.as_view(), name='identificar'),
    path('<int:usuario_id>/', views.CandidaturaVoluntarioFormularioView.as_view(), name='formulario'),
]