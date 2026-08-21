from django.contrib import messages
from django.contrib.auth.views import LoginView as DjangoLoginView
from django.contrib.auth import logout
from django.core.exceptions import PermissionDenied
from django.db.models import Count
from django.http import Http404
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.utils import timezone
from django.views import View
from django.views.generic import ListView, TemplateView

from campus.models import Campus
from departamentos.models import Departamento
from usuarios.models import Usuario, CadastroPendente
from usuarios.utils import gerar_senha_provisoria, gerar_username
from .permissions import DashboardAccessMixin
from .services import data_inicio_periodo, get_escopo


class LoginView(DjangoLoginView):
    template_name = 'dashboard/login.html'
    redirect_authenticated_user = True

    def get_success_url(self):
        escopo = get_escopo(self.request.user)
        url_name = escopo['redirect_pos_login'] or 'dashboard:home'
        return reverse(url_name)


class LogoutView(View):
    def post(self, request, *args, **kwargs):
        logout(request)
        return redirect('dashboard:login')


class HomeView(DashboardAccessMixin, TemplateView):
    template_name = 'dashboard/home.html'
    secao = 'home'

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
    secao = 'membros'

    def get_base_queryset(self):
        qs = Usuario.objects.select_related('campus')
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

    def get_queryset(self):
        qs = self.get_base_queryset()

        ano = self.request.GET.get('ano')
        mes = self.request.GET.get('mes')
        periodo = self.request.GET.get('periodo')

        if ano:
            qs = qs.filter(date_joined__year=ano)
            if mes:
                qs = qs.filter(date_joined__month=mes)
        elif periodo:
            inicio = data_inicio_periodo(periodo, timezone.now())
            if inicio:
                qs = qs.filter(date_joined__gte=inicio)

        ordenar = self.request.GET.get('ordenar', 'nome')
        if ordenar == 'recentes':
            qs = qs.order_by('-date_joined')
        elif ordenar == 'antigos':
            qs = qs.order_by('date_joined')
        else:
            qs = qs.order_by('nome_completo')

        return qs

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        escopo = self.escopo
        ctx['escopo'] = escopo
        ctx['pode_editar'] = escopo['pode_editar_membros']

        base_qs = self.get_base_queryset()
        agora = timezone.now()
        ctx['total_membros'] = base_qs.count()
        ctx['entraram_mes'] = base_qs.filter(
            date_joined__year=agora.year, date_joined__month=agora.month,
        ).count()

        ctx['anos_disponiveis'] = [d.year for d in base_qs.dates('date_joined', 'year', order='DESC')]
        ctx['meses'] = [
            (1, 'Janeiro'), (2, 'Fevereiro'), (3, 'Março'), (4, 'Abril'), (5, 'Maio'), (6, 'Junho'),
            (7, 'Julho'), (8, 'Agosto'), (9, 'Setembro'), (10, 'Outubro'), (11, 'Novembro'), (12, 'Dezembro'),
        ]

        if escopo['nivel'] == 'fundador':
            ctx['campi'] = Campus.objects.all().order_by('nome')

        ctx['campus_selecionado'] = self.request.GET.get('campus', '')
        ctx['busca'] = self.request.GET.get('q', '')
        ctx['periodo_selecionado'] = self.request.GET.get('periodo', '')
        ctx['ano_selecionado'] = self.request.GET.get('ano', '')
        ctx['mes_selecionado'] = self.request.GET.get('mes', '')
        ctx['ordenar_selecionado'] = self.request.GET.get('ordenar', 'nome')

        params = self.request.GET.copy()
        params.pop('page', None)
        ctx['querystring'] = params.urlencode()

        return ctx


class CadastrosPendentesListView(DashboardAccessMixin, ListView):
    model = CadastroPendente
    template_name = 'dashboard/membros_pendentes.html'
    context_object_name = 'cadastros'
    secao = 'membros_pendentes'

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


class CadastroPendenteAprovarView(DashboardAccessMixin, View):
    secao = 'membros_pendentes'

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
    secao = 'voluntarios'

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
        ctx['pode_editar'] = escopo['pode_editar_membros']

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

        if usuario.role == 'membro' and 'membros' not in escopo['secoes_visiveis']:
            raise Http404
        if usuario.role == 'voluntario' and 'voluntarios' not in escopo['secoes_visiveis']:
            raise Http404

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

        contexto = {
            'usuario_alvo': usuario,
            'pode_editar_membros': escopo['pode_editar_membros'],
            'pode_redefinir_senha': escopo['pode_redefinir_senha'],
            'campi': Campus.objects.all().order_by('nome') if escopo['nivel'] == 'fundador' else None,
            'escopo': escopo,
        }

        if request.headers.get('X-Requested-With') == 'fetch':
            return render(request, 'dashboard/partials/usuario_modal.html', contexto)
        return render(request, 'dashboard/usuario_detalhe.html', contexto)

    def post(self, request, *args, **kwargs):
        usuario = self.get_usuario()
        escopo = self.escopo
        if not escopo['pode_editar_membros']:
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


class UsuarioResetarSenhaView(DashboardAccessMixin, View):
    def post(self, request, *args, **kwargs):
        escopo = self.escopo
        if not escopo['pode_redefinir_senha']:
            raise PermissionDenied('Você não tem permissão pra redefinir essa senha.')

        qs = Usuario.objects.all()
        if escopo['nivel'] != 'fundador':
            qs = qs.filter(campus=escopo['campus'])
        usuario = get_object_or_404(qs, pk=kwargs['pk'])

        nova_senha = gerar_senha_provisoria()
        usuario.set_password(nova_senha)
        usuario.senha_temporaria = True
        usuario.save()

        messages.success(
            request,
            f'Senha de {usuario.nome_completo} redefinida — nova senha provisória: {nova_senha} (anote agora, não aparece de novo).',
        )
        return redirect('dashboard:usuario_detalhe', pk=usuario.pk)