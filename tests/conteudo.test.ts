import { existsSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { APLICACOES, INSPIRACOES } from '@/lib/conteudo'
import { CONTEUDO_USO, ORDEM_USOS } from '@/lib/modelos'

const publico = (src: string) => path.join(import.meta.dirname, '..', 'public', src)

describe('conteúdo', () => {
  it('toda foto citada existe em public/ e tem texto alternativo', () => {
    const fotos = [
      ...Object.values(CONTEUDO_USO).flatMap((c) => [c.capa, ...Object.values(c.capaPorTamanho ?? {}), ...c.galeria]),
      ...APLICACOES.map((a) => a.foto),
      ...INSPIRACOES,
    ]
    for (const foto of fotos) {
      expect(existsSync(publico(foto.src)), foto.src).toBe(true)
      expect(foto.alt.length, foto.src).toBeGreaterThan(5)
    }
  })

  it('a ordem do catálogo cobre todos os usos, sem repetir', () => {
    expect([...ORDEM_USOS].sort()).toEqual(Object.keys(CONTEUDO_USO).sort())
  })

  it('o slug de cada uso é único', () => {
    const slugs = Object.values(CONTEUDO_USO).map((c) => c.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })
})

describe('créditos', () => {
  it('toda foto de public/fotos tem crédito, e todo crédito aponta para foto que existe', async () => {
    const { readdirSync } = await import('node:fs')
    const { CREDITOS } = await import('@/lib/creditos')
    const arquivos = readdirSync(publico('/fotos')).sort()
    expect(CREDITOS.map((c) => c.arquivo).sort()).toEqual(arquivos)
  })
})
