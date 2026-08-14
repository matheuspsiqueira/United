import { API_BASE_URL } from '../config/api';

const authHeaders = (token) => ({
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true',
  ...(token ? { Authorization: `Token ${token}` } : {}),
});

export async function listarEventos(token) {
  const response = await fetch(`${API_BASE_URL}/conteudo/eventos/`, {
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw new Error('Não foi possível carregar os eventos.');
  }

  return response.json();
}

export async function listarNoticias(token, campusId) {
  const url = campusId
    ? `${API_BASE_URL}/conteudo/noticias/?campus=${campusId}`
    : `${API_BASE_URL}/conteudo/noticias/`;

  const response = await fetch(url, { headers: authHeaders(token) });

  if (!response.ok) {
    throw new Error('Não foi possível carregar as notícias.');
  }

  return response.json();
}

export async function listarUnitedNews(token, campusId) {
  const url = campusId
    ? `${API_BASE_URL}/conteudo/united-news/?campus=${campusId}`
    : `${API_BASE_URL}/conteudo/united-news/`;

  const response = await fetch(url, { headers: authHeaders(token) });

  if (!response.ok) {
    throw new Error('Não foi possível carregar o vídeo mensal.');
  }

  const data = await response.json();
  // OneToOne por campus — filtrado por ?campus= sempre volta 0 ou 1 item
  const lista = data.results ?? data;
  return lista[0] ?? null;
}