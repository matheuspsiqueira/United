from datetime import date

from django.contrib.auth.decorators import login_required
from django.core.exceptions import PermissionDenied
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404, redirect, render

from campus.models import Campus
from ugroups.models import UGroup, UGroupMembro, UGroupEncontro, UGroupPresenca

from .forms_ugroups import (
    UGroupForm, UGroupLiderAdicionarForm,
    UGroupMembroAdicionarForm, UGroupFrequenciaDataForm,
)
from .services import get_escopo


def _eh_dono_ugroups(escopo):
    return escopo['nivel'] in ('apostolo', 'pastor_presidente')


def _pode_gerenciar_ugroup(usuario, ugroup):
    if usuario.role == 'apostolo':
        return True
    if usuario.role == 'pastor_presidente':
        return ugroup.campus_id == usuario.campus_id
    return usuario in ugroup.lideres.all()


def _ugroup_gerenciavel_ou_404(request, pk):
    ugroup = get_object_or_404(UGroup, pk=pk)
    if not _pode_gerenciar_ugroup(request.user, ugroup):
        raise PermissionDenied('Você não tem acesso a esse uGroup.')
    return ugroup


@login_required
def ugroups_lista(request):
    escopo = get_escopo(request.user)
    if 'ugroups' not in escopo['secoes_visiveis']:
        raise PermissionDenied

    if escopo['nivel'] == 'apostolo':
        qs = UGroup.objects.filter(ativo=True).select_related('campus').order_by('campus__nome', 'nome')
        campus_filtro = request.GET.get('campus')
        campus_filtro_id = int(campus_filtro) if campus_filtro else None
        if campus_filtro_id:
            qs = qs.filter(campus_id=campus_filtro_id)
            ugroups_por_campus = None
        else:
            agrupado = {}
            for ugroup in qs:
                agrupado.setdefault(ugroup.campus, []).append(ugroup)
            ugroups_por_campus = sorted(agrupado.items(), key=lambda item: item[0].nome)
            qs = None
        contexto = {
            'ugroups': qs, 'ugroups_por_campus': ugroups_por_campus, 'pode_gerenciar': True,
            'campi': Campus.objects.order_by('nome'), 'campus_filtro_id': campus_filtro_id,
        }

    elif escopo['nivel'] == 'pastor_presidente':
        ugroups = UGroup.objects.filter(campus=escopo['campus'], ativo=True).order_by('nome')
        contexto = {'ugroups': ugroups, 'ugroups_por_campus': None, 'pode_gerenciar': True}

    else:
        ugroups = UGroup.objects.filter(lideres=request.user, ativo=True).order_by('nome')
        contexto = {'ugroups': ugroups, 'ugroups_por_campus': None, 'pode_gerenciar': False}

    contexto['escopo'] = escopo
    return render(request, 'dashboard/ugroups.html', contexto)


@login_required
def ugroup_detalhe(request, pk):
    ugroup = get_object_or_404(UGroup.objects.select_related('campus').prefetch_related('lideres'), pk=pk)
    if not _pode_gerenciar_ugroup(request.user, ugroup):
        raise PermissionDenied('Você não tem acesso a esse uGroup.')

    escopo = get_escopo(request.user)
    encontros = ugroup.encontros.annotate(
        total_presentes=Count('presencas', filter=Q(presencas__presente=True))
    )[:10]
    contexto = {
        'ugroup': ugroup, 'encontros': encontros, 'escopo': escopo,
        'pode_editar_ugroup': _eh_dono_ugroups(escopo),
    }
    return render(request, 'dashboard/ugroup_detalhe.html', contexto)


@login_required
def ugroup_criar(request):
    escopo = get_escopo(request.user)
    if not _eh_dono_ugroups(escopo):
        raise PermissionDenied

    if request.method == 'POST':
        form = UGroupForm(request.POST)
        if escopo['campus'] is not None:
            form.fields.pop('campus')
        if form.is_valid():
            ugroup = form.save(commit=False)
            if escopo['campus'] is not None:
                ugroup.campus = escopo['campus']
            ugroup.save()
            return redirect('dashboard:ugroup_detalhe', pk=ugroup.pk)
    else:
        form = UGroupForm()
        if escopo['campus'] is not None:
            form.fields.pop('campus')

    contexto = {'form': form, 'escopo': escopo}
    if request.headers.get('X-Requested-With') == 'fetch':
        return render(request, 'dashboard/partials/ugroup_form_modal.html', contexto)
    return render(request, 'dashboard/ugroup_form.html', contexto)


@login_required
def ugroup_editar(request, pk):
    escopo = get_escopo(request.user)
    if not _eh_dono_ugroups(escopo):
        raise PermissionDenied

    qs = UGroup.objects.all()
    if escopo['campus'] is not None:
        qs = qs.filter(campus=escopo['campus'])
    ugroup = get_object_or_404(qs, pk=pk)

    if request.method == 'POST':
        form = UGroupForm(request.POST, instance=ugroup)
        if escopo['campus'] is not None:
            form.fields.pop('campus')
        if form.is_valid():
            ugroup = form.save(commit=False)
            if escopo['campus'] is not None:
                ugroup.campus = escopo['campus']
            ugroup.save()
            return redirect('dashboard:ugroup_detalhe', pk=ugroup.pk)
    else:
        form = UGroupForm(instance=ugroup)
        if escopo['campus'] is not None:
            form.fields.pop('campus')

    contexto = {'form': form, 'ugroup': ugroup, 'escopo': escopo}
    return render(request, 'dashboard/ugroup_form.html', contexto)


@login_required
def ugroup_excluir(request, pk):
    escopo = get_escopo(request.user)
    if not _eh_dono_ugroups(escopo):
        raise PermissionDenied

    qs = UGroup.objects.all()
    if escopo['campus'] is not None:
        qs = qs.filter(campus=escopo['campus'])
    ugroup = get_object_or_404(qs, pk=pk)
    if request.method == 'POST':
        ugroup.delete()
        return redirect('dashboard:ugroups')
    return redirect('dashboard:ugroup_detalhe', pk=pk)


@login_required
def ugroup_lider_adicionar(request, pk):
    escopo = get_escopo(request.user)
    if not _eh_dono_ugroups(escopo):
        raise PermissionDenied
    ugroup = _ugroup_gerenciavel_ou_404(request, pk)

    if request.method == 'POST':
        form = UGroupLiderAdicionarForm(request.POST, ugroup=ugroup)
        if form.is_valid():
            form.save()
            return redirect('dashboard:ugroup_detalhe', pk=ugroup.pk)
    else:
        form = UGroupLiderAdicionarForm(ugroup=ugroup)
    return render(request, 'dashboard/partials/ugroup_lider_adicionar.html', {'ugroup': ugroup, 'form': form})


@login_required
def ugroup_lider_remover(request, pk, lider_pk):
    escopo = get_escopo(request.user)
    if not _eh_dono_ugroups(escopo):
        raise PermissionDenied
    ugroup = _ugroup_gerenciavel_ou_404(request, pk)
    if request.method == 'POST':
        ugroup.lideres.remove(lider_pk)
    return redirect('dashboard:ugroup_detalhe', pk=ugroup.pk)


@login_required
def ugroup_membro_adicionar(request, pk):
    ugroup = _ugroup_gerenciavel_ou_404(request, pk)
    if request.method == 'POST':
        form = UGroupMembroAdicionarForm(request.POST, ugroup=ugroup)
        if form.is_valid():
            form.save()
            return redirect('dashboard:ugroup_detalhe', pk=ugroup.pk)
    else:
        form = UGroupMembroAdicionarForm(ugroup=ugroup)
    return render(request, 'dashboard/partials/ugroup_membro_adicionar.html', {'ugroup': ugroup, 'form': form})


@login_required
def ugroup_membros_editar(request, pk):
    ugroup = _ugroup_gerenciavel_ou_404(request, pk)
    membros = ugroup.membros.filter(ativo=True).select_related('usuario')
    return render(request, 'dashboard/partials/ugroup_membros_editar.html', {'ugroup': ugroup, 'membros': membros})


@login_required
def ugroup_membro_remover(request, pk, membro_pk):
    ugroup = _ugroup_gerenciavel_ou_404(request, pk)
    membro = get_object_or_404(UGroupMembro, pk=membro_pk, ugroup=ugroup)
    if request.method == 'POST':
        membro.delete()
    return redirect('dashboard:ugroup_detalhe', pk=ugroup.pk)


@login_required
def ugroup_frequencia_registrar(request, pk):
    ugroup = _ugroup_gerenciavel_ou_404(request, pk)
    membros = ugroup.membros.filter(ativo=True).select_related('usuario')

    if request.method == 'POST':
        data_form = UGroupFrequenciaDataForm(request.POST)
        if data_form.is_valid():
            encontro, _ = UGroupEncontro.objects.get_or_create(
                ugroup=ugroup, data=data_form.cleaned_data['data'],
                defaults={'registrado_por': request.user},
            )
            for membro in membros:
                UGroupPresenca.objects.update_or_create(
                    encontro=encontro, membro=membro,
                    defaults={'presente': f'presente_{membro.pk}' in request.POST},
                )
            return redirect('dashboard:ugroup_detalhe', pk=ugroup.pk)
    else:
        data_form = UGroupFrequenciaDataForm(initial={'data': date.today()})

    return render(
        request, 'dashboard/partials/ugroup_frequencia_registrar.html',
        {'ugroup': ugroup, 'membros': membros, 'data_form': data_form},
    )