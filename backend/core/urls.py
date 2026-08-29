from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from django.conf import settings
from django.conf.urls.static import static
import os
import django
from django.http import JsonResponse
from django.contrib.staticfiles.finders import get_finders

def debug_static(request):
    admin_static_path = os.path.join(os.path.dirname(django.__file__), 'contrib', 'admin', 'static')

    finders_info = []
    total_encontrados = 0
    for finder in get_finders():
        paths = list(finder.list(None))
        total_encontrados += len(paths)
        finders_info.append({
            'finder': finder.__class__.__name__,
            'quantidade_encontrada': len(paths),
        })

    return JsonResponse({
        'STATIC_ROOT': str(settings.STATIC_ROOT),
        'STATICFILES_FINDERS': settings.STATICFILES_FINDERS,
        'STATICFILES_DIRS': getattr(settings, 'STATICFILES_DIRS', None),
        'admin_static_existe_no_pacote_django': os.path.isdir(admin_static_path),
        'admin_static_path': admin_static_path,
        'total_arquivos_encontrados_pelos_finders': total_encontrados,
        'detalhe_por_finder': finders_info,
    })

urlpatterns = [
    path('debug-static/', debug_static),
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