import { API_BASE_URL } from '../config/api';

export async function listarUGroups(token) {
  const response = await fetch(`${API_BASE_URL}/ugroups/`, {
    headers: {
      Authorization: `Token ${token}`,
      'ngrok-skip-browser-warning': 'true',
    },
  });
  if (!response.ok) {
    throw new Error('Não foi possível carregar os uGroups.');
  }
  const data = await response.json();
  return data.results ?? data;
}