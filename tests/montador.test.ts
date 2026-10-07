import { describe, expect, it } from 'vitest'
import {
  adicionar,
  areaOcupada,
  codificar,
  conflitos,
  contagem,
  decodificar,
  duplicar,
  encaixar,
  girar,
  interno,
  limitarParede,
  limitarPiso,
  MAX_ITENS,
  PONTOS_DE_PARTIDA,
  projetoInicial,
  resumoDoProjeto,
  trocarTamanho,
  type ItemPiso,
  type PontoDePartida,
  type Projeto,
} from '@/lib/montador'

const vazio: Projeto = { tamanho: 20, cor: 'azul', itens: [] }

describe('pontos de partida', () => {
  it('nenhum nasce com peça em conflito ou fora do container', () => {
    for (const ponto of Object.keys(PONTOS_DE_PARTIDA) as PontoDePartida[]) {
      const p = projetoInicial(ponto)
      expect([...conflitos(p)], ponto).toEqual([])
      expect(p.itens.length, ponto).toBeGreaterThan(0)
    }
  })
})

describe('limites e encaixe', () => {
  it('encaixa de 5 em 5 cm', () => {
    expect(encaixar(1.234)).toBe(1.25)
    expect(encaixar(0.02)).toBe(0)
  })

  it('a peça de piso nunca sai do piso interno, nem girada', () => {
    const { c, l } = interno(20)
    const mesa = limitarPiso({ id: '1', tipo: 'mesa', x: 99, z: -5, giro: 90 }, 20)
    expect(mesa.x).toBeLessThanOrEqual(c - 0.3 + 1e-9)
    expect(mesa.z).toBeGreaterThanOrEqual(0.6 - 1e-9)
    expect(mesa.z).toBeLessThanOrEqual(l)
  })

  it('a peça de parede fica dentro da parede', () => {
    const porta = limitarParede({ id: '1', tipo: 'porta', parede: 'o', t: 10 }, 20)
    expect(porta.t).toBeCloseTo(interno(20).l - 0.45)
  })

  it('girar troca largura por profundidade e continua dentro', () => {
    const cama: ItemPiso = { id: '1', tipo: 'cama', x: 0.45, z: 0.95, giro: 0 }
    const girada = girar(cama, 20)
    expect(girada.giro).toBe(90)
    expect(girada.x).toBeGreaterThanOrEqual(0.95 - 1e-9)
  })
})

describe('conflitos', () => {
  it('acusa os dois móveis que se sobrepõem', () => {
    const p: Projeto = {
      ...vazio,
      itens: [
        { id: '1', tipo: 'mesa', x: 1, z: 1, giro: 0 },
        { id: '2', tipo: 'armario', x: 1.5, z: 1, giro: 0 },
        { id: '3', tipo: 'cadeira', x: 4, z: 1, giro: 0 },
      ],
    }
    expect([...conflitos(p)].sort()).toEqual(['1', '2'])
  })

  it('móvel na frente da porta bloqueia a porta', () => {
    const p: Projeto = {
      ...vazio,
      itens: [
        { id: '1', tipo: 'porta', parede: 's', t: 3 },
        { id: '2', tipo: 'armario', x: 3, z: 2.1, giro: 0 },
      ],
    }
    expect([...conflitos(p)].sort()).toEqual(['1', '2'])
  })

  it('peças sobrepostas na mesma parede conflitam; em paredes diferentes não', () => {
    const mesma: Projeto = {
      ...vazio,
      itens: [
        { id: '1', tipo: 'janela', parede: 'n', t: 2 },
        { id: '2', tipo: 'ar', parede: 'n', t: 2.5 },
      ],
    }
    expect(conflitos(mesma).size).toBe(2)
    const outra = { ...mesma, itens: [mesma.itens[0], { id: '2', tipo: 'ar' as const, parede: 's' as const, t: 2.5 }] }
    expect(conflitos(outra).size).toBe(0)
  })
})

describe('adicionar, duplicar e trocar tamanho', () => {
  it('a peça nova vai para um lugar livre', () => {
    let p = projetoInicial('escritorio')
    p = adicionar(p, 'prateleira')
    p = adicionar(p, 'janela')
    expect(conflitos(p).size).toBe(0)
  })

  it('não passa do máximo de peças e continua rápido com o container cheio', () => {
    let p: Projeto = { ...vazio, tamanho: 40 }
    const inicio = performance.now()
    for (let i = 0; i < MAX_ITENS + 5; i++) p = adicionar(p, 'cadeira')
    expect(p.itens).toHaveLength(MAX_ITENS)
    expect(performance.now() - inicio).toBeLessThan(1500)
  })

  it('a busca rápida concorda com a conferência completa', () => {
    let p = projetoInicial('loja')
    for (const tipo of ['armario', 'porta', 'cama', 'janela', 'pia'] as const) p = adicionar(p, tipo)
    expect(conflitos(p).size).toBe(0)
  })

  it('duplicar mantém o giro e não sobrepõe', () => {
    const p: Projeto = { ...vazio, itens: [{ id: '1', tipo: 'cama', x: 0.95, z: 0.45, giro: 90 }] }
    const d = duplicar(p, '1')
    expect(d.itens).toHaveLength(2)
    expect((d.itens[1] as ItemPiso).giro).toBe(90)
    expect(conflitos(d).size).toBe(0)
  })

  it('encolher para 10 pés traz tudo para dentro e descarta o que não cabe', () => {
    const p = trocarTamanho(projetoInicial('loja'), 10)
    const { c } = interno(10)
    for (const i of p.itens) if ('x' in i) expect(i.x).toBeLessThanOrEqual(c)
    expect(p.tamanho).toBe(10)
  })
})

describe('resumo', () => {
  it('conta por tipo e calcula a área ocupada', () => {
    const p = projetoInicial('escritorio')
    expect(contagem(p).find((c) => c.tipo === 'cadeira')?.quantidade).toBe(4)
    expect(areaOcupada(p)).toBeGreaterThan(0)
    expect(areaOcupada(p)).toBeLessThan(100)
  })

  it('a mensagem leva o tamanho, a cor, os itens e o link', () => {
    const texto = resumoDoProjeto(projetoInicial('banheiro'), 'https://exemplo/x')
    expect(texto).toContain('*Container:* 20 pés, cor azul egi')
    expect(texto).toContain('2 × vaso sanitário')
    expect(texto.endsWith('*Ver o projeto:* https://exemplo/x')).toBe(true)
  })
})

describe('link do projeto', () => {
  it('ida e volta devolvem o mesmo projeto', () => {
    for (const ponto of Object.keys(PONTOS_DE_PARTIDA) as PontoDePartida[]) {
      const p = { ...projetoInicial(ponto), cor: 'terracota' as const }
      expect(decodificar(codificar(p))).toEqual(p)
    }
  })

  it('o link é seguro para URL e curto', () => {
    const codigo = codificar(projetoInicial('loja'))
    expect(codigo).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(codigo.length).toBeLessThan(400)
  })

  it('link adulterado ou estranho vira null ou é saneado', () => {
    expect(decodificar('lixo%%')).toBeNull()
    expect(decodificar(null)).toBeNull()
    expect(decodificar(btoa(JSON.stringify([2, 20, 0, []])))).toBeNull()
    expect(decodificar(btoa(JSON.stringify([1, 30, 0, []])))).toBeNull()
    const fora = decodificar(btoa(JSON.stringify([1, 10, 99, [[0, 999999, -50, 7], [999, 1, 1, 0], ['x', 1, 1, 0]]])))
    expect(fora?.cor).toBe('azul')
    expect(fora?.itens).toHaveLength(1)
    expect(conflitos(fora!).size).toBe(0)
  })
})
