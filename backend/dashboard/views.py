from django.contrib import messages
from django.contrib.auth.views import LoginView as DjangoLoginView
from django.contrib.auth import logout
from django.core.exceptions import PermissionDenied
from django.db.models import Count
from django.http import Http404
from django.shortcuts import get_object_or_404, redirect, render
from django.views import View
from django.views.generic import ListView, TemplateView

from campus.models import Campus
from departamentos.models import Departamento
from usuarios.models import Usuario, CadastroPendente
from usuarios.utils import gerar_senha_provisoria, gerar_username
from .permissions import DashboardAccessMixin


class LoginView(DjangoLoginView):
    template_name = 'dashboard/login.html'
    redirect_authenticated_user = True


class LogoutView(View):
    def post(self, request, *args, **kwargs):
        logout(request)
        return redirect('dashboard:login')


class MembrosAccessMixin(DashboardAccessMixin):
    def test_func(self):
        if not super().test_func():
            return False
        return self.escopo['nivel'] in ('fundador', 'pastor_presidente') or self.escopo['pode_aprovar_membros']


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


class MembrosListView(MembrosAccessMixin, ListView):
    model = Usuario
    template_name = 'dashboard/membros_list.html'
    context_object_name = 'membros'
    paginate_by = 25

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
        ctx['pode_editar'] = escopo['nivel'] in ('fundador', 'pastor_presidente')

        if escopo['nivel'] == 'fundador':
            ctx['campi'] = Campus.objects.all().order_by('nome')

        ctx['campus_selecionado'] = self.request.GET.get('campus', '')
        ctx['busca'] = self.request.GET.get('q', '')
        return ctx


class CadastrosPendentesListView(MembrosAccessMixin, ListView):
    model = CadastroPendente
    template_name = 'dashboard/membros_pendentes.html'
    context_object_name = 'cadastros'

    def get_queryset(self):
        qs = CadastroPendente.objects.filter(status='pendente').select_related('campus').order_by('criado_em')
        escopo = self.escopo
        if escopo['nivel'] != 'fundador':
            qs = qs.filter(campus=escopo['campus'])
        return qs

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx['escopo'] = self.escopo
        return ctx


class CadastroPendenteAprovarView(MembrosAccessMixin, View):
    def post(self, request, *args, **kwargs):
        escopo = self.escopo
        qs = CadastroPendente.objects.filter(status='pendente')
        if escopo['nivel'] != 'fundador':
            qs = qs.filter(campus=escopo['campus'])
        cadastro = get_object_or_404(qs, pk=kwargs['pk'])

        username = gerar_username(cadastro.nome_completo)
        senha = gerar_senha_provisoria()

        novo_usuario = Usuario(
            username=username,
            nome_completo=cadastro.nome_completo,
            campus=cadastro.campus,
            role='membro',
            senha_temporaria=True,
        )
        novo_usuario.set_password(senha)
        novo_usuario.save()

        cadastro.status = 'aprovado'
        cadastro.usuario_criado = novo_usuario
        cadastro.save()

        messages.success(
            request,
            f'Usuário criado: {username} — senha provisória: {senha} (anote agora, não aparece de novo).',
        )
        return redirect('dashboard:membros_pendentes')


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
        ctx['pode_editar'] = escopo['nivel'] in ('fundador', 'pastor_presidente')

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


class UsuarioDetalheView(DashboardAccessMixin, View):
    def get_usuario(self):
        escopo = self.escopo
        qs = Usuario.objects.select_related('campus', 'voluntarioperfil__departamento')
        usuario = get_object_or_404(qs, pk=self.kwargs['pk'])

        if escopo['nivel'] == 'fundador':
            return usuario

        campus_id = escopo['campus'].id if escopo['campus'] else None
        if usuario.campus_id != campus_id:
            raise Http404

        if escopo['nivel'] == 'lider' and usuario.role == 'voluntario' and not escopo['visao_geral_voluntarios']:
            deptos_ids = [d.id for d in escopo['departamentos']]
            perfil = getattr(usuario, 'voluntarioperfil', None)
            if not perfil or perfil.departamento_id not in deptos_ids:
                raise Http404

        return usuario

    def get(self, request, *args, **kwargs):
        usuario = self.get_usuario()
        escopo = self.escopo
        pode_editar = escopo['nivel'] in ('fundador', 'pastor_presidente')

        contexto = {
            'usuario_alvo': usuario,
            'pode_editar': pode_editar,
            'campi': Campus.objects.all().order_by('nome') if escopo['nivel'] == 'fundador' else None,
            'escopo': escopo,
        }

        if request.headers.get('X-Requested-With') == 'fetch':
            return render(request, 'dashboard/partials/usuario_modal.html', contexto)
        return render(request, 'dashboard/usuario_detalhe.html', contexto)

    def post(self, request, *args, **kwargs):
        usuario = self.get_usuario()
        escopo = self.escopo
        if escopo['nivel'] not in ('fundador', 'pastor_presidente'):
            raise PermissionDenied('Você não tem permissão pra editar esse cadastro.')

        usuario.nome_completo = request.POST.get('nome_completo', usuario.nome_completo).strip()
        usuario.email = request.POST.get('email', usuario.email).strip()

        if escopo['nivel'] == 'fundador':
            campus_id = request.POST.get('campus')
            if campus_id:
                usuario.campus_id = campus_id

        usuario.save()
        messages.success(request, f'Dados de {usuario.nome_completo} atualizados.')
        return redirect('dashboard:usuario_detalhe', pk=usuario.pk)