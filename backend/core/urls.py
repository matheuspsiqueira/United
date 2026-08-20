from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', RedirectView.as_view(pattern_name='dashboard:home', permanent=False)),
    path('admin/', admin.site.urls),
    path('api/', include('campus.urls')),
    path('api/usuarios/', include('usuarios.urls')),
    path('api/conteudo/', include('conteudo.urls')),
    path('api/series/', include('series.urls')),
    path('dashboard/', include('dashboard.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)