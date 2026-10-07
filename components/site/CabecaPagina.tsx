import Image from 'next/image'
import Link from 'next/link'
import type { Foto } from '@/lib/modelos'
import estilos from './CabecaPagina.module.css'

interface Props {
  kicker: string
  titulo: React.ReactNode
  texto?: React.ReactNode
  foto?: Foto
  trilha?: { href: string; rotulo: string }[]
  children?: React.ReactNode
}

export function CabecaPagina({ kicker, titulo, texto, foto, trilha, children }: Props) {
  return (
    <header className={`${estilos.cabeca} ${foto ? estilos.comFoto : ''}`}>
      {foto && <Image className={estilos.foto} src={foto.src} alt="" fill priority sizes="100vw" />}
      <div className={estilos.interno}>
        {trilha && (
          <nav aria-label="Você está em" className={estilos.trilha}>
            <ol>
              <li>
                <Link href="/">Início</Link>
              </li>
              {trilha.map((t) => (
                <li key={t.href}>
                  <Link href={t.href}>{t.rotulo}</Link>
                </li>
              ))}
            </ol>
          </nav>
        )}
        <p className={estilos.kicker}>{kicker}</p>
        <h1 className={estilos.titulo}>{titulo}</h1>
        {texto && <p className={estilos.texto}>{texto}</p>}
        {children && <div className={estilos.acoes}>{children}</div>}
      </div>
    </header>
  )
}
