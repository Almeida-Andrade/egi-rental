// A frota da EGI Rental só tem 10 e 20 pés (o check do OMNIS aceita 40, que o site ignora).
export type Tamanho = 10 | 20
export const TAMANHOS: Tamanho[] = [10, 20]

// Containers juntos pela lateral, formando um espaço mais largo.
export type Modulos = 1 | 2 | 3
export const MODULOS: Modulos[] = [1, 2, 3]

export interface Dimensoes {
  comprimento: number
  largura: number
  altura: number
}

// Padrão marítimo ISO, em metros. Container fabricado pode variar.
export const MEDIDAS_METROS: Record<Tamanho, { externa: Dimensoes; interna: Dimensoes }> = {
  10: { externa: { comprimento: 2.99, largura: 2.44, altura: 2.59 }, interna: { comprimento: 2.83, largura: 2.35, altura: 2.39 } },
  20: { externa: { comprimento: 6.06, largura: 2.44, altura: 2.59 }, interna: { comprimento: 5.9, largura: 2.35, altura: 2.39 } },
}

export interface Medidas {
  externa: string
  interna: string
  areaM2: number
}

export function metros(valor: number): string {
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function textoDimensoes(d: Dimensoes): string {
  // Espaço inquebrável antes do "m": a unidade nunca desce sozinha para a linha de baixo.
  return `${metros(d.comprimento)} × ${metros(d.largura)} × ${metros(d.altura)}\u00a0m`
}

// Lado a lado as paredes do meio saem: só as duas paredes de fora seguem comendo largura.
export function dimensoesJuntas(tamanho: Tamanho, modulos: Modulos): { externa: Dimensoes; interna: Dimensoes } {
  const { externa, interna } = MEDIDAS_METROS[tamanho]
  const largura = externa.largura * modulos
  return {
    externa: { ...externa, largura },
    interna: { ...interna, largura: Math.round((largura - (externa.largura - interna.largura)) * 1000) / 1000 },
  }
}

export function medidasJuntas(tamanho: Tamanho, modulos: Modulos): Medidas {
  const { externa, interna } = dimensoesJuntas(tamanho, modulos)
  return {
    externa: textoDimensoes(externa),
    interna: textoDimensoes(interna),
    areaM2: Math.round(interna.comprimento * interna.largura * 10) / 10,
  }
}

export const MEDIDAS: Record<Tamanho, Medidas> = { 10: medidasJuntas(10, 1), 20: medidasJuntas(20, 1) }
