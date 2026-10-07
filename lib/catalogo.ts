import {
  CONTEUDO_USO,
  MEDIDAS,
  ORDEM_USOS,
  type ConteudoUso,
  type Fabricacao,
  type Medidas,
  type Tamanho,
  type Uso,
} from './modelos'

// Linha da view `v_site_containers` do OMNIS: uma por combinação existente na frota.
export interface LinhaFrota {
  uso: string
  tamanho_pes: number | null
  fabricacao: string | null
}

export interface Modelo extends ConteudoUso {
  uso: Uso
  slug: string
  nomeCompleto: string
  tamanho: Tamanho
  medidas: Medidas
  fabricacoes: Fabricacao[]
}

// Reserva para quando o banco não responde: a frota de 07/10/2026. O site nunca sai sem catálogo.
export const FROTA_RESERVA: LinhaFrota[] = [
  { uso: 'escritorio', tamanho_pes: 20, fabricacao: 'maritimo' },
  { uso: 'escritorio', tamanho_pes: 20, fabricacao: 'fabricado' },
  { uso: 'almoxarifado', tamanho_pes: 10, fabricacao: null },
  { uso: 'almoxarifado', tamanho_pes: 20, fabricacao: 'maritimo' },
  { uso: 'wc', tamanho_pes: 20, fabricacao: 'maritimo' },
  { uso: 'cozinha', tamanho_pes: 20, fabricacao: null },
]

function ehUso(valor: string): valor is Uso {
  return valor in CONTEUDO_USO
}

function ehTamanho(valor: number | null): valor is Tamanho {
  return valor === 10 || valor === 20
}

function ehFabricacao(valor: string | null): valor is Fabricacao {
  return valor === 'maritimo' || valor === 'fabricado'
}

export function slugDoModelo(uso: Uso, tamanho: Tamanho): string {
  return `${CONTEUDO_USO[uso].slug}-${tamanho}-pes`
}

export function montarCatalogo(linhas: LinhaFrota[]): Modelo[] {
  const porChave = new Map<string, Modelo>()

  for (const linha of linhas) {
    const uso: Uso = ehUso(linha.uso) ? linha.uso : 'outro'
    if (!ehTamanho(linha.tamanho_pes)) continue
    const tamanho = linha.tamanho_pes
    const slug = slugDoModelo(uso, tamanho)

    let modelo = porChave.get(slug)
    if (!modelo) {
      const conteudo = CONTEUDO_USO[uso]
      const capa = conteudo.capaPorTamanho?.[tamanho] ?? conteudo.capa
      modelo = {
        ...conteudo,
        capa,
        galeria: conteudo.galeria.filter((f) => f.src !== capa.src),
        uso,
        slug,
        nomeCompleto: `${conteudo.nome} ${tamanho} pés`,
        tamanho,
        medidas: MEDIDAS[tamanho],
        fabricacoes: [],
      }
      porChave.set(slug, modelo)
    }
    if (ehFabricacao(linha.fabricacao) && !modelo.fabricacoes.includes(linha.fabricacao)) {
      modelo.fabricacoes.push(linha.fabricacao)
    }
  }

  return [...porChave.values()]
    .map((m) => ({ ...m, fabricacoes: [...m.fabricacoes].sort() }))
    .sort(
      (a, b) => ORDEM_USOS.indexOf(a.uso) - ORDEM_USOS.indexOf(b.uso) || a.tamanho - b.tamanho,
    )
}

export function modeloPorSlug(catalogo: Modelo[], slug: string): Modelo | undefined {
  return catalogo.find((m) => m.slug === slug)
}

export function outrosModelos(catalogo: Modelo[], atual: Modelo, quantos = 3): Modelo[] {
  const outros = catalogo.filter((m) => m.slug !== atual.slug)
  const mesmoTamanho = outros.filter((m) => m.tamanho === atual.tamanho)
  const resto = outros.filter((m) => m.tamanho !== atual.tamanho)
  return [...mesmoTamanho, ...resto].slice(0, quantos)
}

export function tamanhosDoCatalogo(catalogo: Modelo[]): Tamanho[] {
  return [...new Set(catalogo.map((m) => m.tamanho))].sort((a, b) => a - b)
}
