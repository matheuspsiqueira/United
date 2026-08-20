import secrets
import string
import unicodedata

from django.utils.text import slugify


def gerar_senha_provisoria(tamanho=8):
    alfabeto = string.ascii_uppercase + string.ascii_lowercase + string.digits
    return ''.join(secrets.choice(alfabeto) for _ in range(tamanho))


def _normalizar(nome):
    nome = unicodedata.normalize('NFKD', nome).encode('ascii', 'ignore').decode('ascii')
    return slugify(nome).replace('-', '')


def gerar_username(nome_completo):
    from .models import Usuario

    partes = [p for p in nome_completo.strip().split() if p]
    partes_normalizadas = [_normalizar(p) for p in partes] or ['usuario']

    primeiro = partes_normalizadas[0]
    candidatos = []
    if len(partes_normalizadas) >= 2:
        candidatos.append(f'{primeiro}.{partes_normalizadas[1]}')
    if len(partes_normalizadas) >= 3:
        candidatos.append(f'{primeiro}.{partes_normalizadas[2]}')
    if not candidatos:
        candidatos.append(primeiro)

    for candidato in candidatos:
        if not Usuario.objects.filter(username=candidato).exists():
            return candidato

    base = candidatos[-1]
    while True:
        sufixo = ''.join(secrets.choice(string.digits) for _ in range(3))
        tentativa = f'{base}{sufixo}'
        if not Usuario.objects.filter(username=tentativa).exists():
            return tentativa