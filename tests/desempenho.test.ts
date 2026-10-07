import { describe, expect, it } from 'vitest'
import { nivelDoAparelho, QUADROS_PARA_JULGAR, quadrosLentos } from '@/lib/desempenho'

describe('nível do aparelho', () => {
  it('computador comum fica no normal, mesmo sem os sinais que o Safari e o Firefox não dão', () => {
    expect(nivelDoAparelho({ nucleos: 8, memoriaGb: 8 })).toBe('normal')
    expect(nivelDoAparelho({})).toBe('normal')
  })

  it('pouca memória, poucos núcleos ou economia de dados descem para o leve', () => {
    expect(nivelDoAparelho({ nucleos: 8, memoriaGb: 4 })).toBe('leve')
    expect(nivelDoAparelho({ nucleos: 4, memoriaGb: 8 })).toBe('leve')
    expect(nivelDoAparelho({ nucleos: 8, economiaDeDados: true })).toBe('leve')
  })

  it('celular de tela muito densa com processador modesto é leve; o topo de linha não', () => {
    expect(nivelDoAparelho({ celular: true, densidade: 3, nucleos: 6 })).toBe('leve')
    expect(nivelDoAparelho({ celular: true, densidade: 3, nucleos: 8, memoriaGb: 8 })).toBe('normal')
  })
})

describe('quadros lentos', () => {
  const repetir = (ms: number, n = QUADROS_PARA_JULGAR) => Array.from({ length: n }, () => ms)

  it('60 fps passa e 30 fps não', () => {
    expect(quadrosLentos(repetir(16.7))).toBe(false)
    expect(quadrosLentos(repetir(33.3))).toBe(true)
  })

  it('travadas frequentes reprovam mesmo com a mediana boa', () => {
    const misto = [...repetir(16.7, 40), ...repetir(50, 8)]
    expect(quadrosLentos(misto)).toBe(true)
  })

  it('com poucos quadros ainda não julga', () => {
    expect(quadrosLentos(repetir(100, 10))).toBe(false)
  })
})
