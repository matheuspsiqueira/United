import { API_BASE_URL } from '../config/api';

export async function listarEventos(token) {
  const response = await fetch(`${API_BASE_URL}/conteudo/eventos/`, {
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      ...(token ? { Authorization: `Token ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error('Não foi possível carregar os eventos.');
  }

  return response.json();
}