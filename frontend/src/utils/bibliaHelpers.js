// Extrai o português dos campos multilíngues da Midvash ({ en, 'pt-br', ... }).
// Usado tanto no BibliaScreen quanto no SeletorBibliaScreen — mantido num
// só lugar pra não divergir.
export function nomeLocalizado(campo) {
  if (!campo) return '';
  if (typeof campo === 'string') return campo;
  return campo['pt-br'] || campo.pt || campo.en || Object.values(campo)[0] || '';
}

export function slugLivro(livro) {
  if (!livro) return '';
  return nomeLocalizado(livro.slug) || nomeLocalizado(livro.abbrev) || livro.id || '';
}