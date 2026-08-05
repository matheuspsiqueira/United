import { API_BASE_URL } from '../config/api';

async function request(path) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      // Necessário no plano free do ngrok — sem isso ele devolve uma
      // página HTML de aviso em vez do JSON, e o .json() abaixo quebra.
      'ngrok-skip-browser-warning': 'true',
    },
  });

  if (!res.ok) {
    throw new Error(`Erro ${res.status} ao buscar ${path}`);
  }

  return res.json();
}

export function getCampuses() {
  return request('/campus/');
}

export function getCampus(id) {
  return request(`/campus/${id}/`);
}

export function getProximoCulto(id) {
  return request(`/campus/${id}/proximo-culto/`);
}