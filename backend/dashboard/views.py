from django.contrib.auth.views import LoginView as DjangoLoginView
from django.contrib.auth import logout
from django.db.models import Count
from django.shortcuts import redirect
from django.views import View
from django.views.generic import ListView, TemplateView

from campus.models import Campus
from departamentos.models import Departamento
from usuarios.models import Usuario
from .permissions import DashboardAccessMixin


class LoginView(DjangoLoginView):
    template_name = 'dashboard/login.html'
    redirect_authenticated_user = True


class LogoutView(View):
    def post(self, request, *args, **kwargs):
        logout(request)
        return redirect('dashboard:login')


class HomeView(DashboardAccessMixin, TemplateView):
    template_name = 'dashboard/home.html'

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        escopo = self.escopo
        ctx['escopo'] = escopo

        todos_qs = Usuario.objects.all()
        voluntarios_qs = Usuario.objects.filter(role='voluntario')

        if escopo['nivel'] == 'fundador':
            ctx['total_membros'] = todos_qs.count()
            ctx['total_voluntarios'] = voluntarios_qs.count()
            ctx['breakdown_campus'] = (
                todos_qs.exclude(campus__isnull=True)
                .values('campus__nome')
                .annotate(total=Count('id'))
                .order_by('-total')
            )

        elif escopo['nivel'] == 'pastor_presidente':
            campus = escopo['campus']
            ctx['total_membros'] = todos_qs.filter(campus=campus).count()
            ctx['total_voluntarios'] = voluntarios_qs.filter(campus=campus).count()

        elif escopo['nivel'] == 'lider':
            campus = escopo['campus']
            if escopo['visao_geral_voluntarios']:
                ctx['total_voluntarios'] = voluntarios_qs.filter(campus=campus).count()
            else:
                deptos = escopo['departamentos']
                ctx['total_voluntarios'] = voluntarios_qs.filter(
                    campus=campus, voluntarioperfil__departamento__in=deptos,
                ).count()

        return ctx


class MembrosListView(DashboardAccessMixin, ListView):
    model = Usuario
    template_name = 'dashboard/membros_list.html'
    context_object_name = 'membros'
    paginate_by = 25
    niveis_permitidos = ['fundador', 'pastor_presidente']

    def get_queryset(self):
        qs = Usuario.objects.select_related('campus').order_by('nome_completo')
        escopo = self.escopo

        if escopo['nivel'] != 'fundador':
            qs = qs.filter(campus=escopo['campus'])
        else:
            campus_id = self.request.GET.get('campus')
            if campus_id:
                qs = qs.filter(campus_id=campus_id)

        busca = self.request.GET.get('q')
        if busca:
            qs = qs.filter(nome_completo__icontains=busca)

        return qs

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        escopo = self.escopo
        ctx['escopo'] = escopo

        if escopo['nivel'] == 'fundador':
            ctx['campi'] = Campus.objects.all().order_by('nome')

        ctx['campus_selecionado'] = self.request.GET.get('campus', '')
        ctx['busca'] = self.request.GET.get('q', '')
        return ctx


class VoluntariosListView(DashboardAccessMixin, ListView):
    model = Usuario
    template_name = 'dashboard/voluntarios_list.html'
    context_object_name = 'voluntarios'
    paginate_by = 25

    def get_queryset(self):
        qs = (
            Usuario.objects.filter(role='voluntario')
            .select_related('campus', 'voluntarioperfil__departamento')
            .order_by('nome_completo')
        )
        escopo = self.escopo

        if escopo['nivel'] == 'fundador':
            campus_id = self.request.GET.get('campus')
            if campus_id:
                qs = qs.filter(campus_id=campus_id)
        else:
            qs = qs.filter(campus=escopo['campus'])
            if escopo['nivel'] == 'lider' and not escopo['visao_geral_voluntarios']:
                qs = qs.filter(voluntarioperfil__departamento__in=escopo['departamentos'])

        departamento_id = self.request.GET.get('departamento')
        if departamento_id:
            qs = qs.filter(voluntarioperfil__departamento_id=departamento_id)

        busca = self.request.GET.get('q')
        if busca:
            qs = qs.filter(nome_completo__icontains=busca)

        return qs

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        escopo = self.escopo
        ctx['escopo'] = escopo

        if escopo['nivel'] == 'fundador':
            ctx['campi'] = Campus.objects.all().order_by('nome')
            ctx['departamentos'] = Departamento.objects.select_related('campus').order_by('campus__nome', 'nome')
        elif escopo['nivel'] == 'pastor_presidente' or escopo['visao_geral_voluntarios']:
            ctx['departamentos'] = Departamento.objects.filter(campus=escopo['campus']).order_by('nome')
        else:
            ctx['departamentos'] = None

        ctx['campus_selecionado'] = self.request.GET.get('campus', '')
        ctx['departamento_selecionado'] = self.request.GET.get('departamento', '')
        ctx['busca'] = self.request.GET.get('q', '')
        return ctx