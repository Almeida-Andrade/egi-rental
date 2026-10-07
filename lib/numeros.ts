// Números de construção modular e reuso de container, sempre com a fonte. São do setor, nunca da
// EGI Rental: o texto da seção diz isso. Número novo sem fonte não entra (o teste trava).
export interface Fonte {
  nome: string
  url: string
}

export const FONTES = {
  mckinsey: {
    nome: 'McKinsey & Company, “Modular construction: From projects to products” (2019)',
    url: 'https://www.mckinsey.com/capabilities/operations/our-insights/modular-construction-from-projects-to-products',
  },
  wrap: {
    nome: 'WRAP (Waste & Resources Action Programme), citado pelo Modular Building Institute',
    url: 'https://modular.org/2023/12/26/how-modular-construction-leads-to-zero-waste-and-eco-fficiency',
  },
  dodge: {
    nome: 'Dodge Data & Analytics, “Prefabrication and Modular Construction 2020”',
    url: 'https://www.construction.com/toolkit/reports/prefabrication-modular-construction-2020',
  },
  archdaily: {
    nome: 'ArchDaily, “Amaya Headquarters / RuizEsquíroz” (memorial do projeto)',
    url: 'https://www.archdaily.com/965964/amaya-headquarters-ruizesquiroz',
  },
} satisfies Record<string, Fonte>

export type ChaveFonte = keyof typeof FONTES

// Prazo: projetos modulares aceleraram o cronograma de 20% a 50% (só prazo; custo a McKinsey
// diz que ainda é exceção, por isso não entra).
export const TEMPO = { menosMin: 20, menosMax: 50, fonte: 'mckinsey' as ChaveFonte }

// Resíduo: até 90% menos material desperdiçado.
export const RESIDUO = { menosAte: 90, fonte: 'wrap' as ChaveFonte }

// Cerca de 90% relatam mais produtividade, qualidade e previsibilidade de prazo.
export const APROVACAO = { deCada10: 9, fonte: 'dodge' as ChaveFonte }

// Energia: derreter um container gasta cerca de 8.000 kWh; reusar, de 400 a 800 kWh.
export const REUSO = { kwhDerreter: 8000, kwhReusarMin: 400, kwhReusarMax: 800, fonte: 'archdaily' as ChaveFonte }

export function tempoRelativo(menosPct: number): number {
  return 100 - menosPct
}

export function economiaDeEnergia(): { min: number; max: number } {
  return {
    min: Math.round((1 - REUSO.kwhReusarMax / REUSO.kwhDerreter) * 100),
    max: Math.round((1 - REUSO.kwhReusarMin / REUSO.kwhDerreter) * 100),
  }
}
