import { API_BASE_URL } from '../config/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.detail || `Erro ${res.status} ao acessar ${path}`;
    throw new Error(message);
  }

  return data;
}

export function listarSeries(token) {
  return request('/series/', {
    headers: { Authorization: `Token ${token}` },
  });
}

export function buscarSerie(token, id) {
  return request(`/series/${id}/`, {
    headers: { Authorization: `Token ${token}` },
  });
}