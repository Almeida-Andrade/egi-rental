import { describe, expect, it } from 'vitest'
import { linkWhatsApp, mensagemDoModelo } from '@/lib/whatsapp'

describe('linkWhatsApp', () => {
  it('aponta para o número da EGI Rental', () => {
    expect(linkWhatsApp()).toBe('https://wa.me/5598991022068')
  })

  it('codifica o texto, inclusive acento e quebra de linha', () => {
    const link = linkWhatsApp(mensagemDoModelo('Sanitário 20 pés') + '\nObrigado')
    expect(link).toContain('?text=')
    expect(decodeURIComponent(link.split('?text=')[1])).toBe(
      'Olá! Quero um orçamento de locação do container Sanitário 20 pés. Vi no site.\nObrigado',
    )
  })
})
