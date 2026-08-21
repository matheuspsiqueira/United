from django.urls import path

from . import views

app_name = 'dashboard'

urlpatterns = [
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('', views.HomeView.as_view(), name='home'),
    path('membros/', views.MembrosListView.as_view(), name='membros'),
    path('membros/pendentes/', views.CadastrosPendentesListView.as_view(), name='membros_pendentes'),
    path('membros/pendentes/<int:pk>/aprovar/', views.CadastroPendenteAprovarView.as_view(), name='cadastro_aprovar'),
    path('voluntarios/', views.VoluntariosListView.as_view(), name='voluntarios'),
    path('usuarios/<int:pk>/', views.UsuarioDetalheView.as_view(), name='usuario_detalhe'),
    path('usuarios/<int:pk>/resetar-senha/', views.UsuarioResetarSenhaView.as_view(), name='usuario_resetar_senha'),
]