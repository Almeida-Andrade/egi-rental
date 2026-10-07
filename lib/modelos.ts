import type { Tamanho } from './medidas'

export { MEDIDAS, MEDIDAS_METROS, metros, type Medidas, type Tamanho } from './medidas'

// O texto e as fotos de cada uso. Os valores de `Uso`, `Tamanho` e `Fabricacao` são os do
// check da tabela `containers` do OMNIS (0153): valor novo lá entra aqui também.
export type Uso =
  | 'escritorio'
  | 'almoxarifado'
  | 'wc'
  | 'vestiario'
  | 'copa'
  | 'cozinha'
  | 'stand'
  | 'hibrido'
  | 'area_tecnica'
  | 'outro'

export type Fabricacao = 'maritimo' | 'fabricado'

export interface Foto {
  src: string
  alt: string
}

export interface ConteudoUso {
  nome: string
  slug: string
  resumo: string
  descricao: string[]
  indicadoPara: string[]
  // configurações que se combinam no orçamento, nunca promessa de item de série
  combinaveis: string[]
  capa: Foto
  // capa própria de um tamanho, quando a foto geral não serve para ele
  capaPorTamanho?: Partial<Record<Tamanho, Foto>>
  galeria: Foto[]
}

export const ROTULO_FABRICACAO: Record<Fabricacao, string> = {
  maritimo: 'Marítimo',
  fabricado: 'Fabricado (modular)',
}

const FOTO_FROTA: Foto = {
  src: '/fotos/frota-azul.jpg',
  alt: 'Containers azuis empilhados',
}

export const CONTEUDO_USO: Record<Uso, ConteudoUso> = {
  escritorio: {
    nome: 'Escritório',
    slug: 'escritorio',
    resumo: 'Escritório pronto para o canteiro, a indústria ou o projeto temporário.',
    descricao: [
      'Um ambiente de trabalho funcional e confortável que chega pronto para uso: é posicionar, ligar e começar.',
      'Serve como escritório de obra, sala de engenharia, recepção ou ponto de atendimento, pelo tempo que o projeto durar.',
    ],
    indicadoPara: ['Canteiros de obras', 'Indústrias e mineradoras', 'Projetos temporários', 'Pontos de atendimento'],
    combinaveis: ['Ar-condicionado', 'Iluminação e tomadas', 'Janelas com grade', 'Divisórias internas', 'Mobiliário'],
    capa: { src: '/fotos/escritorio-azul.jpg', alt: 'Container escritório azul com janela' },
    galeria: [
      { src: '/fotos/escritorio-interior.jpg', alt: 'Interior de escritório compacto com mesa e computador' },
      { src: '/fotos/escritorio-branco.jpg', alt: 'Container branco com ar-condicionado instalado' },
    ],
  },
  almoxarifado: {
    nome: 'Almoxarifado',
    slug: 'almoxarifado',
    resumo: 'Armazenagem segura para materiais, ferramentas e equipamentos.',
    descricao: [
      'Protege materiais, equipamentos e insumos do sol e da chuva e mantém tudo organizado e trancado no próprio local de trabalho.',
      'É a solução mais direta para tirar o estoque do tempo sem construir nada.',
    ],
    indicadoPara: ['Canteiros de obras', 'Estoque temporário', 'Ferramentas e equipamentos', 'Arquivo e documentos'],
    combinaveis: ['Prateleiras', 'Iluminação', 'Ventilação', 'Cadeado de segurança'],
    capa: { src: '/fotos/almoxarifado-portas.jpg', alt: 'Portas de um container marítimo fechado' },
    capaPorTamanho: {
      10: { src: '/fotos/almoxarifado-compacto.jpg', alt: 'Módulo compacto de armazenagem com porta de enrolar azul' },
    },
    galeria: [
      { src: '/fotos/almoxarifado-campo.jpg', alt: 'Container de armazenagem posicionado em terreno aberto' },
      { src: '/fotos/almoxarifado-portas.jpg', alt: 'Portas de um container marítimo fechado' },
    ],
  },
  wc: {
    nome: 'Sanitário',
    slug: 'sanitario',
    resumo: 'Banheiro completo onde não há estrutura: masculino, feminino ou misto.',
    descricao: [
      'Container adaptado como banheiro, para dar estrutura digna à equipe ou ao público onde ainda não existe construção.',
      'A configuração (masculino, feminino ou misto, com ou sem chuveiro) é combinada conforme o uso.',
    ],
    indicadoPara: ['Obras', 'Eventos', 'Áreas provisórias', 'Frentes de serviço'],
    combinaveis: ['Vasos e mictórios', 'Pias', 'Chuveiros', 'Ligação à rede ou reservatório'],
    capa: { src: '/fotos/sanitario-interior.jpg', alt: 'Banheiro compacto com vaso, pia e janela' },
    galeria: [],
  },
  vestiario: {
    nome: 'Vestiário',
    slug: 'vestiario',
    resumo: 'Espaço para a equipe trocar de roupa e guardar os pertences.',
    descricao: ['Vestiário para equipes de obra e de campo, com espaço para troca e armários.'],
    indicadoPara: ['Obras', 'Indústrias', 'Frentes de serviço'],
    combinaveis: ['Armários', 'Bancos', 'Chuveiros'],
    capa: FOTO_FROTA,
    galeria: [],
  },
  copa: {
    nome: 'Copa',
    slug: 'copa',
    resumo: 'Copa para as refeições e o café da equipe.',
    descricao: ['Um espaço de apoio para a equipe fazer as refeições perto da frente de trabalho.'],
    indicadoPara: ['Obras', 'Indústrias'],
    combinaveis: ['Bancada e pia', 'Mesas', 'Pontos para geladeira e micro-ondas'],
    capa: { src: '/fotos/cozinha-inox.jpg', alt: 'Cozinha compacta em aço inox' },
    galeria: [],
  },
  cozinha: {
    nome: 'Cozinha',
    slug: 'cozinha',
    resumo: 'Cozinha ou refeitório de apoio para a equipe no local.',
    descricao: [
      'Container preparado para cozinha ou refeitório, para alimentar a equipe sem depender de estrutura no terreno.',
      'Também atende operações de alimentação em eventos.',
    ],
    indicadoPara: ['Canteiros de obras', 'Alojamentos', 'Eventos'],
    combinaveis: ['Bancadas', 'Pias', 'Pontos elétricos e de gás', 'Exaustão'],
    capa: { src: '/fotos/cozinha-inox.jpg', alt: 'Cozinha compacta em aço inox' },
    galeria: [],
  },
  stand: {
    nome: 'Stand',
    slug: 'stand',
    resumo: 'Ponto de venda, quiosque ou stand de vendas que chama a atenção.',
    descricao: [
      'Um container que vira ponto comercial: stand de vendas de empreendimento, quiosque, café ou loja temporária.',
      'Monta rápido, chama a atenção e sai do lugar quando a campanha termina.',
    ],
    indicadoPara: ['Stands de vendas', 'Feiras e eventos', 'Lojas temporárias', 'Quiosques'],
    combinaveis: ['Balcão de atendimento', 'Abertura frontal', 'Pintura com a sua marca', 'Iluminação'],
    capa: { src: '/fotos/stand-cafe.jpg', alt: 'Container azul transformado em café com balcão aberto' },
    galeria: [{ src: '/fotos/stand-quiosque.jpg', alt: 'Container transformado em quiosque com mural pintado' }],
  },
  hibrido: {
    nome: 'Escritório + almoxarifado',
    slug: 'escritorio-almoxarifado',
    resumo: 'Escritório e depósito no mesmo container, separados por divisória.',
    descricao: [
      'Dois ambientes num só container: um lado é escritório, o outro guarda materiais e ferramentas.',
      'Ocupa uma única base no terreno e resolve o canteiro inteiro com uma entrega.',
    ],
    indicadoPara: ['Canteiros de obras', 'Frentes de serviço', 'Operações de campo'],
    combinaveis: ['Divisória interna', 'Ar-condicionado no escritório', 'Prateleiras no depósito'],
    capa: { src: '/fotos/hibrido-canteiro.jpg', alt: 'Módulo de escritório no canteiro, ao lado de materiais de obra' },
    galeria: [{ src: '/fotos/hibrido-interior.jpg', alt: 'Ambiente interno com mesa de trabalho e armário' }],
  },
  area_tecnica: {
    nome: 'Área técnica',
    slug: 'area-tecnica',
    resumo: 'Abrigo para quadros, geradores e equipamentos.',
    descricao: ['Container para proteger equipamentos elétricos e técnicos no local da operação.'],
    indicadoPara: ['Indústrias', 'Obras', 'Eventos'],
    combinaveis: ['Ventilação', 'Iluminação', 'Fechadura de segurança'],
    capa: FOTO_FROTA,
    galeria: [],
  },
  outro: {
    nome: 'Container',
    slug: 'container',
    resumo: 'Container para o uso que o seu projeto pedir.',
    descricao: ['Container da frota que adaptamos conforme a necessidade.'],
    indicadoPara: ['Projetos diversos'],
    combinaveis: [],
    capa: FOTO_FROTA,
    galeria: [],
  },
}

// Ordem do catálogo: o que mais se pede primeiro.
export const ORDEM_USOS: Uso[] = [
  'escritorio',
  'almoxarifado',
  'hibrido',
  'wc',
  'vestiario',
  'copa',
  'cozinha',
  'stand',
  'area_tecnica',
  'outro',
]
