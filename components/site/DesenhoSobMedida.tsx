'use client'

import { useEffect, useRef } from 'react'
import { MEDIDAS_METROS, metros } from '@/lib/medidas'
import estilos from './FaixaSobMedida.module.css'

type Traco = { d: string; forte?: boolean; claro?: boolean }

// Cada traço é desenhado em ordem (--i) conforme a faixa entra na tela. Depois, o desenho "respira":
// o módulo de baixo vai de 20 para 10 pés e volta, e o de cima sai porque não cabe no menor.
const CHAO: Traco = { d: 'M40 300H560', forte: true }
const INFERIOR: Traco[] = [
  { d: 'M60 300V180H420V300', forte: true },
  { d: 'M84 180V300M108 180V300M132 180V300M156 180V300M180 180V300M204 180V300' },
  { d: 'M60 330H420M60 322V338M420 322V338', claro: true },
]
const PORTA: Traco = { d: 'M300 300V212H352V300', claro: true }
const JANELAS_BAIXO: Traco[] = [
  { d: 'M228 210H284V258H228Z', claro: true },
  { d: 'M372 196H404V222H372Z', claro: true },
]
const SUPERIOR: Traco[] = [
  { d: 'M120 180V60H480V180', forte: true },
  { d: 'M150 92H262V146H150Z M300 92H412V146H300Z', claro: true },
  { d: 'M420 300L496 180H480M436 300L512 180M444 276H474M460 252H490M476 228H506M492 204H522' },
]

function Tracos({ tracos, inicio }: { tracos: Traco[]; inicio: number }) {
  return tracos.map((t, k) => (
    <path
      key={k}
      d={t.d}
      pathLength={1}
      vectorEffect="non-scaling-stroke"
      className={[estilos.traco, t.forte && estilos.forte, t.claro && estilos.claro].filter(Boolean).join(' ')}
      style={{ '--i': inicio + k } as React.CSSProperties}
    />
  ))
}

export function DesenhoSobMedida() {
  const svg = useRef<SVGSVGElement>(null)

  // O respiro só roda com o desenho na tela; fora dela a animação fica parada, sem custo.
  useEffect(() => {
    const el = svg.current
    if (!el) return
    const observador = new IntersectionObserver(([e]) => {
      el.dataset.naTela = String(e.isIntersecting)
    })
    observador.observe(el)
    return () => observador.disconnect()
  }, [])

  return (
    <svg ref={svg} className={estilos.desenho} viewBox="0 0 600 360" aria-hidden="true">
      <Tracos tracos={[CHAO]} inicio={0} />
      <g className={estilos.inferior}>
        <Tracos tracos={INFERIOR} inicio={1} />
      </g>
      <g className={estilos.porta}>
        <Tracos tracos={[PORTA]} inicio={4} />
      </g>
      <g className={estilos.somem}>
        <Tracos tracos={JANELAS_BAIXO} inicio={5} />
      </g>
      <g className={estilos.superior}>
        <Tracos tracos={SUPERIOR} inicio={7} />
      </g>
      <text x="240" y="352" className={`${estilos.cota} ${estilos.cotaGrande} marcacao`}>
        {metros(MEDIDAS_METROS[20].externa.comprimento)} m
      </text>
      <text x="148" y="352" textAnchor="middle" className={`${estilos.cota} ${estilos.cotaPequena} marcacao`}>
        {metros(MEDIDAS_METROS[10].externa.comprimento)} m
      </text>
    </svg>
  )
}
