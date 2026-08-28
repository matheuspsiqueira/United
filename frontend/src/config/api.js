// TODO BACKEND: trocar pela URL de produção quando o backend for deployado.
// Por enquanto aponta pro túnel do ngrok, que muda toda vez que o Django
// local é reiniciado (plano free não tem subdomínio fixo).

// src/config/api.js

const LOCAL_URL = 'https://SEU-TUNEL-ATUAL.trycloudflare.com'; // cloudflared, muda toda vez que reinicia o tunnel
const PROD_URL = 'https://igreja-united.onrender.com'; // Render, fixo, sempre no ar

export const API_URL = PROD_URL; // troca pra LOCAL_URL quando quiser testar local