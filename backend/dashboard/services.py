def get_escopo(usuario):
    nivel = usuario.nivel_acesso

    if nivel == 'fundador':
        return {
            'nivel': nivel,
            'label': 'Fundador',
            'campus': None,
            'departamentos': [],
            'visao_geral_voluntarios': True,
        }

    if nivel == 'pastor_presidente':
        return {
            'nivel': nivel,
            'label': 'Pastor presidente',
            'campus': usuario.campus,
            'departamentos': [],
            'visao_geral_voluntarios': False,
        }

    if nivel == 'lider':
        departamentos = list(usuario.departamentos_liderados.all())
        visao_geral = any(d.visao_geral_voluntarios for d in departamentos)
        nomes = ', '.join(d.nome for d in departamentos) or 'sem departamento'
        return {
            'nivel': nivel,
            'label': f'Líder — {nomes}',
            'campus': usuario.campus,
            'departamentos': departamentos,
            'visao_geral_voluntarios': visao_geral,
        }

    return {
        'nivel': nivel,
        'label': 'Sem acesso',
        'campus': usuario.campus,
        'departamentos': [],
        'visao_geral_voluntarios': False,
    }