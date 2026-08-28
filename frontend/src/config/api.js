// TODO BACKEND: trocar pela URL de produção quando o backend for deployado.
// Por enquanto aponta pro túnel do ngrok, que muda toda vez que o Django
// local é reiniciado (plano free não tem subdomínio fixo).

// src/config/api.js

const LOCAL_URL = 'https://alternate-baby-gregory-seven.trycloudflare.com/api';
const PROD_URL = 'https://united-ly9w.onrender.com/api';

export const API_BASE_URL = PROD_URL; // troca pra PROD_URL quando quiser testar com o backend hospedado