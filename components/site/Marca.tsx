import estilos from './Marca.module.css'

// Geometria medida na arte da marca (535 × 547): o quadrado encosta na direita e na base do L, com a
// mesma folga de 45 em cima e à esquerda. O ícone da aba (app/icon.svg) usa os mesmos números.
export const SIMBOLO = {
  viewBox: '0 0 535 547',
  l: 'M85 0H535V275H313A45 45 0 0 0 268 320V547H0V85A85 85 0 0 1 85 0Z',
  quadrado: { x: 313, y: 320, width: 222, height: 227, rx: 20 },
}

interface Props {
  arranjo?: 'horizontal' | 'vertical'
  claro?: boolean
  // Sem rótulo, a marca é só desenho (o link em volta já diz o nome)
  rotulo?: string
}

// Símbolo em vetor e o nome em texto da fonte do site: nítido em qualquer tela e com o RENTAL legível.
export function Marca({ arranjo = 'horizontal', claro = false, rotulo }: Props) {
  return (
    <span
      className={estilos.marca}
      data-arranjo={arranjo}
      data-claro={claro}
      role={rotulo ? 'img' : undefined}
      aria-label={rotulo}
      aria-hidden={rotulo ? undefined : true}
    >
      <svg className={estilos.simbolo} viewBox={SIMBOLO.viewBox} aria-hidden="true">
        <path d={SIMBOLO.l} className={estilos.l} />
        <rect {...SIMBOLO.quadrado} className={estilos.quadrado} />
      </svg>
      <span className={estilos.nome}>
        <span className={estilos.egi}>EGI</span>
        <span className={estilos.rental}>RENTAL</span>
      </span>
    </span>
  )
}
