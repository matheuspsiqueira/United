from .services import get_escopo


def escopo_processor(request):
    if request.user.is_authenticated and getattr(request.user, 'nivel_acesso', None):
        return {'escopo': get_escopo(request.user)}
    return {}