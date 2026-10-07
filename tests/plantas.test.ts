import { describe, expect, it } from 'vitest'
import { FROTA_RESERVA, montarCatalogo } from '@/lib/catalogo'
import { MEDIDAS, MEDIDAS_METROS } from '@/lib/modelos'
import { dimensoesJuntas, medidasJuntas, MODULOS } from '@/lib/medidas'
import { plantaDe, temPlanta } from '@/lib/plantas'

const catalogo = montarCatalogo(FROTA_RESERVA)

describe('medidas', () => {
  it('o texto sai dos números, com vírgula e duas casas', () => {
    expect(MEDIDAS[20].externa).toBe('6,06 × 2,44 × 2,59\u00a0m')
    expect(MEDIDAS[20].areaM2).toBe(13.9)
    expect(MEDIDAS[10].areaM2).toBe(6.7)
  })

  it('lado a lado, só as duas paredes de fora comem largura', () => {
    expect(dimensoesJuntas(20, 1).interna.largura).toBe(2.35)
    expect(dimensoesJuntas(20, 2).externa.largura).toBe(4.88)
    expect(dimensoesJuntas(20, 2).interna.largura).toBe(4.79)
    expect(dimensoesJuntas(20, 3).interna.largura).toBe(7.23)
    expect(medidasJuntas(20, 2).areaM2).toBe(28.3)
    expect(medidasJuntas(20, 2).externa).toBe('6,06 × 4,88 × 2,59\u00a0m')
  })

  it('o interno é sempre menor que o externo', () => {
    for (const { externa, interna } of Object.values(MEDIDAS_METROS)) {
      expect(interna.comprimento).toBeLessThan(externa.comprimento)
      expect(interna.largura).toBeLessThan(externa.largura)
    }
  })
})

describe('plantas', () => {
  it('todo modelo da frota tem planta desenhada', () => {
    for (const m of catalogo) expect(temPlanta(m.uso, m.tamanho), m.slug).toBe(true)
  })

  it('toda peça cabe dentro do container, sozinho ou lado a lado', () => {
    for (const m of catalogo)
      for (const n of MODULOS) {
        const p = plantaDe(m.uso, m.tamanho, n)
        expect(p.largura).toBe(dimensoesJuntas(m.tamanho, n).interna.largura)
        for (const peca of p.pecas) {
          const nome = `${m.slug} ×${n} ${peca.tipo}`
          expect(peca.x, nome).toBeGreaterThanOrEqual(0)
          expect(peca.y, nome).toBeGreaterThanOrEqual(0)
          expect(peca.x + peca.w, nome).toBeLessThanOrEqual(p.comprimento + 1e-9)
          expect(peca.y + peca.h, nome).toBeLessThanOrEqual(p.largura + 1e-9)
        }
      }
  })

  it('móveis não se sobrepõem (paredes, portas e janelas podem encostar)', () => {
    const solidos = new Set(['mesa', 'armario', 'prateleira', 'palete', 'vaso', 'chuveiro', 'bancada', 'geladeira', 'balcao', 'cadeira'])
    for (const m of catalogo)
      for (const n of MODULOS) {
        const pecas = plantaDe(m.uso, m.tamanho, n).pecas.filter((p) => solidos.has(p.tipo))
        for (let i = 0; i < pecas.length; i++)
          for (let j = i + 1; j < pecas.length; j++) {
            const a = pecas[i]
            const b = pecas[j]
            const cruza = a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h
            expect(cruza, `${m.slug} ×${n}: ${a.tipo} × ${b.tipo}`).toBe(false)
          }
      }
  })

  it('lado a lado, porta e janela da parede comprida só ficam nas paredes de fora', () => {
    const uma = plantaDe('escritorio', 20)
    const tres = plantaDe('escritorio', 20, 3)
    const conta = (p: typeof uma, tipo: string) => p.pecas.filter((x) => x.tipo === tipo).length
    expect(conta(tres, 'porta')).toBe(conta(uma, 'porta'))
    expect(conta(tres, 'janela')).toBe(conta(uma, 'janela'))
    expect(conta(tres, 'mesa')).toBe(conta(uma, 'mesa') * 3)
    expect(conta(tres, 'emenda')).toBe(2)
    const porta = tres.pecas.find((x) => x.tipo === 'porta')!
    expect(porta.y + porta.h).toBeCloseTo(tres.largura)
    expect(tres.legenda).toMatch(/^Três containers lado a lado/)
  })

  it('modelo sem desenho cai num espaço livre com a porta', () => {
    const p = plantaDe('vestiario', 20)
    expect(p.pecas.map((x) => x.tipo)).toEqual(['portas-fundo'])
  })
})
