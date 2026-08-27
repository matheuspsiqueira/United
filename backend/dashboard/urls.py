from django.urls import path

from . import views
from .views_series import (
    EpisodioCriarView, EpisodioEditarView, EpisodioExcluirView,
    SerieCriarView, SerieEditarView, SerieExcluirView, SerieListView,
)


app_name = 'dashboard'

urlpatterns = [
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('', views.HomeView.as_view(), name='home'),
    path('membros/', views.MembrosListView.as_view(), name='membros'),
    path('membros/pendentes/', views.CadastrosPendentesListView.as_view(), name='membros_pendentes'),
    path('membros/pendentes/<int:pk>/aprovar/', views.CadastroPendenteAprovarView.as_view(), name='cadastro_aprovar'),
    path('voluntarios/', views.VoluntariosListView.as_view(), name='voluntarios'),
    path('voluntarios/pendentes/', views.CandidaturasVoluntarioListView.as_view(), name='voluntarios_pendentes'),
    path('voluntarios/pendentes/<int:pk>/', views.CandidaturaVoluntarioDetalheView.as_view(), name='candidatura_voluntario_detalhe'),
    path('usuarios/<int:pk>/', views.UsuarioDetalheView.as_view(), name='usuario_detalhe'),
    path('usuarios/<int:pk>/resetar-senha/', views.UsuarioResetarSenhaView.as_view(), name='usuario_resetar_senha'),
    path('voluntarios/<int:pk>/permissoes/', views.UsuarioPermissoesView.as_view(), name='usuario_permissoes'),
    path('voluntarios/formulario/toggle/', views.JanelaCandidaturaToggleView.as_view(), name='janela_candidatura_toggle'),
    path('departamentos/', views.DepartamentosListView.as_view(), name='departamentos'),
    path('departamentos/novo/', views.DepartamentoFormView.as_view(), name='departamento_criar'),
    path('departamentos/<int:pk>/editar/', views.DepartamentoFormView.as_view(), name='departamento_editar'),
    path('departamentos/<int:pk>/excluir/', views.DepartamentoExcluirView.as_view(), name='departamento_excluir'),
    path('series/', SerieListView.as_view(), name='series'),
    path('series/nova/', SerieCriarView.as_view(), name='serie_criar'),
    path('series/<int:pk>/editar/', SerieEditarView.as_view(), name='serie_editar'),
    path('series/<int:pk>/excluir/', SerieExcluirView.as_view(), name='serie_excluir'),
    path('series/<int:serie_pk>/episodios/novo/', EpisodioCriarView.as_view(), name='episodio_criar'),
    path('episodios/<int:pk>/editar/', EpisodioEditarView.as_view(), name='episodio_editar'),
    path('episodios/<int:pk>/excluir/', EpisodioExcluirView.as_view(), name='episodio_excluir'),
]