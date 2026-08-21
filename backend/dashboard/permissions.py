from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.core.exceptions import PermissionDenied

from .services import get_escopo


class DashboardAccessMixin(LoginRequiredMixin, UserPassesTestMixin):
    login_url = 'dashboard:login'
    niveis_permitidos = None
    secao = None

    def test_func(self):
        escopo = self.escopo
        if not escopo['acesso_dashboard']:
            return False
        if self.niveis_permitidos is not None and escopo['nivel'] not in self.niveis_permitidos:
            return False
        if self.secao is not None and self.secao not in escopo['secoes_visiveis']:
            return False
        return True

    def handle_no_permission(self):
        if not self.request.user.is_authenticated:
            return super().handle_no_permission()
        raise PermissionDenied('Seu usuário não tem acesso a essa área da dashboard.')

    @property
    def escopo(self):
        return get_escopo(self.request.user)