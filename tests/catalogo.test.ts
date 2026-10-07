import { describe, expect, it } from 'vitest'
import {
  FROTA_RESERVA,
  modeloPorSlug,
  montarCatalogo,
  outrosModelos,
  slugDoModelo,
  tamanhosDoCatalogo,
} from '@/lib/catalogo'

describe('montarCatalogo', () => {
  it('junta as linhas do mesmo uso e tamanho num modelo só, com as fabricações', () => {
    const catalogo = montarCatalogo([
      { uso: 'escritorio', tamanho_pes: 20, fabricacao: 'maritimo' },
      { uso: 'escritorio', tamanho_pes: 20, fabricacao: 'fabricado' },
      { uso: 'escritorio', tamanho_pes: 20, fabricacao: null },
    ])
    expect(catalogo).toHaveLength(1)
    expect(catalogo[0].slug).toBe('escritorio-20-pes')
    expect(catalogo[0].nomeCompleto).toBe('Escritório 20 pés')
    expect(catalogo[0].fabricacoes).toEqual(['fabricado', 'maritimo'])
  })

  it('separa tamanhos diferentes do mesmo uso', () => {
    const catalogo = montarCatalogo([
      { uso: 'almoxarifado', tamanho_pes: 20, fabricacao: null },
      { uso: 'almoxarifado', tamanho_pes: 10, fabricacao: null },
    ])
    expect(catalogo.map((m) => m.slug)).toEqual(['almoxarifado-10-pes', 'almoxarifado-20-pes'])
  })

  it('ignora linha sem tamanho e manda uso desconhecido para "outro"', () => {
    const catalogo = montarCatalogo([
      { uso: 'almoxarifado', tamanho_pes: null, fabricacao: null },
      { uso: 'garagem', tamanho_pes: 20, fabricacao: null },
    ])
    expect(catalogo.map((m) => m.uso)).toEqual(['outro'])
  })

  it('ordena pelo uso mais pedido e depois pelo tamanho', () => {
    const catalogo = montarCatalogo([
      { uso: 'stand', tamanho_pes: 20, fabricacao: null },
      { uso: 'wc', tamanho_pes: 20, fabricacao: null },
      { uso: 'escritorio', tamanho_pes: 20, fabricacao: null },
    ])
    expect(catalogo.map((m) => m.uso)).toEqual(['escritorio', 'wc', 'stand'])
  })

  it('usa a capa do tamanho quando existe e não repete a capa na galeria', () => {
    const [dez, vinte] = montarCatalogo([
      { uso: 'almoxarifado', tamanho_pes: 10, fabricacao: null },
      { uso: 'almoxarifado', tamanho_pes: 20, fabricacao: null },
    ])
    expect(dez.capa.src).not.toBe(vinte.capa.src)
    for (const m of [dez, vinte]) expect(m.galeria.some((f) => f.src === m.capa.src)).toBe(false)
  })

  it('usa as medidas do padrão marítimo pelo tamanho', () => {
    const [modelo] = montarCatalogo([{ uso: 'stand', tamanho_pes: 20, fabricacao: null }])
    expect(modelo.medidas.areaM2).toBe(13.9)
  })

  it('a frota não tem 40 pés: linha de 40 que venha do banco fica fora do site', () => {
    const catalogo = montarCatalogo([
      { uso: 'stand', tamanho_pes: 40, fabricacao: 'maritimo' },
      { uso: 'escritorio', tamanho_pes: 20, fabricacao: null },
    ])
    expect(catalogo.map((m) => m.slug)).toEqual(['escritorio-20-pes'])
  })

  it('a frota de reserva gera slugs únicos e todo modelo tem capa', () => {
    const catalogo = montarCatalogo(FROTA_RESERVA)
    const slugs = catalogo.map((m) => m.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    expect(catalogo.every((m) => m.capa.src.startsWith('/fotos/'))).toBe(true)
  })
})

describe('buscas no catálogo', () => {
  const catalogo = montarCatalogo(FROTA_RESERVA)

  it('acha o modelo pelo slug', () => {
    expect(modeloPorSlug(catalogo, slugDoModelo('wc', 20))?.nome).toBe('Sanitário')
    expect(modeloPorSlug(catalogo, 'nao-existe')).toBeUndefined()
  })

  it('sugere primeiro os outros modelos do mesmo tamanho, sem repetir o atual', () => {
    const atual = modeloPorSlug(catalogo, 'escritorio-20-pes')!
    const outros = outrosModelos(catalogo, atual, 3)
    expect(outros).toHaveLength(3)
    expect(outros.some((m) => m.slug === atual.slug)).toBe(false)
    expect(outros.every((m) => m.tamanho === 20)).toBe(true)
  })

  it('lista os tamanhos existentes em ordem', () => {
    expect(tamanhosDoCatalogo(catalogo)).toEqual([10, 20])
  })
})
