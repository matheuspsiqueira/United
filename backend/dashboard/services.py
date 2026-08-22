import calendar
from datetime import timedelta

CAMPOS_PERMISSAO = ('acesso_dashboard', 'aprova_membros', 'edita_membros', 'visao_geral_voluntarios')


def permissoes_departamentos(departamentos):
    return {campo: any(getattr(d, campo) for d in departamentos) for campo in CAMPOS_PERMISSAO}


def resolver_flags(base, overrides_obj):
    resultado = {}
    for campo in CAMPOS_PERMISSAO:
        valor_override = getattr(overrides_obj, campo, None) if overrides_obj else None
        resultado[campo] = valor_override if valor_override is not None else base.get(campo, False)
    return resultado


def _escopo_sem_acesso(usuario):
    return {
        'nivel': usuario.role, 'label': usuario.get_role_display(), 'campus': usuario.campus,
        'departamentos': [], 'secoes_visiveis': [], 'visao_geral_voluntarios': False,
        'pode_aprovar_membros': False, 'pode_aprovar_voluntarios': False, 'pode_editar_membros': False,
        'pode_redefinir_senha': False, 'pode_gerenciar_permissoes': False,
        'redirect_pos_login': None, 'tem_acesso': False,
    }


def get_escopo(usuario):
    role = usuario.role

    if role == 'apostolo':
        return {
            'nivel': role, 'label': 'Apóstolo/Fundador', 'campus': None, 'departamentos': [],
            'secoes_visiveis': ['home', 'membros_pendentes', 'membros', 'voluntarios', 'voluntarios_pendentes'],
            'visao_geral_voluntarios': True, 'pode_aprovar_membros': True, 'pode_aprovar_voluntarios': True,
            'pode_editar_membros': True, 'pode_redefinir_senha': True, 'pode_gerenciar_permissoes': True,
            'redirect_pos_login': 'dashboard:home', 'tem_acesso': True,
        }

    if role == 'pastor_presidente':
        return {
            'nivel': role, 'label': 'Pastor Presidente', 'campus': usuario.campus, 'departamentos': [],
            'secoes_visiveis': ['home', 'membros_pendentes', 'membros', 'voluntarios', 'voluntarios_pendentes'],
            'visao_geral_voluntarios': True, 'pode_aprovar_membros': True, 'pode_aprovar_voluntarios': True,
            'pode_editar_membros': True, 'pode_redefinir_senha': True, 'pode_gerenciar_permissoes': True,
            'redirect_pos_login': 'dashboard:home', 'tem_acesso': True,
        }

    if role == 'lider':
        departamentos = list(usuario.departamentos_liderados.all())
        base = permissoes_departamentos(departamentos)
        overrides = getattr(usuario, 'permissao_individual', None)
        flags = resolver_flags(base, overrides)

        if not flags['acesso_dashboard']:
            return _escopo_sem_acesso(usuario)

        secoes = ['home', 'voluntarios', 'voluntarios_pendentes']
        if flags['aprova_membros']:
            secoes += ['membros_pendentes', 'membros']

        nomes = ', '.join(d.nome for d in departamentos) or 'sem departamento'
        return {
            'nivel': role, 'label': f'Líder — {nomes}', 'campus': usuario.campus,
            'departamentos': departamentos, 'secoes_visiveis': secoes,
            'visao_geral_voluntarios': flags['visao_geral_voluntarios'],
            'pode_aprovar_membros': flags['aprova_membros'], 'pode_aprovar_voluntarios': True,
            'pode_editar_membros': flags['edita_membros'], 'pode_redefinir_senha': False,
            'pode_gerenciar_permissoes': False,
            'redirect_pos_login': 'dashboard:home', 'tem_acesso': True,
        }

    if role == 'voluntario':
        perfil = getattr(usuario, 'voluntarioperfil', None)
        departamento = perfil.departamento if perfil else None
        base = {campo: getattr(departamento, campo, False) if departamento else False for campo in CAMPOS_PERMISSAO}
        overrides = getattr(usuario, 'permissao_individual', None)
        flags = resolver_flags(base, overrides)

        if not departamento or not flags['acesso_dashboard']:
            return _escopo_sem_acesso(usuario)

        secoes = []
        if flags['aprova_membros']:
            secoes += ['membros_pendentes', 'membros']
        redirect = 'dashboard:membros_pendentes' if flags['aprova_membros'] else 'dashboard:home'
        if not secoes:
            secoes = ['home']

        return {
            'nivel': role, 'label': f'Voluntário — {departamento.nome}', 'campus': usuario.campus,
            'departamentos': [departamento], 'secoes_visiveis': secoes,
            'visao_geral_voluntarios': flags['visao_geral_voluntarios'],
            'pode_aprovar_membros': flags['aprova_membros'], 'pode_aprovar_voluntarios': False,
            'pode_editar_membros': flags['edita_membros'], 'pode_redefinir_senha': False,
            'pode_gerenciar_permissoes': False,
            'redirect_pos_login': redirect, 'tem_acesso': True,
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