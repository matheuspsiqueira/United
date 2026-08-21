import calendar
from datetime import timedelta

ORDEM_SECOES_REDIRECT = [
    ('membros_pendentes', 'dashboard:membros_pendentes'),
    ('membros', 'dashboard:membros'),
    ('voluntarios', 'dashboard:voluntarios'),
]


def _escopo_sem_acesso(usuario):
    return {
        'nivel': None, 'label': 'Sem acesso', 'campus': usuario.campus, 'departamentos': [],
        'visao_geral_voluntarios': False, 'pode_aprovar_membros': False, 'pode_editar_membros': False,
        'pode_redefinir_senha': False, 'acesso_dashboard': False, 'secoes_visiveis': [],
        'redirect_pos_login': None,
    }


def get_escopo(usuario):
    nivel = usuario.nivel_acesso

    if nivel == 'fundador':
        return {
            'nivel': nivel, 'label': 'Fundador', 'campus': None, 'departamentos': [],
            'visao_geral_voluntarios': True, 'pode_aprovar_membros': True, 'pode_editar_membros': True,
            'pode_redefinir_senha': True, 'acesso_dashboard': True,
            'secoes_visiveis': ['home', 'membros_pendentes', 'membros', 'voluntarios'],
            'redirect_pos_login': 'dashboard:home',
        }

    if nivel == 'pastor_presidente':
        return {
            'nivel': nivel, 'label': 'Pastor presidente', 'campus': usuario.campus, 'departamentos': [],
            'visao_geral_voluntarios': False, 'pode_aprovar_membros': True, 'pode_editar_membros': True,
            'pode_redefinir_senha': True, 'acesso_dashboard': True,
            'secoes_visiveis': ['home', 'membros_pendentes', 'membros', 'voluntarios'],
            'redirect_pos_login': 'dashboard:home',
        }

    if nivel == 'lider':
        departamentos = list(usuario.departamentos_liderados.all())
        visao_geral = any(d.visao_geral_voluntarios for d in departamentos)
        aprova_membros = any(d.aprova_membros for d in departamentos)
        edita_membros = any(d.edita_membros for d in departamentos)
        nomes = ', '.join(d.nome for d in departamentos) or 'sem departamento'

        secoes = ['home', 'voluntarios']
        if aprova_membros:
            secoes.append('membros_pendentes')
        if edita_membros:
            secoes.append('membros')

        return {
            'nivel': nivel, 'label': f'Líder — {nomes}', 'campus': usuario.campus,
            'departamentos': departamentos, 'visao_geral_voluntarios': visao_geral,
            'pode_aprovar_membros': aprova_membros, 'pode_editar_membros': edita_membros,
            'pode_redefinir_senha': edita_membros, 'acesso_dashboard': True,
            'secoes_visiveis': secoes, 'redirect_pos_login': 'dashboard:home',
        }

    if not nivel and usuario.role == 'voluntario':
        perfil = getattr(usuario, 'voluntarioperfil', None)
        departamento = perfil.departamento if perfil else None

        if not departamento or not departamento.acesso_dashboard:
            return _escopo_sem_acesso(usuario)

        secoes = []
        if departamento.aprova_membros:
            secoes.append('membros_pendentes')
        if departamento.edita_membros:
            secoes.append('membros')
        if departamento.visao_geral_voluntarios:
            secoes.append('voluntarios')

        redirect_pos_login = next(
            (url for chave, url in ORDEM_SECOES_REDIRECT if chave in secoes), None,
        )

        return {
            'nivel': None, 'label': f'Voluntário — {departamento.nome}', 'campus': usuario.campus,
            'departamentos': [departamento], 'visao_geral_voluntarios': departamento.visao_geral_voluntarios,
            'pode_aprovar_membros': departamento.aprova_membros,
            'pode_editar_membros': departamento.edita_membros,
            'pode_redefinir_senha': False, 'acesso_dashboard': True,
            'secoes_visiveis': secoes, 'redirect_pos_login': redirect_pos_login,
        }

    return _escopo_sem_acesso(usuario)


def subtrair_meses(data_ref, meses):
    mes = data_ref.month - meses
    ano = data_ref.year
    while mes <= 0:
        mes += 12
        ano -= 1
    dia = min(data_ref.day, calendar.monthrange(ano, mes)[1])
    return data_ref.replace(year=ano, month=mes, day=dia)


def data_inicio_periodo(periodo, referencia):
    if periodo == 'semana':
        return referencia - timedelta(days=7)
    if periodo == 'mes':
        return subtrair_meses(referencia, 1)
    if periodo == '6meses':
        return subtrair_meses(referencia, 6)
    if periodo == 'ano':
        return subtrair_meses(referencia, 12)
    return None