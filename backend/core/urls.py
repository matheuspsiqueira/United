from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from django.conf import settings
from django.conf.urls.static import static
import os
from django.http import JsonResponse

def debug_static(request):
    static_root = str(settings.STATIC_ROOT)
    existe = os.path.isdir(settings.STATIC_ROOT)
    arquivos = []
    if existe:
        for root, dirs, files in os.walk(settings.STATIC_ROOT):
            for f in files[:5]:
                arquivos.append(os.path.relpath(os.path.join(root, f), settings.STATIC_ROOT))
            if len(arquivos) >= 20:
                break
    return JsonResponse({
        'STATIC_ROOT': static_root,
        'pasta_existe': existe,
        'total_arquivos_amostra': len(arquivos),
        'exemplos': arquivos,
        'STATIC_URL': settings.STATIC_URL,
        'DEBUG': settings.DEBUG,
    })

urlpatterns = [
    path('', RedirectView.as_view(pattern_name='dashboard:home', permanent=False)),
    path('admin/', admin.site.urls),
    path('api/', include('campus.urls')),
    path('api/usuarios/', include('usuarios.urls')),
    path('api/conteudo/', include('conteudo.urls')),
    path('api/series/', include('series.urls')),
    path('dashboard/', include('dashboard.urls')),
    path('formulario-voluntario/', include('dashboard.urls_publico')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)