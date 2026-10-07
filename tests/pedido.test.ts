import { describe, expect, it } from 'vitest'
import { formatarTelefone, linhasDaMensagem, montarMensagem, validarPedido, type Pedido } from '@/lib/pedido'

const base: Pedido = { tipo: 'orcamento', nome: 'Maria Souza', telefone: '98 99999-1234' }

describe('validarPedido', () => {
  it('aceita o mínimo: nome e celular com DDD', () => {
    expect(validarPedido(base)).toEqual({})
  })

  it('recusa nome vazio, celular sem DDD e e-mail torto', () => {
    const erros = validarPedido({ ...base, nome: ' ', telefone: '9999-1234', email: 'maria@' })
    expect(Object.keys(erros).sort()).toEqual(['email', 'nome', 'telefone'])
  })

  it('sob medida exige a descrição do que se precisa', () => {
    expect(validarPedido({ ...base, tipo: 'sob-medida' }).mensagem).toBeTruthy()
    expect(validarPedido({ ...base, tipo: 'sob-medida', mensagem: 'Dois escritórios acoplados' })).toEqual({})
  })
})

describe('formatarTelefone', () => {
  it('formata celular e fixo, com ou sem o 55', () => {
    expect(formatarTelefone('98999991234')).toBe('(98) 99999-1234')
    expect(formatarTelefone('+55 98 99999-1234')).toBe('(98) 99999-1234')
    expect(formatarTelefone('9832221234')).toBe('(98) 3222-1234')
  })
})

describe('montarMensagem', () => {
  it('lista só os campos preenchidos, em negrito do WhatsApp', () => {
    const texto = montarMensagem({ ...base, modelo: 'Escritório 20 pés', local: '  ', prazo: '6 meses' })
    expect(texto).toContain('*Container:* Escritório 20 pés')
    expect(texto).toContain('*Por quanto tempo:* 6 meses')
    expect(texto).toContain('*Celular:* (98) 99999-1234')
    expect(texto).not.toContain('Onde vai ficar')
    expect(texto.startsWith('Olá! Quero um orçamento')).toBe(true)
  })

  it('abre de outro jeito no sob medida e põe a mensagem no fim', () => {
    const texto = montarMensagem({ ...base, tipo: 'sob-medida', mensagem: 'Stand com balcão' })
    expect(texto.startsWith('Olá! Preciso de um container sob medida')).toBe(true)
    expect(texto.endsWith('Stand com balcão')).toBe(true)
  })
})

describe('linhasDaMensagem', () => {
  it('separa as linhas e marca o negrito entre asteriscos', () => {
    expect(linhasDaMensagem('Olá\n*Nome:* Maria')).toEqual([
      [{ texto: 'Olá', negrito: false }],
      [
        { texto: 'Nome:', negrito: true },
        { texto: ' Maria', negrito: false },
      ],
    ])
  })

  it('linha vazia vira linha sem trecho, e asterisco sozinho não é negrito', () => {
    expect(linhasDaMensagem('a\n\n2 * 3')).toEqual([[{ texto: 'a', negrito: false }], [], [{ texto: '2 * 3', negrito: false }]])
  })
})
