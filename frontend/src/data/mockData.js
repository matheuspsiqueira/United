// Dados mockados — servem apenas para desenvolvimento visual do front.
// Quando os endpoints do DRF estiverem prontos, este arquivo é substituído
// por chamadas reais (ex: services/api.js usando fetch/axios).

export const REGIOES = ['RJ', 'SP', 'Portugal'];

export const CAMPUSES = [
  {
    id: 'barra',
    nome: 'Barra',
    regiao: 'RJ',
    corTema: '#2E86AB',
    endereco: 'Av. das Américas, 1000 - Barra da Tijuca, Rio de Janeiro',
    pastores: ['Pr. João Ribeiro', 'Pra. Ana Ribeiro'],
    fotoPastores: null, // placeholder — depois vira URL de imagem
    anoFundacao: 2012,
    horarios: [
      { dia: 'Domingo', hora: '10h00' },
      { dia: 'Domingo', hora: '18h00' },
      { dia: 'Quarta', hora: '20h00' },
    ],
  },
  {
    id: 'pechincha',
    nome: 'Pechincha',
    regiao: 'RJ',
    corTema: '#8ea7a1',
    endereco: 'Estrada do Tindiba, 570 - Pechincha, Rio de Janeiro',
    pastores: ['Igor Burlamaqui', '                     Thayane Burlamaqui'],
    fotoPastores: null,
    anoFundacao: 2016,
    horarios: [
      { dia: 'Domingo', hora: '10:00' },
      { dia: 'Terça', hora: '10:00' },
      { dia: 'Quinta', hora: '20:00' },
    ],
  },
  {
    id: 'recreio',
    nome: 'Recreio',
    regiao: 'RJ',
    corTema: '#F18F01',
    endereco: 'Av. das Américas, 19000 - Recreio dos Bandeirantes, Rio de Janeiro',
    pastores: ['Pr. Rafael Souza'],
    fotoPastores: null,
    anoFundacao: 2018,
    horarios: [{ dia: 'Domingo', hora: '19h00' }],
  },
  {
    id: 'curicica',
    nome: 'Curicica',
    regiao: 'RJ',
    corTema: '#3B1F2B',
    endereco: 'Estrada de Curicica, 200 - Curicica, Rio de Janeiro',
    pastores: ['Pr. Diego Farias'],
    fotoPastores: null,
    anoFundacao: 2019,
    horarios: [{ dia: 'Domingo', hora: '18h30' }],
  },
  {
    id: 'sao-joao',
    nome: 'São João',
    regiao: 'RJ',
    corTema: '#6A994E',
    endereco: 'Estrada do Rio Grande, 300 - São João de Meriti',
    pastores: ['Pr. Marcos Lima'],
    fotoPastores: null,
    anoFundacao: 2020,
    horarios: [{ dia: 'Domingo', hora: '18h00' }],
  },
  {
    id: 'sp-1',
    nome: 'SP Centro',
    regiao: 'SP',
    corTema: '#BC4749',
    endereco: 'Av. Paulista, 1000 - São Paulo',
    pastores: ['Pr. Eduardo Nogueira'],
    fotoPastores: null,
    anoFundacao: 2014,
    horarios: [{ dia: 'Domingo', hora: '10h00' }],
  },
  {
    id: 'sp-2',
    nome: 'SP Zona Sul',
    regiao: 'SP',
    corTema: '#386641',
    endereco: 'Av. Ibirapuera, 500 - São Paulo',
    pastores: ['Pr. Felipe Andrade'],
    fotoPastores: null,
    anoFundacao: 2017,
    horarios: [{ dia: 'Domingo', hora: '18h00' }],
  },
  {
    id: 'sp-3',
    nome: 'SP Zona Leste',
    regiao: 'SP',
    corTema: '#A7C957',
    endereco: 'Av. Radial Leste, 200 - São Paulo',
    pastores: ['Pr. Gustavo Reis'],
    fotoPastores: null,
    anoFundacao: 2021,
    horarios: [{ dia: 'Domingo', hora: '18h00' }],
  },
  {
    id: 'portugal-1',
    nome: 'Lisboa',
    regiao: 'Portugal',
    corTema: '#264653',
    endereco: 'Av. da Liberdade, 100 - Lisboa',
    pastores: ['Pr. Tiago Costa'],
    fotoPastores: null,
    anoFundacao: 2022,
    horarios: [{ dia: 'Domingo', hora: '11h00' }],
  },
];

// Próximo culto por campus (mock estático só pra visual — no real vem do backend)
export const PROXIMOS_CULTOS = [
  { campusId: 'barra', data: '2026-07-26', hora: '10h00', status: 'normal', observacao: null },
  { campusId: 'pechincha', data: '2026-07-26', hora: '10h00', status: 'normal', observacao: null },
  { campusId: 'recreio', data: '2026-07-26', hora: '19h00', status: 'normal', observacao: null },
  { campusId: 'curicica', data: '2026-07-26', hora: '18h30', status: 'normal', observacao: null },
  { campusId: 'sao-joao', data: '2026-07-26', hora: '18h00', status: 'normal', observacao: null },
  { campusId: 'sp-1', data: '2026-07-26', hora: '10h00', status: 'normal', observacao: null },
  { campusId: 'sp-2', data: '2026-07-26', hora: '18h00', status: 'normal', observacao: null },
  { campusId: 'sp-3', data: '2026-07-26', hora: '18h00', status: 'normal', observacao: null },
  { campusId: 'portugal-1', data: '2026-07-26', hora: '11h00', status: 'normal', observacao: null },
];

export const EVENTOS = [
  {
    id: 'ev1',
    campusId: 'pechincha',
    titulo: 'Kings',
    data: '2026-08-02',
    descricao: 'Conferência para os homens de fé.',
  },
  {
    id: 'ev2',
    campusId: 'pechincha',
    titulo: 'Batismo nas Águas',
    data: '2026-08-09',
    descricao: 'Inscrições abertas na secretaria do campus.',
  },
];

export const SERIES = [
  {
    id: 'serie1',
    campusId: 'barra',
    titulo: 'Fundamentos da Fé',
    mes: 'Julho 2026',
    capa: null, // placeholder — depois vira URL de imagem
    episodios: [
      { id: 'ep1', titulo: 'O que é Graça', data: '2026-07-05' },
      { id: 'ep2', titulo: 'A Nova Aliança', data: '2026-07-12' },
      { id: 'ep3', titulo: 'Vivendo pela Fé', data: '2026-07-19' },
    ],
  },
  {
    id: 'serie2',
    campusId: 'pechincha',
    titulo: 'Família à Prova',
    mes: 'Julho 2026',
    capa: null,
    episodios: [
      { id: 'ep4', titulo: 'Casamento com Propósito', data: '2026-07-06' },
    ],
  },
];

export const NOTICIAS = [
  {
    id: 'not1',
    campusId: 'barra',
    titulo: 'United News #12',
    data: '2026-07-18',
    resumo: 'As novidades da semana em todos os campi.',
  },
];

export const AGENDA_CULTOS = [
  { id: 'ag1', campusId: 'barra', data: '2026-07-26', hora: '10h00', status: 'normal' },
  { id: 'ag2', campusId: 'barra', data: '2026-07-26', hora: '18h00', status: 'normal' },
  { id: 'ag3', campusId: 'barra', data: '2026-07-29', hora: '20h00', status: 'alterado', observacao: 'Horário alterado para 20h30' },
];

export const SOBRE_UNITED = {
  visao: '...',
  missao: '...',
  historia: '...',
  redes: {
    instagram: '@igrejaunited',
    youtube: 'Igreja United',
    spotify: 'Igreja United',
  },
};

export const USUARIO_MOCK = {
  id: 'user1',
  nome: 'Matheus Siqueira',
  campusId: 1,
  role: 'membro', // membro | voluntario
  fotoUrl: null,
  versiculosFavoritos: [],
};

export const getCampusById = (id) => CAMPUSES.find((c) => c.id === id);

export const getProximoCultoByCampus = (campusId) =>
  PROXIMOS_CULTOS.find((p) => p.campusId === campusId);