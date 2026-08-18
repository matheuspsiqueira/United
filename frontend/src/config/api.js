// TODO BACKEND: trocar pela URL de produção quando o backend for deployado.
// Por enquanto aponta pro túnel do ngrok, que muda toda vez que o Django
// local é reiniciado (plano free não tem subdomínio fixo).

// src/config/api.js
export const API_BASE_URL = 'https://educators-arizona-graphic-affiliate.trycloudflare.com/api';