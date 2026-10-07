import { MEDIDAS_METROS, metros, type Tamanho } from './medidas'

// O montador 3D do sob medida: tudo aqui é conta pura (limites, colisão, encaixe, link e resumo);
// a cena só desenha o projeto. Medidas em metros no piso INTERNO, origem num canto:
// x ao longo do comprimento, z na largura.
export type Giro = 0 | 90 | 180 | 270
export type Parede = 'n' | 's' | 'o' | 'l'

export type GrupoPeca = 'Escritório' | 'Armazenagem' | 'Banheiro' | 'Cozinha' | 'Descanso' | 'Loja' | 'Estrutura' | 'Parede'

interface PecaBase {
  nome: string
  grupo: GrupoPeca
  // largura (ao longo de x com giro 0), profundidade (z) e altura
  w: number
  d: number
  h: number
}

export const PECAS_PISO = {
  mesa: { nome: 'Mesa de trabalho', grupo: 'Escritório', w: 1.2, d: 0.6, h: 0.75 },
  cadeira: { nome: 'Cadeira', grupo: 'Escritório', w: 0.5, d: 0.5, h: 0.9 },
  armario: { nome: 'Armário', grupo: 'Escritório', w: 0.9, d: 0.45, h: 1.9 },
  gaveteiro: { nome: 'Gaveteiro', grupo: 'Escritório', w: 0.45, d: 0.55, h: 0.7 },
  reuniao: { nome: 'Mesa de reunião', grupo: 'Escritório', w: 1.6, d: 0.8, h: 0.75 },
  prateleira: { nome: 'Prateleira', grupo: 'Armazenagem', w: 1.0, d: 0.45, h: 2.0 },
  palete: { nome: 'Palete', grupo: 'Armazenagem', w: 1.2, d: 1.0, h: 0.15 },
  vaso: { nome: 'Vaso sanitário', grupo: 'Banheiro', w: 0.4, d: 0.65, h: 0.8 },
  pia: { nome: 'Pia', grupo: 'Banheiro', w: 0.5, d: 0.45, h: 0.85 },
  chuveiro: { nome: 'Box de chuveiro', grupo: 'Banheiro', w: 0.9, d: 0.9, h: 2.1 },
  bancada: { nome: 'Bancada com pia', grupo: 'Cozinha', w: 1.5, d: 0.6, h: 0.9 },
  geladeira: { nome: 'Geladeira', grupo: 'Cozinha', w: 0.7, d: 0.7, h: 1.8 },
  fogao: { nome: 'Fogão', grupo: 'Cozinha', w: 0.6, d: 0.6, h: 0.9 },
  refeicao: { nome: 'Mesa de refeição', grupo: 'Cozinha', w: 1.4, d: 0.8, h: 0.75 },
  cama: { nome: 'Cama', grupo: 'Descanso', w: 0.9, d: 1.9, h: 0.5 },
  beliche: { nome: 'Beliche', grupo: 'Descanso', w: 0.9, d: 1.9, h: 1.6 },
  sofa: { nome: 'Sofá', grupo: 'Descanso', w: 1.8, d: 0.8, h: 0.8 },
  balcao: { nome: 'Balcão de atendimento', grupo: 'Loja', w: 1.5, d: 0.6, h: 1.0 },
  vitrine: { nome: 'Vitrine', grupo: 'Loja', w: 1.0, d: 0.45, h: 1.8 },
  divisoria: { nome: 'Divisória', grupo: 'Estrutura', w: 1.2, d: 0.08, h: 2.3 },
} satisfies Record<string, PecaBase>

// Peças de parede: w é a largura ao longo da parede, h a altura, base a altura do peitoril.
export const PECAS_PAREDE = {
  porta: { nome: 'Porta', grupo: 'Parede', w: 0.9, d: 0.08, h: 2.1, base: 0 },
  janela: { nome: 'Janela', grupo: 'Parede', w: 1.0, d: 0.08, h: 1.0, base: 1.1 },
  ar: { nome: 'Ar-condicionado', grupo: 'Parede', w: 0.8, d: 0.25, h: 0.3, base: 1.9 },
} satisfies Record<string, PecaBase & { base: number }>

export type TipoPiso = keyof typeof PECAS_PISO
export type TipoParede = keyof typeof PECAS_PAREDE
export type TipoPeca = TipoPiso | TipoParede

export interface ItemPiso {
  id: string
  tipo: TipoPiso
  x: number
  z: number
  giro: Giro
}

export interface ItemParede {
  id: string
  tipo: TipoParede
  parede: Parede
  t: number
}

export type Item = ItemPiso | ItemParede

export const CORES_CHAPA = {
  azul: { nome: 'Azul EGI', hex: '#2b4ea2' },
  branco: { nome: 'Branco', hex: '#e8ebee' },
  cinza: { nome: 'Grafite', hex: '#5b6573' },
  verde: { nome: 'Verde', hex: '#3d6a52' },
  terracota: { nome: 'Terracota', hex: '#a2533c' },
  amarelo: { nome: 'Amarelo', hex: '#d6a21e' },
} as const

export type CorChapa = keyof typeof CORES_CHAPA

export interface Projeto {
  tamanho: Tamanho
  cor: CorChapa
  itens: Item[]
}

export const PASSO = 0.05
export const MAX_ITENS = 60

const FOLGA = 0.001
// Área livre na frente da porta, para ela abrir
const AREA_DA_PORTA = 0.8

export function ehParede(item: Item): item is ItemParede {
  return item.tipo in PECAS_PAREDE
}

export function ehTipoPiso(tipo: string): tipo is TipoPiso {
  return tipo in PECAS_PISO
}

export function ehTipoParede(tipo: string): tipo is TipoParede {
  return tipo in PECAS_PAREDE
}

export function interno(tamanho: Tamanho) {
  const { comprimento, largura, altura } = MEDIDAS_METROS[tamanho].interna
  return { c: comprimento, l: largura, a: altura }
}

export function encaixar(v: number, passo = PASSO): number {
  return Math.round(Math.round(v / passo) * passo * 1000) / 1000
}

export function pegada(item: ItemPiso): { w: number; d: number } {
  const p = PECAS_PISO[item.tipo]
  return item.giro === 90 || item.giro === 270 ? { w: p.d, d: p.w } : { w: p.w, d: p.d }
}

export function comprimentoDaParede(parede: Parede, tamanho: Tamanho): number {
  const { c, l } = interno(tamanho)
  return parede === 'n' || parede === 's' ? c : l
}

function limitar(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v))
}

export function limitarPiso(item: ItemPiso, tamanho: Tamanho): ItemPiso {
  const { c, l } = interno(tamanho)
  const { w, d } = pegada(item)
  return {
    ...item,
    x: encaixar(limitar(item.x, w / 2, Math.max(w / 2, c - w / 2))),
    z: encaixar(limitar(item.z, d / 2, Math.max(d / 2, l - d / 2))),
  }
}

export function limitarParede(item: ItemParede, tamanho: Tamanho): ItemParede {
  const comp = comprimentoDaParede(item.parede, tamanho)
  const w = PECAS_PAREDE[item.tipo].w
  return { ...item, t: encaixar(limitar(item.t, w / 2, Math.max(w / 2, comp - w / 2))) }
}

export function cabe(item: Item, tamanho: Tamanho): boolean {
  if (ehParede(item)) return PECAS_PAREDE[item.tipo].w <= comprimentoDaParede(item.parede, tamanho)
  const { c, l } = interno(tamanho)
  const { w, d } = pegada(item)
  return w <= c && d <= l
}

interface Retangulo {
  x0: number
  x1: number
  z0: number
  z1: number
}

export function retanguloDoPiso(item: ItemPiso): Retangulo {
  const { w, d } = pegada(item)
  return { x0: item.x - w / 2, x1: item.x + w / 2, z0: item.z - d / 2, z1: item.z + d / 2 }
}

// A faixa de piso que a porta precisa livre para abrir, do lado de dentro.
export function areaDaPorta(item: ItemParede, tamanho: Tamanho): Retangulo | null {
  if (item.tipo !== 'porta') return null
  const { c, l } = interno(tamanho)
  const meio = PECAS_PAREDE.porta.w / 2
  switch (item.parede) {
    case 'n':
      return { x0: item.t - meio, x1: item.t + meio, z0: 0, z1: AREA_DA_PORTA }
    case 's':
      return { x0: item.t - meio, x1: item.t + meio, z0: l - AREA_DA_PORTA, z1: l }
    case 'o':
      return { x0: 0, x1: AREA_DA_PORTA, z0: item.t - meio, z1: item.t + meio }
    case 'l':
      return { x0: c - AREA_DA_PORTA, x1: c, z0: item.t - meio, z1: item.t + meio }
  }
}

function cruzam(a: Retangulo, b: Retangulo): boolean {
  return a.x0 < b.x1 - FOLGA && b.x0 < a.x1 - FOLGA && a.z0 < b.z1 - FOLGA && b.z0 < a.z1 - FOLGA
}

// Ids de peças em conflito: móvel sobre móvel, peças sobrepostas na mesma parede e móvel na
// frente de porta. O conflito é aviso na tela, nunca impede de montar.
export function conflitos(projeto: Projeto): Set<string> {
  const ruins = new Set<string>()
  const piso = projeto.itens.filter((i): i is ItemPiso => !ehParede(i))
  const parede = projeto.itens.filter(ehParede)

  for (let i = 0; i < piso.length; i++)
    for (let j = i + 1; j < piso.length; j++)
      if (cruzam(retanguloDoPiso(piso[i]), retanguloDoPiso(piso[j]))) {
        ruins.add(piso[i].id)
        ruins.add(piso[j].id)
      }

  for (let i = 0; i < parede.length; i++)
    for (let j = i + 1; j < parede.length; j++) {
      const a = parede[i]
      const b = parede[j]
      if (a.parede !== b.parede) continue
      const meioA = PECAS_PAREDE[a.tipo].w / 2
      const meioB = PECAS_PAREDE[b.tipo].w / 2
      if (Math.abs(a.t - b.t) < meioA + meioB - FOLGA) {
        ruins.add(a.id)
        ruins.add(b.id)
      }
    }

  for (const porta of parede) {
    const area = areaDaPorta(porta, projeto.tamanho)
    if (!area) continue
    for (const m of piso)
      if (cruzam(area, retanguloDoPiso(m))) {
        ruins.add(porta.id)
        ruins.add(m.id)
      }
  }

  for (const item of projeto.itens) if (!cabe(item, projeto.tamanho)) ruins.add(item.id)
  return ruins
}

// Só a peça nova contra as outras: é o que roda milhares de vezes ao procurar um lugar livre.
function conflitaCom(projeto: Projeto, novo: Item): boolean {
  if (!cabe(novo, projeto.tamanho)) return true
  for (const outro of projeto.itens) {
    if (ehParede(novo) && ehParede(outro)) {
      if (outro.parede === novo.parede && Math.abs(outro.t - novo.t) < (PECAS_PAREDE[outro.tipo].w + PECAS_PAREDE[novo.tipo].w) / 2 - FOLGA)
        return true
    } else if (!ehParede(novo) && !ehParede(outro)) {
      if (cruzam(retanguloDoPiso(novo), retanguloDoPiso(outro))) return true
    } else {
      const porta = ehParede(novo) ? novo : (outro as ItemParede)
      const movel = ehParede(novo) ? (outro as ItemPiso) : novo
      const area = areaDaPorta(porta, projeto.tamanho)
      if (area && cruzam(area, retanguloDoPiso(movel))) return true
    }
  }
  return false
}

export function proximoId(projeto: Projeto): string {
  const maior = projeto.itens.reduce((m, i) => Math.max(m, Number(i.id) || 0), 0)
  return String(maior + 1)
}

// Primeiro lugar livre, varrendo a partir de um canto; sem lugar livre, o centro (vira aviso).
export function adicionar(projeto: Projeto, tipo: TipoPeca, giros: Giro[] = [0, 90]): Projeto {
  if (projeto.itens.length >= MAX_ITENS) return projeto
  const id = proximoId(projeto)
  const { c, l } = interno(projeto.tamanho)

  if (ehTipoParede(tipo)) {
    const paredes: Parede[] = ['n', 's', 'o', 'l']
    for (const parede of paredes) {
      const comp = comprimentoDaParede(parede, projeto.tamanho)
      for (let t = PECAS_PAREDE[tipo].w / 2; t <= comp - PECAS_PAREDE[tipo].w / 2 + FOLGA; t += 0.1) {
        const novo = limitarParede({ id, tipo, parede, t }, projeto.tamanho)
        if (!conflitaCom(projeto, novo)) return { ...projeto, itens: [...projeto.itens, novo] }
      }
    }
    return { ...projeto, itens: [...projeto.itens, limitarParede({ id, tipo, parede: 'n', t: c / 2 }, projeto.tamanho)] }
  }

  for (const giro of giros)
    for (let x = 0; x <= c; x += 0.1)
      for (let z = 0; z <= l; z += 0.1) {
        const novo = limitarPiso({ id, tipo, x, z, giro }, projeto.tamanho)
        if (!conflitaCom(projeto, novo)) return { ...projeto, itens: [...projeto.itens, novo] }
      }
  const centro = limitarPiso({ id, tipo, x: c / 2, z: l / 2, giro: 0 }, projeto.tamanho)
  return { ...projeto, itens: [...projeto.itens, centro] }
}

export function girar(item: ItemPiso, tamanho: Tamanho): ItemPiso {
  return limitarPiso({ ...item, giro: ((item.giro + 90) % 360) as Giro }, tamanho)
}

export function duplicar(projeto: Projeto, id: string): Projeto {
  const original = projeto.itens.find((i) => i.id === id)
  if (!original) return projeto
  return ehParede(original) ? adicionar(projeto, original.tipo) : adicionar(projeto, original.tipo, [original.giro])
}

export function trocarTamanho(projeto: Projeto, tamanho: Tamanho): Projeto {
  const itens = projeto.itens
    .map((i) => (ehParede(i) ? limitarParede(i, tamanho) : limitarPiso(i, tamanho)))
    .filter((i) => cabe(i, tamanho))
  return { ...projeto, tamanho, itens }
}

export function areaOcupada(projeto: Projeto): number {
  const { c, l } = interno(projeto.tamanho)
  const soma = projeto.itens
    .filter((i): i is ItemPiso => !ehParede(i))
    .reduce((s, i) => {
      const { w, d } = pegada(i)
      return s + w * d
    }, 0)
  return Math.min(100, Math.round((soma / (c * l)) * 100))
}

export function nomeDaPeca(tipo: TipoPeca): string {
  return ehTipoParede(tipo) ? PECAS_PAREDE[tipo].nome : PECAS_PISO[tipo].nome
}

export function contagem(projeto: Projeto): { tipo: TipoPeca; nome: string; quantidade: number }[] {
  const mapa = new Map<TipoPeca, number>()
  for (const i of projeto.itens) mapa.set(i.tipo, (mapa.get(i.tipo) ?? 0) + 1)
  return [...mapa.entries()].map(([tipo, quantidade]) => ({ tipo, nome: nomeDaPeca(tipo), quantidade }))
}

export function resumoDoProjeto(projeto: Projeto, link: string): string {
  const { c, l } = interno(projeto.tamanho)
  const linhas = contagem(projeto).map((item) => `• ${item.quantidade} × ${item.nome.toLowerCase()}`)
  return [
    'Olá! Montei um container no site e quero conversar sobre o projeto.',
    '',
    `*Container:* ${projeto.tamanho} pés, cor ${CORES_CHAPA[projeto.cor].nome.toLowerCase()}`,
    `*Área interna:* ${metros(c)} × ${metros(l)} m`,
    ...(linhas.length ? ['*Itens:*', ...linhas] : ['*Itens:* nenhum ainda']),
    '',
    `*Ver o projeto:* ${link}`,
  ].join('\n')
}

// ---------- Link do projeto ----------
// Formato compacto e versionado: [1, tamanho, cor, [[tipo, xcm, zcm, giro] | [tipo, parede, tcm]]].

const TIPOS: TipoPeca[] = [...(Object.keys(PECAS_PISO) as TipoPiso[]), ...(Object.keys(PECAS_PAREDE) as TipoParede[])]
const PAREDES: Parede[] = ['n', 's', 'o', 'l']
const CORES = Object.keys(CORES_CHAPA) as CorChapa[]

function paraBase64Url(texto: string): string {
  const bytes = new TextEncoder().encode(texto)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function deBase64Url(texto: string): string {
  const bin = atob(texto.replace(/-/g, '+').replace(/_/g, '/'))
  return new TextDecoder().decode(Uint8Array.from(bin, (ch) => ch.charCodeAt(0)))
}

export function codificar(projeto: Projeto): string {
  const itens = projeto.itens.map((i) =>
    ehParede(i)
      ? [TIPOS.indexOf(i.tipo), PAREDES.indexOf(i.parede), Math.round(i.t * 100)]
      : [TIPOS.indexOf(i.tipo), Math.round(i.x * 100), Math.round(i.z * 100), i.giro / 90],
  )
  return paraBase64Url(JSON.stringify([1, projeto.tamanho, CORES.indexOf(projeto.cor), itens]))
}

// Link de fora é entrada não confiável: tudo é conferido e limitado, e o que não serve é descartado.
export function decodificar(texto: string | null | undefined): Projeto | null {
  if (!texto || texto.length > 4000) return null
  try {
    const dado: unknown = JSON.parse(deBase64Url(texto))
    if (!Array.isArray(dado) || dado[0] !== 1) return null
    const [, tamanho, corIdx, brutos] = dado
    if (tamanho !== 10 && tamanho !== 20 && tamanho !== 40) return null
    const cor = CORES[Number(corIdx)] ?? 'azul'
    if (!Array.isArray(brutos)) return null

    const itens: Item[] = []
    for (const bruto of brutos.slice(0, MAX_ITENS)) {
      if (!Array.isArray(bruto) || !bruto.every((n) => Number.isFinite(n))) continue
      const tipo = TIPOS[bruto[0]]
      const id = String(itens.length + 1)
      if (!tipo) continue
      if (ehTipoParede(tipo) && bruto.length === 3) {
        const parede = PAREDES[bruto[1]]
        if (!parede) continue
        itens.push(limitarParede({ id, tipo, parede, t: bruto[2] / 100 }, tamanho))
      } else if (ehTipoPiso(tipo) && bruto.length === 4) {
        const giro = ((Math.abs(Math.trunc(bruto[3])) % 4) * 90) as Giro
        itens.push(limitarPiso({ id, tipo, x: bruto[1] / 100, z: bruto[2] / 100, giro }, tamanho))
      }
    }
    return { tamanho, cor, itens: itens.filter((i) => cabe(i, tamanho)) }
  } catch {
    return null
  }
}

// ---------- Pontos de partida ----------

export const PONTOS_DE_PARTIDA = {
  vazio: { nome: 'Vazio', tamanho: 20 },
  escritorio: { nome: 'Escritório', tamanho: 20 },
  banheiro: { nome: 'Banheiro', tamanho: 20 },
  loja: { nome: 'Loja / stand', tamanho: 40 },
} as const satisfies Record<string, { nome: string; tamanho: Tamanho }>

export type PontoDePartida = keyof typeof PONTOS_DE_PARTIDA

export function projetoInicial(ponto: PontoDePartida = 'escritorio'): Projeto {
  const tamanho = PONTOS_DE_PARTIDA[ponto].tamanho
  const montar = (pisos: Omit<ItemPiso, 'id'>[], aberturas: Omit<ItemParede, 'id'>[]): Projeto => ({
    tamanho,
    cor: 'azul',
    itens: [
      ...pisos.map((i, k) => limitarPiso({ ...i, id: String(k + 1) }, tamanho)),
      ...aberturas.map((a, k) => limitarParede({ ...a, id: String(pisos.length + k + 1) }, tamanho)),
    ],
  })

  switch (ponto) {
    case 'vazio':
      return montar([], [{ tipo: 'porta', parede: 's', t: 3 }])
    case 'escritorio':
      return montar(
        [
          { tipo: 'mesa', x: 0.8, z: 0.35, giro: 0 },
          { tipo: 'cadeira', x: 0.8, z: 0.95, giro: 0 },
          { tipo: 'mesa', x: 2.2, z: 0.35, giro: 0 },
          { tipo: 'cadeira', x: 2.2, z: 0.95, giro: 0 },
          { tipo: 'armario', x: 0.55, z: 2.1, giro: 180 },
          { tipo: 'reuniao', x: 4.7, z: 1.25, giro: 0 },
          { tipo: 'cadeira', x: 4.3, z: 0.5, giro: 180 },
          { tipo: 'cadeira', x: 5.1, z: 0.5, giro: 180 },
        ],
        [
          { tipo: 'porta', parede: 's', t: 2.75 },
          { tipo: 'janela', parede: 'n', t: 1.5 },
          { tipo: 'janela', parede: 'n', t: 4.7 },
          { tipo: 'ar', parede: 'o', t: 1.2 },
        ],
      )
    case 'banheiro':
      return montar(
        [
          { tipo: 'vaso', x: 0.45, z: 0.4, giro: 0 },
          { tipo: 'divisoria', x: 0.95, z: 0.6, giro: 90 },
          { tipo: 'vaso', x: 1.45, z: 0.4, giro: 0 },
          { tipo: 'divisoria', x: 1.95, z: 0.6, giro: 90 },
          { tipo: 'chuveiro', x: 2.6, z: 0.5, giro: 0 },
          { tipo: 'pia', x: 0.6, z: 2.1, giro: 180 },
          { tipo: 'pia', x: 1.3, z: 2.1, giro: 180 },
        ],
        [
          { tipo: 'porta', parede: 's', t: 4.6 },
          { tipo: 'janela', parede: 'n', t: 4.6 },
        ],
      )
    case 'loja':
      return montar(
        [
          { tipo: 'vitrine', x: 1.0, z: 0.25, giro: 0 },
          { tipo: 'vitrine', x: 2.2, z: 0.25, giro: 0 },
          { tipo: 'vitrine', x: 3.4, z: 0.25, giro: 0 },
          { tipo: 'balcao', x: 6.0, z: 1.3, giro: 0 },
          { tipo: 'divisoria', x: 9.5, z: 0.6, giro: 90 },
          { tipo: 'prateleira', x: 10.6, z: 0.25, giro: 0 },
        ],
        [
          { tipo: 'janela', parede: 's', t: 3 },
          { tipo: 'janela', parede: 's', t: 4.2 },
          { tipo: 'porta', parede: 's', t: 7.8 },
          { tipo: 'porta', parede: 'l', t: 1.2 },
        ],
      )
  }
}
