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

export function login(username, password) {
  return request('/usuarios/login/', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function getMe(token) {
  return request('/usuarios/me/', {
    headers: { Authorization: `Token ${token}` },
  });
}

export function trocarSenha(token, senhaAtual, novaSenha) {
  return request('/usuarios/trocar-senha/', {
    method: 'POST',
    headers: { Authorization: `Token ${token}` },
    body: JSON.stringify({ senha_atual: senhaAtual, nova_senha: novaSenha }),
  });
}

// Multipart à parte: precisa deixar o fetch montar o boundary sozinho,
// então NÃO passa por request() nem seta Content-Type manualmente.
export async function atualizarPerfil(token, { nomeCompleto, email, fotoUri } = {}) {
  const formData = new FormData();
  if (nomeCompleto !== undefined) formData.append('nome_completo', nomeCompleto);
  if (email !== undefined) formData.append('email', email);
  if (fotoUri) {
    const filename = fotoUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename || '');
    const ext = match ? match[1] : 'jpg';
    formData.append('foto_perfil', { uri: fotoUri, name: filename || `foto.${ext}`, type: `image/${ext}` });
  }

  const res = await fetch(`${API_BASE_URL}/usuarios/me/`, {
    method: 'PATCH',
    headers: {
      'ngrok-skip-browser-warning': 'true',
      Authorization: `Token ${token}`,
    },
    body: formData,
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = data?.detail || `Erro ${res.status} ao atualizar perfil`;
    throw new Error(message);
  }
  return data;
}