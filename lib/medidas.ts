// Os tamanhos são os do check da tabela `containers` do OMNIS (0153).
export type Tamanho = 10 | 20 | 40

export interface Dimensoes {
  comprimento: number
  largura: number
  altura: number
}

// Padrão marítimo ISO, em metros. Container fabricado pode variar.
export const MEDIDAS_METROS: Record<Tamanho, { externa: Dimensoes; interna: Dimensoes }> = {
  10: { externa: { comprimento: 2.99, largura: 2.44, altura: 2.59 }, interna: { comprimento: 2.83, largura: 2.35, altura: 2.39 } },
  20: { externa: { comprimento: 6.06, largura: 2.44, altura: 2.59 }, interna: { comprimento: 5.9, largura: 2.35, altura: 2.39 } },
  40: { externa: { comprimento: 12.19, largura: 2.44, altura: 2.59 }, interna: { comprimento: 12.03, largura: 2.35, altura: 2.39 } },
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
  return `${metros(d.comprimento)} × ${metros(d.largura)} × ${metros(d.altura)} m`
}

function medidasDe(tamanho: Tamanho): Medidas {
  const { externa, interna } = MEDIDAS_METROS[tamanho]
  return {
    externa: textoDimensoes(externa),
    interna: textoDimensoes(interna),
    areaM2: Math.round(interna.comprimento * interna.largura * 10) / 10,
  }
}

export const MEDIDAS: Record<Tamanho, Medidas> = { 10: medidasDe(10), 20: medidasDe(20), 40: medidasDe(40) }
