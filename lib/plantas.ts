import { MEDIDAS_METROS, type Tamanho } from './medidas'
import type { Uso } from './modelos'

// Planta de EXEMPLO, vista de cima, em metros: x ao longo do comprimento interno, y na largura.
// É ilustração de uso, nunca o layout entregue (o site diz isso ao lado da planta).
export type TipoPeca =
  | 'mesa'
  | 'cadeira'
  | 'armario'
  | 'prateleira'
  | 'palete'
  | 'vaso'
  | 'pia'
  | 'chuveiro'
  | 'bancada'
  | 'fogao'
  | 'geladeira'
  | 'balcao'
  | 'divisoria'
  | 'porta'
  | 'portas-fundo'
  | 'janela'

export interface Peca {
  tipo: TipoPeca
  x: number
  y: number
  w: number
  h: number
}

export interface Planta {
  comprimento: number
  largura: number
  pecas: Peca[]
  legenda: string
}

const LARGURA = MEDIDAS_METROS[20].interna.largura

function mesaComCadeira(x: number, y = 0.15): Peca[] {
  return [
    { tipo: 'mesa', x, y, w: 1.3, h: 0.65 },
    { tipo: 'cadeira', x: x + 0.42, y: y + 0.78, w: 0.46, h: 0.46 },
  ]
}

function prateleiras(x: number, comprimento: number): Peca[] {
  return [
    { tipo: 'prateleira', x, y: 0.08, w: comprimento, h: 0.5 },
    { tipo: 'prateleira', x, y: LARGURA - 0.58, w: comprimento, h: 0.5 },
  ]
}

function portasDoFundo(comprimento: number): Peca {
  return { tipo: 'portas-fundo', x: comprimento - 0.06, y: 0.1, w: 0.06, h: LARGURA - 0.2 }
}

function portaLateral(x: number): Peca {
  return { tipo: 'porta', x, y: LARGURA - 0.06, w: 0.85, h: 0.06 }
}

function janela(x: number, w = 1): Peca {
  return { tipo: 'janela', x, y: 0, w, h: 0.06 }
}

type Montador = (comprimento: number) => { pecas: Peca[]; legenda: string }

const PLANTAS: Partial<Record<`${Uso}-${Tamanho}`, Montador>> = {
  'escritorio-20': () => ({
    legenda: 'Duas estações de trabalho, armário e mesa de reunião',
    pecas: [
      ...mesaComCadeira(0.25),
      ...mesaComCadeira(1.85),
      { tipo: 'armario', x: 0.2, y: LARGURA - 0.5, w: 1.2, h: 0.45 },
      { tipo: 'mesa', x: 3.75, y: 0.75, w: 1.6, h: 0.8 },
      { tipo: 'cadeira', x: 3.95, y: 0.2, w: 0.46, h: 0.46 },
      { tipo: 'cadeira', x: 4.7, y: 0.2, w: 0.46, h: 0.46 },
      { tipo: 'cadeira', x: 4.3, y: 1.65, w: 0.46, h: 0.46 },
      portaLateral(2.2),
      janela(0.4),
      janela(3.9),
    ],
  }),
  'almoxarifado-10': (c) => ({
    legenda: 'Prateleiras nas duas paredes e corredor no meio',
    pecas: [...prateleiras(0.08, c - 0.3), portasDoFundo(c)],
  }),
  'almoxarifado-20': (c) => ({
    legenda: 'Prateleiras nas paredes e espaço para paletes perto da porta',
    pecas: [
      ...prateleiras(0.08, 3.9),
      { tipo: 'palete', x: 4.2, y: 0.15, w: 1.2, h: 0.95 },
      { tipo: 'palete', x: 4.2, y: 1.25, w: 1.2, h: 0.95 },
      portasDoFundo(c),
    ],
  }),
  'wc-20': () => ({
    legenda: 'Três cabines, chuveiro e bancada com pias',
    pecas: [
      ...[0, 1, 2].flatMap((i): Peca[] => [
        { tipo: 'vaso', x: 0.3 + i * 1.0, y: 0.12, w: 0.42, h: 0.6 },
        { tipo: 'divisoria', x: 1.05 + i * 1.0, y: 0, w: 0.05, h: 1.15 },
      ]),
      { tipo: 'chuveiro', x: 3.25, y: 0.1, w: 0.95, h: 0.95 },
      { tipo: 'divisoria', x: 4.25, y: 0, w: 0.05, h: 1.15 },
      { tipo: 'bancada', x: 0.3, y: LARGURA - 0.52, w: 2.6, h: 0.45 },
      { tipo: 'pia', x: 0.55, y: LARGURA - 0.47, w: 0.42, h: 0.34 },
      { tipo: 'pia', x: 1.4, y: LARGURA - 0.47, w: 0.42, h: 0.34 },
      { tipo: 'pia', x: 2.25, y: LARGURA - 0.47, w: 0.42, h: 0.34 },
      portaLateral(4.6),
      janela(4.5, 0.8),
    ],
  }),
  'cozinha-20': () => ({
    legenda: 'Bancada com pia e fogão, geladeira e mesa para a equipe',
    pecas: [
      { tipo: 'bancada', x: 0.1, y: 0.08, w: 3.4, h: 0.6 },
      { tipo: 'pia', x: 0.7, y: 0.14, w: 0.6, h: 0.45 },
      { tipo: 'fogao', x: 2.3, y: 0.12, w: 0.6, h: 0.52 },
      { tipo: 'geladeira', x: 3.65, y: 0.08, w: 0.7, h: 0.7 },
      { tipo: 'mesa', x: 1.0, y: 1.2, w: 2.0, h: 0.75 },
      { tipo: 'cadeira', x: 1.2, y: 0.82, w: 0.4, h: 0.36 },
      { tipo: 'cadeira', x: 2.4, y: 0.82, w: 0.4, h: 0.36 },
      portaLateral(4.4),
      janela(1.2, 1.2),
    ],
  }),
  'stand-40': (c) => ({
    legenda: 'Balcão na abertura frontal, vitrine ao fundo e depósito',
    pecas: [
      { tipo: 'prateleira', x: 0.5, y: 0.08, w: 8.8, h: 0.45 },
      { tipo: 'balcao', x: 1.2, y: LARGURA - 0.75, w: 7.4, h: 0.6 },
      { tipo: 'janela', x: 1.2, y: LARGURA - 0.06, w: 7.4, h: 0.06 },
      { tipo: 'divisoria', x: 9.7, y: 0, w: 0.07, h: LARGURA },
      { tipo: 'prateleira', x: 9.95, y: 0.08, w: 1.7, h: 0.5 },
      portasDoFundo(c),
    ],
  }),
  'hibrido-40': (c) => ({
    legenda: 'Escritório de um lado, depósito do outro, separados por divisória',
    pecas: [
      ...mesaComCadeira(0.3),
      ...mesaComCadeira(1.9),
      { tipo: 'armario', x: 3.6, y: 0.1, w: 1.3, h: 0.45 },
      { tipo: 'mesa', x: 3.5, y: 1.05, w: 1.5, h: 0.75 },
      portaLateral(1.4),
      janela(0.5),
      janela(2.4),
      { tipo: 'divisoria', x: 5.4, y: 0, w: 0.07, h: LARGURA },
      ...prateleiras(5.7, 4.6),
      { tipo: 'palete', x: 10.45, y: 0.6, w: 1.2, h: 1.0 },
      portasDoFundo(c),
    ],
  }),
}

export function plantaDe(uso: Uso, tamanho: Tamanho): Planta {
  const comprimento = MEDIDAS_METROS[tamanho].interna.comprimento
  const montar = PLANTAS[`${uso}-${tamanho}`]
  const { pecas, legenda } = montar
    ? montar(comprimento)
    : { pecas: [portasDoFundo(comprimento)], legenda: 'Espaço livre para a configuração que o seu projeto pedir' }
  return { comprimento, largura: LARGURA, pecas, legenda }
}

export function temPlanta(uso: Uso, tamanho: Tamanho): boolean {
  return `${uso}-${tamanho}` in PLANTAS
}
