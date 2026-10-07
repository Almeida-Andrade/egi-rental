import { Icone } from './Icone'
import estilos from './Rota.module.css'

interface Passo {
  titulo: string
  texto: string
}

// O caminhão anda pela rota conforme a página rola: é CSS puro (animation-timeline),
// e onde o navegador não sabe fazer ele fica parado no começo.
export function Rota({ passos }: { passos: Passo[] }) {
  return (
    <div className={estilos.rota}>
      <div className={estilos.estrada} aria-hidden="true">
        <span className={estilos.caminhao}>
          <Icone nome="caminhao" tamanho={26} />
        </span>
      </div>
      <ol className={estilos.passos}>
        {passos.map((p, i) => (
          <li key={p.titulo} style={{ '--i': i } as React.CSSProperties}>
            <span className={`${estilos.numero} marcacao`}>{i + 1}</span>
            <h3>{p.titulo}</h3>
            <p>{p.texto}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}
