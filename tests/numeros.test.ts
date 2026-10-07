import { describe, expect, it } from 'vitest'
import { APROVACAO, economiaDeEnergia, FONTES, RESIDUO, REUSO, TEMPO, tempoRelativo } from '@/lib/numeros'

describe('números do setor', () => {
  it('todo número aponta para uma fonte com link https', () => {
    for (const n of [TEMPO, RESIDUO, APROVACAO, REUSO]) {
      const fonte = FONTES[n.fonte]
      expect(fonte.url.startsWith('https://')).toBe(true)
      expect(fonte.nome.length).toBeGreaterThan(10)
    }
  })

  it('o tempo modular fica entre metade e quatro quintos do tradicional', () => {
    expect(tempoRelativo(TEMPO.menosMax)).toBe(50)
    expect(tempoRelativo(TEMPO.menosMin)).toBe(80)
  })

  it('reusar em vez de derreter economiza de 90% a 95% da energia', () => {
    expect(economiaDeEnergia()).toEqual({ min: 90, max: 95 })
  })

  it('percentuais ficam entre 0 e 100', () => {
    for (const v of [TEMPO.menosMin, TEMPO.menosMax, RESIDUO.menosAte, economiaDeEnergia().max, APROVACAO.deCada10 * 10]) {
      expect(v).toBeGreaterThan(0)
      expect(v).toBeLessThanOrEqual(100)
    }
  })
})
