import { describe, expect, it } from 'vitest'
import { FROTA_RESERVA, montarCatalogo } from '@/lib/catalogo'
import { MEDIDAS, MEDIDAS_METROS } from '@/lib/modelos'
import { plantaDe, temPlanta } from '@/lib/plantas'

const catalogo = montarCatalogo(FROTA_RESERVA)

describe('medidas', () => {
  it('o texto sai dos números, com vírgula e duas casas', () => {
    expect(MEDIDAS[20].externa).toBe('6,06 × 2,44 × 2,59 m')
    expect(MEDIDAS[40].areaM2).toBe(28.3)
    expect(MEDIDAS[10].areaM2).toBe(6.7)
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

  it('toda peça cabe dentro do container', () => {
    for (const m of catalogo) {
      const p = plantaDe(m.uso, m.tamanho)
      for (const peca of p.pecas) {
        expect(peca.x, `${m.slug} ${peca.tipo}`).toBeGreaterThanOrEqual(0)
        expect(peca.y, `${m.slug} ${peca.tipo}`).toBeGreaterThanOrEqual(0)
        expect(peca.x + peca.w, `${m.slug} ${peca.tipo}`).toBeLessThanOrEqual(p.comprimento + 1e-9)
        expect(peca.y + peca.h, `${m.slug} ${peca.tipo}`).toBeLessThanOrEqual(p.largura + 1e-9)
      }
    }
  })

  it('móveis não se sobrepõem (paredes, portas e janelas podem encostar)', () => {
    const solidos = new Set(['mesa', 'armario', 'prateleira', 'palete', 'vaso', 'chuveiro', 'bancada', 'geladeira', 'balcao', 'cadeira'])
    for (const m of catalogo) {
      const pecas = plantaDe(m.uso, m.tamanho).pecas.filter((p) => solidos.has(p.tipo))
      for (let i = 0; i < pecas.length; i++)
        for (let j = i + 1; j < pecas.length; j++) {
          const a = pecas[i]
          const b = pecas[j]
          const cruza = a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h
          expect(cruza, `${m.slug}: ${a.tipo} × ${b.tipo}`).toBe(false)
        }
    }
  })

  it('modelo sem desenho cai num espaço livre com a porta', () => {
    const p = plantaDe('vestiario', 20)
    expect(p.pecas.map((x) => x.tipo)).toEqual(['portas-fundo'])
  })
})
