import estilos from './TituloSecao.module.css'

interface Props {
  kicker: string
  titulo: React.ReactNode
  texto?: React.ReactNode
  claro?: boolean
  centro?: boolean
  id?: string
  nivel?: 1 | 2
}

export function TituloSecao({ kicker, titulo, texto, claro, centro, id, nivel = 2 }: Props) {
  const Titulo = nivel === 1 ? 'h1' : 'h2'
  return (
    <div className={[estilos.cabeca, claro && estilos.claro, centro && estilos.centro].filter(Boolean).join(' ')}>
      <p className={estilos.kicker}>{kicker}</p>
      <Titulo id={id} className={nivel === 1 ? estilos.tituloPagina : estilos.titulo}>
        {titulo}
      </Titulo>
      {texto && <p className={estilos.texto}>{texto}</p>}
    </div>
  )
}
