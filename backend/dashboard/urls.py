from django.urls import path

from . import views

app_name = 'dashboard'

urlpatterns = [
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('', views.HomeView.as_view(), name='home'),
    path('membros/', views.MembrosListView.as_view(), name='membros'),
    path('voluntarios/', views.VoluntariosListView.as_view(), name='voluntarios'),
]