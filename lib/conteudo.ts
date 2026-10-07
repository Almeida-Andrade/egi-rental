import type { Foto } from './modelos'

export interface Aplicacao {
  titulo: string
  texto: string
  foto: Foto
}

export const APLICACOES: Aplicacao[] = [
  {
    titulo: 'Canteiros de obras',
    texto: 'Escritório, almoxarifado, vestiário e sanitário para a equipe desde o primeiro dia.',
    foto: { src: '/fotos/aplicacao-canteiro.jpg', alt: 'Módulos azuis de apoio montados num canteiro de obras' },
  },
  {
    titulo: 'Indústrias e portos',
    texto: 'Apoio a operações industriais, portuárias e de mineração, perto de onde o trabalho acontece.',
    foto: { src: '/fotos/aplicacao-porto.jpg', alt: 'Vista aérea de um pátio portuário com containers' },
  },
  {
    titulo: 'Eventos e feiras',
    texto: 'Stands, bilheterias, camarins e sanitários que montam rápido e saem no fim do evento.',
    foto: { src: '/fotos/aplicacao-eventos.jpg', alt: 'Público num festival ao ar livre' },
  },
  {
    titulo: 'Obras públicas e privadas',
    texto: 'Estrutura de apoio para obras de infraestrutura, loteamentos e grandes empreendimentos.',
    foto: { src: '/fotos/aplicacao-obras.jpg', alt: 'Vista aérea de uma obra de loteamento' },
  },
  {
    titulo: 'Projetos temporários e emergenciais',
    texto: 'Espaço extra em poucos dias, sem obra: ampliações, reformas e situações de emergência.',
    foto: { src: '/fotos/aplicacao-modulos.jpg', alt: 'Módulos empilhados formando um prédio temporário' },
  },
]

export const INCLUSO = [
  { titulo: 'Entrega e retirada', texto: 'Levamos até o local, posicionamos e buscamos no fim do contrato.' },
  { titulo: 'Prazo do seu jeito', texto: 'Locação de curto, médio ou longo prazo, conforme a obra pede.' },
  { titulo: 'Container inspecionado', texto: 'Cada um passa por inspeção e adaptação antes de sair.' },
  { titulo: 'Ajuste ao uso', texto: 'Adaptamos o container ao projeto, em vez de você se adaptar a ele.' },
]

export const PASSOS = [
  { titulo: 'Conte o que precisa', texto: 'Pelo WhatsApp ou pelo formulário: o uso, o tamanho e onde o container vai ficar.' },
  { titulo: 'Receba a proposta', texto: 'Indicamos o modelo certo e enviamos o orçamento com prazo e condições.' },
  { titulo: 'Entregamos no local', texto: 'Levamos o container e deixamos posicionado, pronto para uso.' },
  { titulo: 'Retiramos no fim', texto: 'Terminou a obra ou o evento, buscamos o container no local.' },
]

export const ADAPTACOES = [
  { titulo: 'Divisórias e layout', texto: 'Ambientes separados no mesmo container: escritório, depósito, recepção.' },
  { titulo: 'Portas e janelas', texto: 'Aberturas onde o projeto pede, com grade ou vidro.' },
  { titulo: 'Climatização', texto: 'Ar-condicionado e isolamento para o calor de São Luís.' },
  { titulo: 'Elétrica e iluminação', texto: 'Pontos de tomada, iluminação e quadro de energia.' },
  { titulo: 'Hidráulica', texto: 'Sanitários, pias, chuveiros e copas com ligação à rede ou reservatório.' },
  { titulo: 'Acabamento e marca', texto: 'Pintura nas cores da sua empresa, piso e revestimentos.' },
  { titulo: 'Conjuntos', texto: 'Containers lado a lado ou sobrepostos formando um espaço maior.' },
  { titulo: 'Stands e lojas', texto: 'Balcão, abertura frontal e vitrine para vender no local.' },
]

export const INSPIRACOES: Foto[] = [
  { src: '/fotos/sob-medida-dois-andares.jpg', alt: 'Conjunto de containers em dois andares com fachada de vidro' },
  { src: '/fotos/sob-medida-janelas.jpg', alt: 'Container com grandes janelas de vidro' },
  { src: '/fotos/sob-medida-casa.jpg', alt: 'Módulo de container pintado de amarelo num gramado' },
]

// Os capítulos da abertura da home: o fundo do container mostra cada um, e o link leva à seção.
export interface Capitulo {
  rotulo: string
  titulo: string
  texto: string
  foto: Foto
  href: string
  acao: string
}

export function capitulosDaAbertura(usos: string[]): Capitulo[] {
  const lista = usos.length < 2 ? usos.join('') : `${usos.slice(0, -1).join(', ')} e ${usos.at(-1)}`
  return [
    {
      rotulo: 'A frota',
      titulo: 'Pronto para trabalhar',
      texto: `${lista.charAt(0).toUpperCase()}${lista.slice(1)}: cada modelo existe hoje na nossa frota.`,
      foto: { src: '/fotos/escritorio-capa.jpg', alt: 'Containers azuis com janelões' },
      href: '#frota',
      acao: 'Ver a frota',
    },
    {
      rotulo: 'O tamanho',
      titulo: '10 ou 20 pés. Ou dois juntos.',
      texto: 'Compare em escala, ao lado de uma pessoa, e junte dois lado a lado quando o espaço pedir.',
      foto: { src: '/fotos/aplicacao-modulos.jpg', alt: 'Módulos empilhados formando um prédio temporário' },
      href: '#tamanhos',
      acao: 'Comparar os tamanhos',
    },
    {
      rotulo: 'Sob medida',
      titulo: 'Monte o seu em 3D',
      texto: 'Escolha o tamanho, os móveis, as portas e as janelas, e mande o projeto pelo WhatsApp.',
      foto: { src: '/montador/previa.jpg', alt: 'Container montado no montador 3D do site' },
      href: '/sob-medida/montar',
      acao: 'Abrir o montador',
    },
    {
      rotulo: 'Na sua obra',
      titulo: 'A gente leva, posiciona e busca',
      texto: 'Do pedido à retirada no fim do contrato, você fala direto com quem decide.',
      foto: { src: '/fotos/aplicacao-canteiro.jpg', alt: 'Módulos azuis de apoio montados num canteiro de obras' },
      href: '#passos',
      acao: 'Ver como funciona',
    },
  ]
}
