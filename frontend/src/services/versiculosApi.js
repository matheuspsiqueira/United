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

  if (res.status === 204) return null; // DELETE sem corpo

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.detail || `Erro ${res.status} ao acessar ${path}`;
    throw new Error(message);
  }

  return data;
}

// Retorna array [{ verse_id, cor }, ...]
export function getGrifos(token) {
  return request('/usuarios/versiculos-favoritos/', token);
}

// Cria ou atualiza a cor do grifo (upsert)
export function salvarGrifo(token, verseId, cor) {
  return request('/usuarios/versiculos-favoritos/', token, {
    method: 'POST',
    body: JSON.stringify({ verse_id: verseId, cor }),
  });
}

export function removerGrifoApi(token, verseId) {
  return request(`/usuarios/versiculos-favoritos/${verseId}/`, token, {
    method: 'DELETE',
  });
}