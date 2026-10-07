import type { Ref } from 'react'
import type { Peca, Planta } from '@/lib/plantas'
import estilos from './PlantaDoContainer.module.css'

function PecaDaPlanta({ peca, i }: { peca: Peca; i: number }) {
  const x = peca.x * 100
  const y = peca.y * 100
  const w = peca.w * 100
  const h = peca.h * 100
  const estilo = { '--i': i } as React.CSSProperties

  switch (peca.tipo) {
    case 'porta':
      return (
        <g className={estilos.abertura} style={estilo} data-peca>
          <rect x={x} y={y - 4} width={w} height={h + 8} className={estilos.vao} />
          <path d={`M${x + w} ${y} A${w} ${w} 0 0 0 ${x} ${y - w}`} className={estilos.giro} />
          <line x1={x} y1={y} x2={x} y2={y - w} className={estilos.folha} />
        </g>
      )
    case 'portas-fundo': {
      // Portas de abrir para fora, desenhadas curtas para não sair do palco
      const r = 35
      return (
        <g className={estilos.abertura} style={estilo} data-peca>
          <rect x={x - 4} y={y} width={w + 8} height={h} className={estilos.vao} />
          <path d={`M${x + w} ${y} l${r} ${-r * 0.15} M${x + w} ${y + h} l${r} ${r * 0.15}`} className={estilos.folha} />
          <path d={`M${x + w} ${y + r} A${r} ${r} 0 0 0 ${x + w + r} ${y - r * 0.15}`} className={estilos.giro} />
          <path d={`M${x + w} ${y + h - r} A${r} ${r} 0 0 1 ${x + w + r} ${y + h + r * 0.15}`} className={estilos.giro} />
        </g>
      )
    }
    case 'emenda':
      // Onde a parede do meio saiu: fica a junta no piso, sem entrar na cascata das peças
      return (
        <g>
          <rect x={x} y={y} width={w} height={h} className={estilos.emenda} />
          <line x1={x} y1={y + h / 2} x2={x + w} y2={y + h / 2} className={estilos.giro} />
        </g>
      )
    case 'janela':
      return (
        <g className={estilos.abertura} style={estilo} data-peca>
          <rect x={x} y={y - 4} width={w} height={h + 8} className={estilos.vao} />
          <line x1={x} y1={y + h / 2} x2={x + w} y2={y + h / 2} className={estilos.vidro} />
        </g>
      )
    case 'divisoria':
      return <rect x={x} y={y} width={w} height={h} className={estilos.divisoria} style={estilo} data-peca />
    case 'cadeira':
    case 'vaso':
    case 'pia':
      return <rect x={x} y={y} width={w} height={h} rx={Math.min(w, h) / 2.4} className={estilos.movel} style={estilo} data-peca />
    case 'fogao':
      return (
        <g className={estilos.peca} style={estilo} data-peca>
          <rect x={x} y={y} width={w} height={h} className={estilos.movelForte} />
          {[0.3, 0.7].flatMap((fx) =>
            [0.3, 0.7].map((fy) => <circle key={`${fx}${fy}`} cx={x + w * fx} cy={y + h * fy} r={w * 0.12} className={estilos.boca} />),
          )}
        </g>
      )
    case 'chuveiro':
      return (
        <g className={estilos.peca} style={estilo} data-peca>
          <rect x={x} y={y} width={w} height={h} className={estilos.movel} />
          <path d={`M${x} ${y}L${x + w} ${y + h}M${x + w} ${y}L${x} ${y + h}`} className={estilos.traco} />
        </g>
      )
    case 'prateleira':
    case 'palete':
      return <rect x={x} y={y} width={w} height={h} className={estilos.hachura} style={estilo} data-peca />
    default:
      return <rect x={x} y={y} width={w} height={h} rx="3" className={estilos.movelForte} style={estilo} data-peca />
  }
}


interface Props {
  planta: Planta
  rotulo: string
  ref?: Ref<SVGSVGElement>
}

// Planta de exemplo vista de cima, em centímetros: a mesma do comparador e da ficha do modelo.
export function PlantaDoContainer({ planta, rotulo, ref }: Props) {
  return (
    <svg
      ref={ref}
      className={estilos.planta}
      viewBox={`-12 -12 ${planta.comprimento * 100 + 24} ${planta.largura * 100 + 24}`}
      role="img"
      aria-label={rotulo}
    >
      <rect x="0" y="0" width={planta.comprimento * 100} height={planta.largura * 100} className={estilos.parede} />
      {planta.pecas.map((p, i) => (
        <PecaDaPlanta key={`${p.tipo}-${i}`} peca={p} i={i} />
      ))}
    </svg>
  )
}
