from django.contrib import messages
from django.core.exceptions import PermissionDenied
from django.http import Http404
from django.shortcuts import get_object_or_404, redirect, render
from django.views import View
from django.views.generic import ListView

from series.models import Episodio, Serie

from .forms_series import EpisodioForm, SerieForm
from .permissions import DashboardAccessMixin


class SerieListView(DashboardAccessMixin, ListView):
    model = Serie
    template_name = 'dashboard/series_list.html'
    context_object_name = 'series'
    secao_requerida = 'series'

    def get_queryset(self):
        qs = Serie.objects.select_related('campus').prefetch_related('episodios').order_by('campus__nome', '-data_lancamento')
        if self.escopo['campus'] is not None:
            qs = qs.filter(campus=self.escopo['campus'])
        return qs

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        escopo = self.escopo
        ctx['escopo'] = escopo
        ctx['pode_criar'] = escopo['pode_criar_conteudo']
        ctx['pode_editar'] = escopo['pode_editar_conteudo']

        if escopo['campus'] is None:
            agrupado = {}
            for serie in ctx['series']:
                agrupado.setdefault(serie.campus, []).append(serie)
            ctx['series_por_campus'] = sorted(agrupado.items(), key=lambda item: item[0].nome)
        else:
            ctx['series_por_campus'] = None

        return ctx


class SerieCriarView(DashboardAccessMixin, View):
    secao_requerida = 'series'

    def test_func(self):
        if not super().test_func():
            return False
        return self.escopo['pode_criar_conteudo']

    def get(self, request, *args, **kwargs):
        escopo = self.escopo
        form = SerieForm()
        if escopo['campus'] is not None:
            form.fields.pop('campus')
        contexto = {'form': form, 'escopo': escopo}
        if request.headers.get('X-Requested-With') == 'fetch':
            return render(request, 'dashboard/partials/serie_form_modal.html', contexto)
        return render(request, 'dashboard/serie_form.html', contexto)

    def post(self, request, *args, **kwargs):
        escopo = self.escopo
        form = SerieForm(request.POST, request.FILES)
        if escopo['campus'] is not None:
            form.fields.pop('campus')

        if form.is_valid():
            serie = form.save(commit=False)
            if escopo['campus'] is not None:
                serie.campus = escopo['campus']
            serie.save()
            messages.success(request, f'Série "{serie.titulo}" criada.')
            return redirect('dashboard:series')

        contexto = {'form': form, 'escopo': escopo}
        if request.headers.get('X-Requested-With') == 'fetch':
            return render(request, 'dashboard/partials/serie_form_modal.html', contexto)
        return render(request, 'dashboard/serie_form.html', contexto)


class SerieEditarView(DashboardAccessMixin, View):
    secao_requerida = 'series'

    def get_serie(self):
        escopo = self.escopo
        qs = Serie.objects.select_related('campus').prefetch_related('episodios')
        serie = get_object_or_404(qs, pk=self.kwargs['pk'])
        if escopo['campus'] is not None and serie.campus_id != escopo['campus'].id:
            raise Http404
        return serie

    def get(self, request, *args, **kwargs):
        serie = self.get_serie()
        escopo = self.escopo
        pode_editar = escopo['pode_editar_conteudo']

        form = SerieForm(instance=serie)
        if escopo['campus'] is not None:
            form.fields.pop('campus')
        if not pode_editar:
            for campo in form.fields.values():
                campo.disabled = True

        contexto = {
            'form': form, 'serie': serie, 'escopo': escopo,
            'episodio_form': EpisodioForm(), 'pode_editar': pode_editar,
        }
        return render(request, 'dashboard/serie_editar.html', contexto)

    def post(self, request, *args, **kwargs):
        serie = self.get_serie()
        escopo = self.escopo
        if not escopo['pode_editar_conteudo']:
            raise PermissionDenied('Você não tem permissão pra editar séries.')

        form = SerieForm(request.POST, request.FILES, instance=serie)
        if escopo['campus'] is not None:
            form.fields.pop('campus')

        if form.is_valid():
            serie = form.save(commit=False)
            if escopo['campus'] is not None:
                serie.campus = escopo['campus']
            serie.save()
            messages.success(request, f'Série "{serie.titulo}" atualizada.')
            return redirect('dashboard:serie_editar', pk=serie.pk)

        contexto = {
            'form': form, 'serie': serie, 'escopo': escopo,
            'episodio_form': EpisodioForm(), 'pode_editar': True,
        }
        return render(request, 'dashboard/serie_editar.html', contexto)


class SerieExcluirView(DashboardAccessMixin, View):
    secao_requerida = 'series'

    def test_func(self):
        if not super().test_func():
            return False
        return self.escopo['pode_editar_conteudo']

    def post(self, request, *args, **kwargs):
        escopo = self.escopo
        qs = Serie.objects.all()
        if escopo['campus'] is not None:
            qs = qs.filter(campus=escopo['campus'])
        serie = get_object_or_404(qs, pk=kwargs['pk'])
        titulo = serie.titulo
        serie.delete()
        messages.success(request, f'Série "{titulo}" excluída.')
        return redirect('dashboard:series')


class EpisodioCriarView(DashboardAccessMixin, View):
    secao_requerida = 'series'

    def test_func(self):
        if not super().test_func():
            return False
        return self.escopo['pode_editar_conteudo']

    def get_serie(self):
        escopo = self.escopo
        qs = Serie.objects.all()
        if escopo['campus'] is not None:
            qs = qs.filter(campus=escopo['campus'])
        return get_object_or_404(qs, pk=self.kwargs['serie_pk'])

    def post(self, request, *args, **kwargs):
        serie = self.get_serie()
        form = EpisodioForm(request.POST)
        if form.is_valid():
            episodio = form.save(commit=False)
            episodio.serie = serie
            episodio.save()
            messages.success(request, f'Episódio {episodio.numero} adicionado.')
        else:
            messages.error(request, 'Confere os dados do episódio — o número pode já existir nessa série.')
        return redirect('dashboard:serie_editar', pk=serie.pk)


class EpisodioEditarView(DashboardAccessMixin, View):
    secao_requerida = 'series'

    def test_func(self):
        if not super().test_func():
            return False
        return self.escopo['pode_editar_conteudo']

    def get_episodio(self):
        escopo = self.escopo
        qs = Episodio.objects.select_related('serie', 'serie__campus')
        episodio = get_object_or_404(qs, pk=self.kwargs['pk'])
        if escopo['campus'] is not None and episodio.serie.campus_id != escopo['campus'].id:
            raise Http404
        return episodio

    def get(self, request, *args, **kwargs):
        episodio = self.get_episodio()
        form = EpisodioForm(instance=episodio)
        contexto = {'form': form, 'episodio': episodio, 'escopo': self.escopo}
        return render(request, 'dashboard/partials/episodio_form_modal.html', contexto)

    def post(self, request, *args, **kwargs):
        episodio = self.get_episodio()
        form = EpisodioForm(request.POST, instance=episodio)
        if form.is_valid():
            form.save()
            messages.success(request, f'Episódio {episodio.numero} atualizado.')
        else:
            messages.error(request, 'Confere os dados do episódio.')
        return redirect('dashboard:serie_editar', pk=episodio.serie_id)


class EpisodioExcluirView(DashboardAccessMixin, View):
    secao_requerida = 'series'

    def test_func(self):
        if not super().test_func():
            return False
        return self.escopo['pode_editar_conteudo']

    def post(self, request, *args, **kwargs):
        escopo = self.escopo
        qs = Episodio.objects.select_related('serie')
        if escopo['campus'] is not None:
            qs = qs.filter(serie__campus=escopo['campus'])
        episodio = get_object_or_404(qs, pk=kwargs['pk'])
        serie_pk = episodio.serie_id
        episodio.delete()
        messages.success(request, 'Episódio removido.')
        return redirect('dashboard:serie_editar', pk=serie_pk)