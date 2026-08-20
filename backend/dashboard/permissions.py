from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.core.exceptions import PermissionDenied

from .services import get_escopo


class DashboardAccessMixin(LoginRequiredMixin, UserPassesTestMixin):
    login_url = 'dashboard:login'
    niveis_permitidos = None

    def test_func(self):
        nivel = self.request.user.nivel_acesso
        if not nivel:
            return False
        if self.niveis_permitidos is None:
            return True
        return nivel in self.niveis_permitidos

    def handle_no_permission(self):
        if not self.request.user.is_authenticated:
            return super().handle_no_permission()
        raise PermissionDenied('Seu usuário não tem acesso a essa área da dashboard.')

    @property
    def escopo(self):
        return get_escopo(self.request.user)