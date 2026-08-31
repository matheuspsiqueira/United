import { API_BASE_URL } from '../config/api';

async function request(path, token, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      Authorization: `Token ${token}`,
      ...options.headers,
    },
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.detail || `Erro ${res.status} ao acessar ${path}`;
    throw new Error(message);
  }

  return data;
}

// Retorna { versao, livro_slug, capitulo } com a última posição de leitura
// do usuário logado, ou null se ele nunca leu nada ainda.
export function getPosicaoLeitura(token) {
  return request('/usuarios/posicao-leitura/', token);
}

// Upsert da posição atual de leitura do usuário logado.
export function salvarPosicaoLeitura(token, { versao, livroSlug, capitulo }) {
  return request('/usuarios/posicao-leitura/', token, {
    method: 'POST',
    body: JSON.stringify({ versao, livro_slug: livroSlug, capitulo }),
  });
}