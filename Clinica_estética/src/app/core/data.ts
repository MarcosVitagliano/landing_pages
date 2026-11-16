/**
 * Fonte única de dados do site (página e chat leem daqui).
 * Textos de serviços, blog e galeria são EXEMPLOS: substitua pelos reais da clínica.
 */
export const CATEGORIAS = ['Facial', 'Corporal', 'Depilação', 'Harmonização'] as const;
export type Categoria = (typeof CATEGORIAS)[number];

export interface Servico {
  id: string;
  nome: string;
  categoria: Categoria;
  icone: string;
  desc: string;
  duracao: string;
  /** Foto do procedimento, ex.: 'img/limpeza-de-pele.jpg' (arquivo em public/img). Se o arquivo não existir, aparece o fundo rosa. */
  src: string;
}

export const SERVICOS: Servico[] = [
  {
    id: 'limpeza-de-pele',
    nome: 'Limpeza de pele profunda',
    categoria: 'Facial',
    icone: 'fa-droplet',
    desc: 'Remove impurezas e prepara a pele, com extração delicada e finalização hidratante.',
    duracao: '60 min',
    src: 'img/limpeza-de-pele.jpg',
  },
  {
    id: 'harmonizacao-facial',
    nome: 'Harmonização facial',
    categoria: 'Harmonização',
    icone: 'fa-face-smile',
    desc: 'Procedimentos realizados por profissional habilitado, sempre após avaliação individual.',
    duracao: '60 min',
    src: 'img/harmonizacao-facial.jpg',
  },
  {
    id: 'microagulhamento',
    nome: 'Microagulhamento',
    categoria: 'Facial',
    icone: 'fa-seedling',
    desc: 'Estímulo controlado da pele, indicado conforme a avaliação profissional.',
    duracao: '60 min',
    src: 'img/microagulhamento.jpg',
  },
  {
    id: 'peeling',
    nome: 'Peeling',
    categoria: 'Facial',
    icone: 'fa-leaf',
    desc: 'Renovação da superfície da pele, com produtos escolhidos após a avaliação do seu tipo de pele.',
    duracao: '45 min',
    src: 'img/peeling.jpg',
  },
  {
    id: 'drenagem-linfatica',
    nome: 'Drenagem linfática',
    categoria: 'Corporal',
    icone: 'fa-spa',
    desc: 'Massagem suave e ritmada que traz sensação de leveza e bem-estar.',
    duracao: '50 min',
    src: 'img/drenagem-linfatica.jpg',
  },
  {
    id: 'massagem-modeladora',
    nome: 'Massagem modeladora',
    categoria: 'Corporal',
    icone: 'fa-hand-sparkles',
    desc: 'Técnica firme e localizada, feita em sessões, com foco no contorno corporal.',
    duracao: '50 min',
    src: 'img/massagem-modeladora.jpg',
  },
  {
    id: 'radiofrequencia',
    nome: 'Radiofrequência',
    categoria: 'Corporal',
    icone: 'fa-bolt',
    desc: 'Tecnologia aplicada à pele, em protocolo definido na avaliação.',
    duracao: '45 min',
    src: 'img/radiofrequencia.jpg',
  },
  {
    id: 'depilacao-a-laser',
    nome: 'Depilação a laser',
    categoria: 'Depilação',
    icone: 'fa-wand-magic-sparkles',
    desc: 'Redução gradual dos pelos em sessões, com parâmetros ajustados ao seu tipo de pele.',
    duracao: '30 a 60 min',
    src: 'img/depilacao-a-laser.jpg',
  },
];

export const DIFERENCIAIS = [
  {
    icone: 'fa-user-doctor',
    titulo: 'Avaliação individual',
    texto: 'Cada plano de cuidado começa com uma conversa sobre o seu histórico e os seus objetivos.',
  },
  {
    icone: 'fa-shield-heart',
    titulo: 'Segurança em primeiro lugar',
    texto: 'Profissionais habilitados, materiais descartáveis e protocolos de higiene rigorosos.',
  },
  {
    icone: 'fa-spa',
    titulo: 'Ambiente acolhedor',
    texto: 'Um espaço calmo, pensado para você relaxar desde o momento em que chega.',
  },
  {
    icone: 'fa-calendar-check',
    titulo: 'Hora marcada',
    texto: 'Atendimento pontual e agendamento simples, direto pelo site ou pelo WhatsApp.',
  },
];

export interface Foto {
  titulo: string;
  /** Caminho da imagem, ex.: 'img/recepcao.jpg' (arquivo em public/img). Se o arquivo não existir, aparece um espaço reservado. */
  src: string;
  alt: string;
  /** Ponto do recorte (CSS object-position), ex.: '50% 70%'. Padrão: centro. */
  pos?: string;
}

/** Fotos da clínica (carrossel da seção "A clínica"). */
export const GALERIA: Foto[] = [
  { titulo: 'Recepção', src: 'img/clinica-recepcao.jpg', alt: 'Recepção clara com divisória translúcida, planta e sofás' },
  { titulo: 'Área de espera', src: 'img/clinica-espera.jpg', alt: 'Área de espera com poltronas claras e painel iluminado', pos: '50% 68%' },
  { titulo: 'Cantinho do café', src: 'img/clinica-cafe.jpg', alt: 'Cantinho do café com nichos iluminados em dourado, bancada e frigobar', pos: '50% 62%' },
  { titulo: 'Sala de atendimento', src: 'img/clinica-sala-atendimento.jpg', alt: 'Sala de atendimento' },
  { titulo: 'Sala de procedimentos', src: 'img/clinica-sala-procedimentos.jpg', alt: 'Sala de procedimentos' },
  { titulo: 'Fachada', src: 'img/clinica-fachada.jpg', alt: 'Fachada da clínica' },
];

export interface Post {
  slug: string;
  titulo: string;
  resumo: string;
  categoria: string;
  /** AAAA-MM-DD */
  data: string;
  leitura: number;
  capa: string;
  corpo: string[];
}

export const POSTS: Post[] = [
  {
    slug: 'protetor-solar-passo-essencial',
    titulo: 'Protetor solar: o passo que não pode faltar',
    resumo: 'Por que usar todos os dias, inclusive nos dias nublados, e como aplicar do jeito certo.',
    categoria: 'Cuidados diários',
    data: '2026-09-10',
    leitura: 3,
    capa: 'from-brand-soft to-sand',
    corpo: [
      'Se existe um hábito que faz diferença na saúde da pele ao longo dos anos, é o uso diário de protetor solar. A radiação ultravioleta atravessa nuvens e vidros, então o cuidado vale também para dias nublados e para quem passa o dia em ambientes fechados perto de janelas.',
      'Aplique a quantidade recomendada pelo fabricante em todas as áreas expostas, incluindo orelhas, pescoço e dorso das mãos. Em exposição prolongada ou depois de suar, a reaplicação ao longo do dia é importante.',
      'O fator de proteção e o tipo de produto mais indicados dependem do seu tipo de pele e da sua rotina. Na avaliação, nossa equipe ajuda você a escolher a melhor opção.',
    ],
  },
  {
    slug: 'rotina-de-skincare-simples',
    titulo: 'Uma rotina de skincare simples para começar',
    resumo: 'Limpar, hidratar e proteger: o básico bem feito vale mais do que dez produtos.',
    categoria: 'Skincare',
    data: '2026-09-24',
    leitura: 4,
    capa: 'from-blush to-cream',
    corpo: [
      'Uma boa rotina não precisa ser longa. O essencial se resume a três passos: limpar o rosto com um produto adequado ao seu tipo de pele, hidratar e proteger do sol durante o dia.',
      'Ao incluir um novo produto, introduza um de cada vez e observe como a pele reage. Isso facilita identificar o que funciona e o que não funciona para você.',
      'Se a pele apresentar vermelhidão persistente, coceira ou qualquer desconforto, interrompa o uso e procure um profissional. Uma avaliação individual evita tentativa e erro.',
    ],
  },
  {
    slug: 'primeira-avaliacao-na-clinica',
    titulo: 'O que esperar da primeira avaliação na clínica',
    resumo: 'Como é a conversa inicial e por que ela é a parte mais importante do tratamento.',
    categoria: 'Bastidores',
    data: '2026-10-05',
    leitura: 3,
    capa: 'from-sand to-brand-soft',
    corpo: [
      'A primeira consulta é uma conversa. Perguntamos sobre o seu histórico, a sua rotina e o que você gostaria de melhorar, e observamos a pele com calma antes de qualquer indicação.',
      'Com base nisso, montamos um plano personalizado, explicando cada etapa, o número de sessões previsto e os cuidados necessários entre elas. Nenhum procedimento é feito sem que você entenda e concorde.',
      'Vale chegar com suas dúvidas anotadas e informar medicamentos, alergias e tratamentos anteriores. Quanto mais clara a conversa, mais seguro e eficaz o cuidado.',
    ],
  },
];

// ---------- horários de agendamento ----------
const doisDigitos = (n: number): string => String(n).padStart(2, '0');

/** Data de hoje no fuso local, no formato AAAA-MM-DD (o mesmo do input type="date"). */
export function hojeISO(agora = new Date()): string {
  return `${agora.getFullYear()}-${doisDigitos(agora.getMonth() + 1)}-${doisDigitos(agora.getDate())}`;
}

/** Horários disponíveis no dia: seg a sex 9h-18h, sábado 9h-13h, domingo fechado. */
export function slotsDoDia(iso: string, agora = new Date()): string[] {
  const [a, m, d] = iso.split('-').map(Number);
  const dia = new Date(a, m - 1, d);
  const diaSemana = dia.getDay();
  if (diaSemana === 0) return [];

  const ultima = diaSemana === 6 ? 13 : 18;
  const slots: string[] = [];
  for (let h = 9; h <= ultima; h++) slots.push(`${doisDigitos(h)}:00`);

  // Se for hoje, só mostra horários que ainda não passaram.
  return iso === hojeISO(agora) ? slots.filter((s) => Number(s.slice(0, 2)) > agora.getHours()) : slots;
}

export function formatarData(iso: string, curta = false): string {
  const [a, m, d] = iso.split('-').map(Number);
  return new Date(a, m - 1, d).toLocaleDateString(
    'pt-BR',
    curta ? { day: '2-digit', month: '2-digit', year: 'numeric' } : { day: 'numeric', month: 'long', year: 'numeric' },
  );
}
