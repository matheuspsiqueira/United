from django.contrib import messages
from django.contrib.auth.views import LoginView as DjangoLoginView
from django.contrib.auth import logout
from django.core.exceptions import PermissionDenied
from django.db.models import Count, Q
from django.db.models.deletion import ProtectedError
from django.http import Http404
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.utils import timezone
from django.views import View
from django.views.generic import ListView, TemplateView
from ugroups.models import UGroup


from campus.models import Campus
from departamentos.models import Departamento
from usuarios.models import (
    Usuario, CadastroPendente, CadastroVoluntario, VoluntarioPerfil,
    PermissaoIndividual, JanelaCandidaturaVoluntario,
)
from usuarios.utils import gerar_senha_provisoria, gerar_username
from .permissions import DashboardAccessMixin
from .services import data_inicio_periodo, get_escopo, permissoes_departamentos, CAMPOS_PERMISSAO, LABELS_PERMISSAO


class LoginView(DjangoLoginView):
    template_name = 'dashboard/login.html'
    redirect_authenticated_user = True

    def get_success_url(self):
        escopo = get_escopo(self.request.user)
        return reverse(escopo['redirect_pos_login'] or 'dashboard:login')


class LogoutView(View):
    def post(self, request, *args, **kwargs):
        logout(request)
        return redirect('dashboard:login')


class HomeView(DashboardAccessMixin, TemplateView):
    template_name = 'dashboard/home.html'
    secao_requerida = 'home'

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        escopo = self.escopo
        ctx['escopo'] = escopo

        todos_qs = Usuario.objects.all()
        voluntarios_qs = Usuario.objects.filter(role='voluntario')

        if escopo['campus'] is None:
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
        else:  # lider
            campus = escopo['campus']
            if escopo['visao_geral_voluntarios']:
                ctx['total_voluntarios'] = voluntarios_qs.filter(campus=campus).count()
            else:
                ctx['total_voluntarios'] = voluntarios_qs.filter(
                    campus=campus, voluntarioperfil__departamento__in=escopo['departamentos'],
                ).count()

        return ctx


class MembrosListView(DashboardAccessMixin, ListView):
    model = Usuario
    template_name = 'dashboard/membros_list.html'
    context_object_name = 'membros'
    paginate_by = 25
    secao_requerida = 'membros'

    def get_base_queryset(self):
        qs = Usuario.objects.select_related('campus')
        escopo = self.escopo

        if escopo['campus'] is not None:
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

        if escopo['campus'] is None:
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
    secao_requerida = 'membros_pendentes'

    def get_queryset(self):
        qs = CadastroPendente.objects.filter(status='pendente').select_related('campus').order_by('criado_em')
        escopo = self.escopo
        if escopo['campus'] is not None:
            qs = qs.filter(campus=escopo['campus'])
        return qs

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx['escopo'] = self.escopo
        return ctx


class CadastroPendenteAprovarView(DashboardAccessMixin, View):
    secao_requerida = 'membros_pendentes'

    def post(self, request, *args, **kwargs):
        escopo = self.escopo
        qs = CadastroPendente.objects.filter(status='pendente')
        if escopo['campus'] is not None:
            qs = qs.filter(campus=escopo['campus'])
        cadastro = get_object_or_404(qs, pk=kwargs['pk'])

        username = gerar_username(cadastro.nome_completo)
        senha = gerar_senha_provisoria()

        novo_usuario = Usuario(
            username=username,
            nome_completo=cadastro.nome_completo,
            campus=cadastro.campus,
            telefone=cadastro.telefone,
            idade=cadastro.idade,
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
    secao_requerida = 'voluntarios'

    def get_queryset(self):
        qs = (
            Usuario.objects.filter(role__in=('voluntario', 'lider'))
            .select_related('campus', 'voluntarioperfil__departamento')
            .prefetch_related('departamentos_liderados')
            .order_by('nome_completo')
        )
        escopo = self.escopo

        if escopo['campus'] is None:
            campus_id = self.request.GET.get('campus')
            if campus_id:
                qs = qs.filter(campus_id=campus_id)
        else:
            qs = qs.filter(campus=escopo['campus'])
            if not escopo['visao_geral_voluntarios']:
                qs = qs.filter(
                    Q(voluntarioperfil__departamento__in=escopo['departamentos'])
                    | Q(departamentos_liderados__in=escopo['departamentos'])
                ).distinct()

        departamento_id = self.request.GET.get('departamento')
        if departamento_id:
            qs = qs.filter(
                Q(voluntarioperfil__departamento_id=departamento_id)
                | Q(departamentos_liderados__id=departamento_id)
            ).distinct()

        busca = self.request.GET.get('q')
        if busca:
            qs = qs.filter(nome_completo__icontains=busca)

        return qs

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        escopo = self.escopo
        ctx['escopo'] = escopo
        ctx['pode_editar'] = escopo['pode_editar_membros']
        ctx['pode_gerenciar_permissoes'] = escopo['pode_gerenciar_permissoes']

        if escopo['campus'] is None:
            ctx['campi'] = Campus.objects.all().order_by('nome')

        ctx['departamentos'] = Departamento.objects.order_by('nome') if (
            escopo['campus'] is None or escopo['visao_geral_voluntarios']
        ) else None

        ctx['campus_selecionado'] = self.request.GET.get('campus', '')
        ctx['departamento_selecionado'] = self.request.GET.get('departamento', '')
        ctx['busca'] = self.request.GET.get('q', '')
        ctx['janela_aberta'] = JanelaCandidaturaVoluntario.esta_aberta()
        ctx['pode_gerenciar_formulario'] = escopo['pode_gerenciar_formulario_voluntario']
        return ctx


class UsuarioDetalheView(DashboardAccessMixin, View):
    def get_usuario(self):
        escopo = self.escopo
        qs = Usuario.objects.select_related('campus', 'voluntarioperfil__departamento')
        usuario = get_object_or_404(qs, pk=self.kwargs['pk'])

        if escopo['campus'] is None:
            return usuario

        if usuario.campus_id != escopo['campus'].id:
            raise Http404

        if usuario.role == 'voluntario' and not escopo['visao_geral_voluntarios']:
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
            'pode_editar': escopo['pode_editar_membros'],
            'pode_redefinir_senha': escopo['pode_redefinir_senha'],
            'campi': Campus.objects.all().order_by('nome') if escopo['campus'] is None else None,
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

        username_antigo = usuario.username
        novo_username = request.POST.get('username', usuario.username).strip()
        username_mudou = novo_username != username_antigo

        if username_mudou:
            if Usuario.objects.filter(username__iexact=novo_username).exclude(pk=usuario.pk).exists():
                messages.error(request, f'Já existe um usuário com o nome de usuário "{novo_username}".')
                return redirect('dashboard:usuario_detalhe', pk=usuario.pk)
            usuario.username = novo_username

        usuario.nome_completo = request.POST.get('nome_completo', usuario.nome_completo).strip()
        usuario.email = request.POST.get('email', usuario.email).strip()
        usuario.telefone = request.POST.get('telefone', usuario.telefone).strip()

        idade = request.POST.get('idade')
        usuario.idade = int(idade) if idade else None

        if 'foto_perfil' in request.FILES:
            usuario.foto_perfil = request.FILES['foto_perfil']

        if escopo['campus'] is None:
            campus_id = request.POST.get('campus')
            if campus_id:
                usuario.campus_id = campus_id

        usuario.save()

        if username_mudou:
            messages.warning(
                request,
                f'Nome de usuário alterado de "{username_antigo}" para "{novo_username}" — avise {usuario.nome_completo}, o login antigo deixa de funcionar.',
            )
        messages.success(request, f'Dados de {usuario.nome_completo} atualizados.')
        return redirect('dashboard:usuario_detalhe', pk=usuario.pk)


class UsuarioResetarSenhaView(DashboardAccessMixin, View):
    def post(self, request, *args, **kwargs):
        escopo = self.escopo
        if not escopo['pode_redefinir_senha']:
            raise PermissionDenied('Você não tem permissão pra redefinir essa senha.')

        qs = Usuario.objects.all()
        if escopo['campus'] is not None:
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


class CandidaturasVoluntarioListView(DashboardAccessMixin, ListView):
    model = CadastroVoluntario
    template_name = 'dashboard/voluntarios_pendentes.html'
    context_object_name = 'candidaturas'
    secao_requerida = 'voluntarios_pendentes'

    def get_queryset(self):
        qs = (
            CadastroVoluntario.objects.filter(status='pendente')
            .select_related(
                'membro', 'membro__campus', 'departamento_opcao_1',
                'departamento_opcao_2', 'departamento_opcao_3', 'departamento_fechado',
            )
            .order_by('criado_em')
        )
        escopo = self.escopo

        if escopo['campus'] is not None:
            qs = qs.filter(membro__campus=escopo['campus'])

        if escopo['nivel'] == 'lider':
            deptos_ids = [d.id for d in escopo['departamentos']]
            qs = qs.filter(
                Q(departamento_opcao_1_id__in=deptos_ids)
                | Q(departamento_opcao_2_id__in=deptos_ids)
                | Q(departamento_opcao_3_id__in=deptos_ids)
                | Q(departamento_fechado_id__in=deptos_ids)
            )

        return qs

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx['escopo'] = self.escopo
        return ctx


class CandidaturaVoluntarioDetalheView(DashboardAccessMixin, View):
    secao_requerida = 'voluntarios_pendentes'

    def get_candidatura(self):
        escopo = self.escopo
        qs = CadastroVoluntario.objects.select_related(
            'membro', 'membro__campus', 'departamento_opcao_1',
            'departamento_opcao_2', 'departamento_opcao_3', 'departamento_fechado',
        )
        candidatura = get_object_or_404(qs, pk=self.kwargs['pk'], status='pendente')

        if escopo['campus'] is not None and candidatura.membro.campus_id != escopo['campus'].id:
            raise Http404

        if escopo['nivel'] == 'lider':
            deptos_ids = {d.id for d in escopo['departamentos']}
            opcoes_ids = {
                candidatura.departamento_opcao_1_id, candidatura.departamento_opcao_2_id,
                candidatura.departamento_opcao_3_id, candidatura.departamento_fechado_id,
            }
            if not deptos_ids & opcoes_ids:
                raise Http404

        return candidatura

    def get(self, request, *args, **kwargs):
        candidatura = self.get_candidatura()
        escopo = self.escopo

        opcoes = [
            candidatura.departamento_opcao_1, candidatura.departamento_opcao_2,
            candidatura.departamento_opcao_3, candidatura.departamento_fechado,
        ]
        departamentos_disponiveis = [d for d in opcoes if d is not None]

        if escopo['nivel'] == 'lider':
            deptos_lider_ids = {d.id for d in escopo['departamentos']}
            departamentos_disponiveis = [d for d in departamentos_disponiveis if d.id in deptos_lider_ids]

        contexto = {
            'candidatura': candidatura,
            'usuario_alvo': candidatura.membro,
            'departamentos_disponiveis': departamentos_disponiveis,
            'escopo': escopo,
        }

        if request.headers.get('X-Requested-With') == 'fetch':
            return render(request, 'dashboard/partials/candidatura_voluntario_modal.html', contexto)
        return render(request, 'dashboard/candidatura_voluntario_detalhe.html', contexto)

    def post(self, request, *args, **kwargs):
        candidatura = self.get_candidatura()
        escopo = self.escopo
        acao = request.POST.get('acao')

        if acao == 'recusar':
            candidatura.status = 'recusado'
            candidatura.save(update_fields=['status'])
            messages.success(request, f'Candidatura de {candidatura.membro.nome_completo} recusada.')
            return redirect('dashboard:voluntarios_pendentes')

        departamento_id = request.POST.get('departamento')
        opcoes_ids = {
            candidatura.departamento_opcao_1_id, candidatura.departamento_opcao_2_id,
            candidatura.departamento_opcao_3_id, candidatura.departamento_fechado_id,
        }
        if not departamento_id or int(departamento_id) not in opcoes_ids:
            raise PermissionDenied('Escolha um dos departamentos indicados na candidatura.')

        if escopo['nivel'] == 'lider':
            deptos_lider_ids = {d.id for d in escopo['departamentos']}
            if int(departamento_id) not in deptos_lider_ids:
                raise PermissionDenied('Você só pode aprovar para um departamento que você lidera.')

        membro = candidatura.membro
        VoluntarioPerfil.objects.update_or_create(
            usuario=membro,
            defaults={'departamento_id': departamento_id, 'data_aprovacao': timezone.now().date()},
        )
        membro.role = 'voluntario'
        membro.save(update_fields=['role'])

        candidatura.status = 'aprovado'
        candidatura.departamento_aprovado_id = departamento_id
        candidatura.aprovado_por = request.user
        candidatura.save(update_fields=['status', 'departamento_aprovado', 'aprovado_por'])

        messages.success(
            request,
            f'{membro.nome_completo} agora é voluntário(a) — departamento: {candidatura.departamento_aprovado.nome}.',
        )
        return redirect('dashboard:voluntarios_pendentes')


class UsuarioPermissoesView(DashboardAccessMixin, View):
    def test_func(self):
        if not super().test_func():
            return False
        return self.escopo['pode_gerenciar_permissoes']

    def get_usuario(self):
        escopo = self.escopo
        qs = Usuario.objects.filter(role__in=('voluntario', 'lider')).select_related(
            'campus', 'voluntarioperfil__departamento',
        ).prefetch_related('departamentos_liderados', 'ugroups_liderados')
        usuario = get_object_or_404(qs, pk=self.kwargs['pk'])
        if escopo['campus'] is not None and usuario.campus_id != escopo['campus'].id:
            raise Http404
        return usuario

    def get(self, request, *args, **kwargs):
        usuario = self.get_usuario()
        escopo = self.escopo

        overrides_obj = getattr(usuario, 'permissao_individual', None)
        overrides = {
            campo: getattr(overrides_obj, campo, None)
            for campo in ('acesso_dashboard', 'aprova_membros', 'edita_membros', 'visao_geral_voluntarios')
        }

        if usuario.role == 'voluntario':
            departamento = usuario.voluntarioperfil.departamento if hasattr(usuario, 'voluntarioperfil') else None
            base_flags = permissoes_departamentos([departamento] if departamento else [])
        else:
            base_flags = permissoes_departamentos(list(usuario.departamentos_liderados.all()))

        contexto = {
            'usuario_alvo': usuario,
            'overrides': overrides,
            'base_flags': base_flags,
            'departamento_atual': usuario.voluntarioperfil.departamento if usuario.role == 'voluntario' and hasattr(usuario, 'voluntarioperfil') else None,
            'departamentos_liderados_atual': usuario.departamentos_liderados.all(),
            'departamentos_disponiveis': Departamento.objects.order_by('nome'),
            'ugroups_liderados_atual': usuario.ugroups_liderados.filter(ativo=True).order_by('nome'),
            'ugroups_disponiveis': UGroup.objects.filter(
                campus=usuario.campus, ativo=True
            ).exclude(lideres=usuario).order_by('nome'),
            'escopo': escopo,
        }

        if request.headers.get('X-Requested-With') == 'fetch':
            return render(request, 'dashboard/partials/usuario_permissoes_modal.html', contexto)
        return render(request, 'dashboard/usuario_permissoes.html', contexto)

    def post(self, request, *args, **kwargs):
        usuario = self.get_usuario()
        acao = request.POST.get('acao')

        if acao == 'salvar_flags':
            overrides, _ = PermissaoIndividual.objects.get_or_create(usuario=usuario)
            for campo in ('acesso_dashboard', 'aprova_membros', 'edita_membros', 'visao_geral_voluntarios'):
                valor = request.POST.get(campo)
                if valor == 'sim':
                    setattr(overrides, campo, True)
                elif valor == 'nao':
                    setattr(overrides, campo, False)
                else:
                    setattr(overrides, campo, None)
            overrides.save()
            messages.success(request, f'Permissões de {usuario.nome_completo} atualizadas.')

        elif acao == 'tornar_lider':
            if usuario.role != 'voluntario':
                raise PermissionDenied('Só é possível promover quem já é voluntário.')
            departamentos_ids = request.POST.getlist('departamentos_lideranca')
            if not departamentos_ids:
                raise PermissionDenied('Selecione ao menos um departamento pra liderar.')
            usuario.role = 'lider'
            usuario.save(update_fields=['role'])
            usuario.departamentos_liderados.set(departamentos_ids)
            VoluntarioPerfil.objects.filter(usuario=usuario).delete()
            messages.success(request, f'{usuario.nome_completo} agora é líder.')

        elif acao == 'remover_lideranca':
            if usuario.role != 'lider':
                raise PermissionDenied('Esse usuário não é líder.')
            novo_role = request.POST.get('novo_role')
            usuario.departamentos_liderados.clear()

            if novo_role == 'voluntario':
                departamento_id = request.POST.get('departamento_voluntario')
                if not departamento_id:
                    raise PermissionDenied('Selecione o departamento em que a pessoa continuará como voluntária.')
                usuario.role = 'voluntario'
                usuario.save(update_fields=['role'])
                VoluntarioPerfil.objects.update_or_create(
                    usuario=usuario,
                    defaults={'departamento_id': departamento_id, 'data_aprovacao': timezone.now().date()},
                )
            else:
                usuario.role = 'membro'
                usuario.save(update_fields=['role'])
                VoluntarioPerfil.objects.filter(usuario=usuario).delete()
                PermissaoIndividual.objects.filter(usuario=usuario).delete()

            messages.success(request, f'Liderança de {usuario.nome_completo} removida.')

        elif acao == 'tornar_lider_ugroup':
            if usuario.role not in ('voluntario', 'lider'):
                raise PermissionDenied('Só é possível tornar líder quem já é voluntário ou líder.')
            ugroups_ids = request.POST.getlist('ugroups_lideranca')
            if not ugroups_ids:
                raise PermissionDenied('Selecione ao menos um uGroup pra liderar.')
            ugroups = UGroup.objects.filter(pk__in=ugroups_ids, campus=usuario.campus)
            for ugroup in ugroups:
                ugroup.lideres.add(usuario)
            if usuario.role == 'voluntario':
                usuario.role = 'lider'
                usuario.save(update_fields=['role'])
                VoluntarioPerfil.objects.filter(usuario=usuario).delete()
            messages.success(request, f'{usuario.nome_completo} agora lidera {ugroups.count()} uGroup(s).')

        elif acao == 'remover_lideranca_ugroup':
            ugroup_id = request.POST.get('ugroup_id')
            ugroup = get_object_or_404(UGroup, pk=ugroup_id, campus=usuario.campus)
            if usuario not in ugroup.lideres.all():
                raise PermissionDenied('Esse usuário não lidera esse uGroup.')

            resta_outra_lideranca = (
                usuario.departamentos_liderados.exists()
                or usuario.ugroups_liderados.exclude(pk=ugroup.pk).exists()
            )

            if resta_outra_lideranca:
                ugroup.lideres.remove(usuario)
                messages.success(request, f'{usuario.nome_completo} não lidera mais {ugroup.nome}.')
            else:
                novo_role = request.POST.get('novo_role_ugroup')
                if novo_role == 'voluntario':
                    departamento_id = request.POST.get('departamento_voluntario_ugroup')
                    if not departamento_id:
                        raise PermissionDenied('Selecione o departamento em que a pessoa continuará como voluntária.')
                    ugroup.lideres.remove(usuario)
                    usuario.role = 'voluntario'
                    usuario.save(update_fields=['role'])
                    VoluntarioPerfil.objects.update_or_create(
                        usuario=usuario,
                        defaults={'departamento_id': departamento_id, 'data_aprovacao': timezone.now().date()},
                    )
                elif novo_role == 'membro':
                    ugroup.lideres.remove(usuario)
                    usuario.role = 'membro'
                    usuario.save(update_fields=['role'])
                    VoluntarioPerfil.objects.filter(usuario=usuario).delete()
                    PermissaoIndividual.objects.filter(usuario=usuario).delete()
                else:
                    raise PermissionDenied(
                        'Essa é a última liderança dessa pessoa — escolha se ela vira voluntária '
                        'de algum departamento ou membro.'
                    )
                messages.success(request, f'Liderança de uGroup de {usuario.nome_completo} removida.')

        return redirect('dashboard:voluntarios')


class CandidaturaVoluntarioIdentificarView(View):
    def get(self, request):
        if not JanelaCandidaturaVoluntario.esta_aberta():
            return render(request, 'dashboard/candidatura_fechada.html')
        return render(request, 'dashboard/candidatura_identificar.html')

    def post(self, request):
        if not JanelaCandidaturaVoluntario.esta_aberta():
            return render(request, 'dashboard/candidatura_fechada.html')

        username = request.POST.get('username', '').strip()
        usuario = Usuario.objects.filter(username__iexact=username).first()

        if not usuario:
            messages.error(request, 'Usuário não encontrado. Confere se digitou certo.')
            return render(request, 'dashboard/candidatura_identificar.html')

        if usuario.role != 'membro':
            messages.error(request, 'Esse usuário já é voluntário, líder ou tem outro papel — não dá pra se candidatar de novo.')
            return render(request, 'dashboard/candidatura_identificar.html')

        if CadastroVoluntario.objects.filter(membro=usuario, status='pendente').exists():
            messages.error(request, 'Já existe uma candidatura pendente pra esse usuário. Aguarde um líder entrar em contato.')
            return render(request, 'dashboard/candidatura_identificar.html')

        return redirect('candidatura:formulario', usuario_id=usuario.pk)


class CandidaturaVoluntarioFormularioView(View):
    def get_membro(self, usuario_id):
        usuario = get_object_or_404(Usuario, pk=usuario_id)
        return usuario if usuario.role == 'membro' else None

    def get(self, request, usuario_id):
        if not JanelaCandidaturaVoluntario.esta_aberta():
            return render(request, 'dashboard/candidatura_fechada.html')

        membro = self.get_membro(usuario_id)
        if not membro:
            messages.error(request, 'Esse cadastro não está mais disponível pra candidatura.')
            return redirect('candidatura:identificar')

        contexto = {
            'membro': membro,
            'abertos': Departamento.objects.filter(tipo='aberto').order_by('nome'),
            'fechados': Departamento.objects.filter(tipo='fechado').order_by('nome'),
        }
        return render(request, 'dashboard/candidatura_formulario.html', contexto)

    def post(self, request, usuario_id):
        if not JanelaCandidaturaVoluntario.esta_aberta():
            return render(request, 'dashboard/candidatura_fechada.html')

        membro = self.get_membro(usuario_id)
        if not membro:
            messages.error(request, 'Esse cadastro não está mais disponível pra candidatura.')
            return redirect('candidatura:identificar')

        if request.POST.get('aceitou_termo') != 'sim':
            messages.error(request, 'É preciso concordar com o termo de compromisso pra continuar.')
            return redirect('candidatura:formulario', usuario_id=membro.pk)

        abertos_ids = set(
            Departamento.objects.filter(tipo='aberto').values_list('id', flat=True)
        )
        fechados_ids = set(
            Departamento.objects.filter(tipo='fechado').values_list('id', flat=True)
        )

        opcao_1 = request.POST.get('departamento_opcao_1')
        opcao_2 = request.POST.get('departamento_opcao_2')
        opcao_3 = request.POST.get('departamento_opcao_3')
        fechado = request.POST.get('departamento_fechado') or None

        for valor in (opcao_1, opcao_2, opcao_3):
            if not valor or int(valor) not in abertos_ids:
                messages.error(request, 'Escolha as 3 opções de departamento aberto.')
                return redirect('candidatura:formulario', usuario_id=membro.pk)

        if fechado and int(fechado) not in fechados_ids:
            messages.error(request, 'Departamento fechado inválido.')
            return redirect('candidatura:formulario', usuario_id=membro.pk)

        CadastroVoluntario.objects.create(
            membro=membro,
            departamento_opcao_1_id=opcao_1,
            departamento_opcao_2_id=opcao_2,
            departamento_opcao_3_id=opcao_3,
            departamento_fechado_id=fechado,
            aceitou_termo=True,
        )

        return render(request, 'dashboard/candidatura_sucesso.html', {'membro': membro})


class JanelaCandidaturaToggleView(DashboardAccessMixin, View):
    def test_func(self):
        if not super().test_func():
            return False
        return self.escopo['pode_gerenciar_formulario_voluntario']

    def post(self, request, *args, **kwargs):
        janela, _ = JanelaCandidaturaVoluntario.objects.get_or_create(pk=1)
        janela.aberta = not janela.aberta
        janela.save(update_fields=['aberta'])

        if janela.aberta:
            messages.success(request, 'Formulário de candidatura a voluntário habilitado.')
        else:
            messages.success(request, 'Formulário de candidatura a voluntário desabilitado.')

        return redirect('dashboard:voluntarios')


class DepartamentosListView(DashboardAccessMixin, ListView):
    model = Departamento
    template_name = 'dashboard/departamentos_list.html'
    context_object_name = 'departamentos'
    secao_requerida = 'departamentos'

    def get_queryset(self):
        return Departamento.objects.prefetch_related('lideres', 'lideres__campus').order_by('nome')

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx['escopo'] = self.escopo
        return ctx


class DepartamentoFormView(DashboardAccessMixin, View):
    secao_requerida = 'departamentos'

    def get_departamento(self):
        pk = self.kwargs.get('pk')
        return get_object_or_404(Departamento, pk=pk) if pk else None

    def get(self, request, *args, **kwargs):
        departamento = self.get_departamento()

        campos_flags = [
            {
                'nome': campo,
                'label': LABELS_PERMISSAO[campo],
                'valor': getattr(departamento, campo, False) if departamento else False,
            }
            for campo in CAMPOS_PERMISSAO
        ]

        contexto = {
            'departamento': departamento,
            'campos_flags': campos_flags,
            'lideres_atuais': departamento.lideres.select_related('campus').all() if departamento else None,
            'escopo': self.escopo,
        }
        if request.headers.get('X-Requested-With') == 'fetch':
            return render(request, 'dashboard/partials/departamento_modal.html', contexto)
        return render(request, 'dashboard/departamento_form.html', contexto)

    def post(self, request, *args, **kwargs):
        departamento = self.get_departamento()
        nome = request.POST.get('nome', '').strip()
        tipo = request.POST.get('tipo')

        if not nome or tipo not in ('aberto', 'fechado'):
            messages.error(request, 'Preencha nome e tipo do departamento.')
            return redirect('dashboard:departamentos')

        ja_existe = Departamento.objects.filter(nome__iexact=nome)
        if departamento:
            ja_existe = ja_existe.exclude(pk=departamento.pk)
        if ja_existe.exists():
            messages.error(request, 'Já existe um departamento com esse nome.')
            return redirect('dashboard:departamentos')

        if departamento is None:
            departamento = Departamento(nome=nome, tipo=tipo)
        else:
            departamento.nome = nome
            departamento.tipo = tipo

        for campo in CAMPOS_PERMISSAO:
            setattr(departamento, campo, request.POST.get(campo) == 'sim')

        departamento.save()

        messages.success(request, f'Departamento "{departamento.nome}" salvo.')
        return redirect('dashboard:departamentos')


class DepartamentoExcluirView(DashboardAccessMixin, View):
    secao_requerida = 'departamentos'

    def post(self, request, *args, **kwargs):
        departamento = get_object_or_404(Departamento, pk=kwargs['pk'])
        nome = departamento.nome
        try:
            departamento.delete()
        except ProtectedError:
            messages.error(
                request,
                f'Não é possível excluir "{nome}": há voluntários ou candidaturas vinculadas a esse departamento.',
            )
            return redirect('dashboard:departamentos')

        messages.success(request, f'Departamento "{nome}" excluído.')
        return redirect('dashboard:departamentos')