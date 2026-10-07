import { describe, expect, it } from 'vitest'
import {
  APROVACAO,
  duracaoEmMeses,
  economiaDeEnergia,
  exemploDePrazo,
  FONTES,
  MESES_DE_EXEMPLO,
  RESIDUO,
  REUSO,
  TEMPO,
  tempoRelativo,
} from '@/lib/numeros'

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

describe('exemplo de prazo', () => {
  it('escreve a duração por extenso, de meio em meio mês', () => {
    expect(duracaoEmMeses(1.5)).toBe('1 mês e meio')
    expect(duracaoEmMeses(1)).toBe('1 mês')
    expect(duracaoEmMeses(6)).toBe('6 meses')
    expect(duracaoEmMeses(2.5)).toBe('2 meses e meio')
  })

  it('usa o melhor caso da fonte: 3 meses de obra viram 1 mês e meio', () => {
    expect(exemploDePrazo(3)).toEqual({ tradicional: '3 meses', modular: '1 mês e meio' })
    expect(exemploDePrazo(12)).toEqual({ tradicional: '12 meses', modular: '6 meses' })
    for (const m of MESES_DE_EXEMPLO) expect(exemploDePrazo(m).modular).not.toBe('menos de um mês')
  })
})
