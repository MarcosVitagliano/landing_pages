/**
 * Fonte única de dados do site: página e chat leem daqui.
 * Quando houver API (Laravel, WordPress REST...), troque estas constantes por um serviço HTTP.
 */
export interface Horario {
  dias: string;
  aula: string;
  hora: string;
  local: string;
}

export interface Modalidade {
  id: string;
  nome: string;
  icone: string;
  desc: string;
  horarios: Horario[];
}

export interface Plano {
  id: string;
  nome: string;
  preco: number;
  meses: number;
  resumo: string;
  itens: string[];
  destaque?: boolean;
}

export const MODALIDADES: Modalidade[] = [
  {
    id: 'jiu-jitsu',
    nome: 'Jiu-Jitsu',
    icone: 'fa-shield-halved',
    desc: 'Luta de solo e domínio de posição. Técnica e estratégia acima da força.',
    horarios: [
      { dias: 'Segunda, Quarta e Sexta', aula: 'Jiu-Jitsu Adulto / Avançado', hora: '19:00 - 20:30', local: 'Tatame 1' },
      { dias: 'Terça e Quinta', aula: 'Jiu-Jitsu Iniciante (Fundamentos)', hora: '07:00 - 08:30', local: 'Tatame 1' },
    ],
  },
  {
    id: 'muay-thai',
    nome: 'Muay Thai',
    icone: 'fa-hand-fist',
    desc: 'Golpes com punhos, cotovelos, joelhos e chutes. Alto gasto calórico.',
    horarios: [
      { dias: 'Segunda, Quarta e Sexta', aula: 'Muay Thai Performance', hora: '18:00 - 19:00', local: 'Tatame 2' },
      { dias: 'Terça e Quinta', aula: 'Muay Thai Técnico', hora: '20:00 - 21:00', local: 'Tatame 2' },
    ],
  },
  {
    id: 'boxe',
    nome: 'Boxe',
    icone: 'fa-bolt',
    desc: 'Trabalho de pernas, esquiva e combinações de socos. Condicionamento completo.',
    horarios: [
      { dias: 'Segunda, Quarta e Sexta', aula: 'Boxe Nobre Arte', hora: '20:30 - 21:45', local: 'Ringue Central' },
    ],
  },
  {
    id: 'judo',
    nome: 'Judô',
    icone: 'fa-user-ninja',
    desc: 'Projeções e controle. Disciplina e respeito desde as primeiras aulas.',
    horarios: [
      { dias: 'Terça e Quinta', aula: 'Judô Kids & Adulto', hora: '18:00 - 19:30', local: 'Tatame 1' },
    ],
  },
];

export const PLANOS: Plano[] = [
  {
    id: 'mensal',
    nome: 'Plano Mensal',
    preco: 180,
    meses: 1,
    resumo: 'Flexibilidade para treinar quando quiser.',
    itens: ['1 modalidade à escolha', 'Acesso livre à grade', 'Vestiários equipados'],
  },
  {
    id: 'semestral',
    nome: 'Plano Semestral',
    preco: 159,
    meses: 6,
    resumo: 'Compromisso ideal para resultados duradouros.',
    itens: ['Até 2 modalidades', 'Acesso livre à grade escolhida', 'Vestiários equipados'],
  },
  {
    id: 'anual',
    nome: 'Plano Anual',
    preco: 139,
    meses: 12,
    destaque: true,
    resumo: 'Máximo desempenho com a menor mensalidade.',
    itens: [
      'Todas as modalidades livres',
      'Acesso em todas as unidades da rede',
      '1 uniforme oficial de cortesia',
      'Armário privativo incluso',
    ],
  },
];

export const brl = (n: number): string =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

/** Economia do plano no período inteiro, comparada ao plano mensal. */
export const economia = (p: Plano): number => (PLANOS[0].preco - p.preco) * p.meses;
