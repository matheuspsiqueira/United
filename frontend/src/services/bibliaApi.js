// Client fino para a API pública da Bíblia (Midvash).
// Sem auth, sem chaves — chamadas diretas.
// Docs: https://api.midvash.com/pt-br

const BASE_URL = 'https://api.midvash.com/v1';

// TODO BACKEND: grifos/favoritos de versículo hoje vivem só em AsyncStorage
// local (BibliaScreen.js, chave '@united:biblia:grifos'), porque ainda não
// existe conta/auth real. Isso é o mock temporário de um campo que deveria
// ser usuario.versiculos_favoritos no Django (provavelmente tabela
// relacionada, tipo VersiculoFavorito(usuario, verse_id, cor)).
// Quando o backend entrar: trocar getItem/setItem por GET/POST na API,
// mantendo o mesmo shape { [verseId]: corHex } — a UI não precisa mudar.

class BibliaApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'BibliaApiError';
    this.status = status;
  }
}

async function request(path) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`);
  } catch (networkErr) {
    throw new BibliaApiError('Falha de conexão ao buscar dados da Bíblia.', null);
  }

  if (!response.ok) {
    throw new BibliaApiError(
      `Erro ao buscar ${path} (status ${response.status})`,
      response.status
    );
  }

  const json = await response.json();
  return json.data;
}

// ---- Versões (ex: nvi, ntlh) ----

export function getVersoes() {
  return request('/versions');
}

export function getVersaoInfo(slug) {
  return request(`/versions/${slug}`);
}

// ---- Livros (os 66 livros, com slug e total de capítulos) ----

export function getLivros() {
  return request('/books');
}

export function getLivroInfo(slug) {
  return request(`/books/${slug}`);
}

// ---- Conteúdo ----

// Retorna um capítulo completo: { version, book, chapter, verses: [...] }
export function getCapitulo(versao, livroSlug, capitulo) {
  return request(`/${versao}/${livroSlug}/${capitulo}`);
}

// Retorna um versículo único ou um intervalo (ex: '16' ou '16-20')
export function getVersiculo(versao, livroSlug, capitulo, versiculo) {
  return request(`/${versao}/${livroSlug}/${capitulo}/${versiculo}`);
}

// Versículo do dia — mesmo pra todo mundo, cacheado 24h no servidor
export function getVersiculoDoDia(idioma = 'pt-br') {
  return request(`/votd?language=${idioma}`);
}