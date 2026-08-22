from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.core.exceptions import PermissionDenied

from .services import get_escopo


class DashboardAccessMixin(LoginRequiredMixin, UserPassesTestMixin):
    login_url = 'dashboard:login'
    secao_requerida = None

    def test_func(self):
        escopo = self.escopo
        if not escopo['tem_acesso']:
            return False
        if self.secao_requerida is None:
            return True
        return self.secao_requerida in escopo['secoes_visiveis']

    def handle_no_permission(self):
        if not self.request.user.is_authenticated:
            return super().handle_no_permission()
        raise PermissionDenied('Seu usuário não tem acesso a essa área da dashboard.')

    @property
    def escopo(self):
        return get_escopo(self.request.user)