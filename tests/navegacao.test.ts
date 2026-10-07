import { describe, expect, it } from 'vitest'
import { itemAtivo, NAVEGACAO } from '@/lib/navegacao'

describe('itemAtivo', () => {
  it('acende a seção e as páginas de dentro dela', () => {
    expect(itemAtivo('/containers', '/containers')).toBe(true)
    expect(itemAtivo('/containers/escritorio-20-pes', '/containers')).toBe(true)
  })

  it('não confunde prefixo de palavra nem âncora da home', () => {
    expect(itemAtivo('/containers-usados', '/containers')).toBe(false)
    expect(itemAtivo('/', '/#aplicacoes')).toBe(false)
  })

  it('todo item tem rótulo e caminho absoluto', () => {
    expect(NAVEGACAO.every((i) => i.href.startsWith('/') && i.rotulo)).toBe(true)
  })
})
