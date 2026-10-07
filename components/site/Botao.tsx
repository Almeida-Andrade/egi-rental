import Link from 'next/link'
import { Icone, IconeWhatsApp } from './Icone'
import estilos from './Botao.module.css'

type Variante = 'primario' | 'secundario' | 'claro' | 'contorno-claro' | 'whatsapp'

interface Props {
  href: string
  children: React.ReactNode
  variante?: Variante
  grande?: boolean
  seta?: boolean
}

export function BotaoLink({ href, children, variante = 'primario', grande, seta }: Props) {
  const externo = href.startsWith('http')
  const classe = [estilos.botao, estilos[variante], grande && estilos.grande].filter(Boolean).join(' ')
  const conteudo = (
    <>
      {variante === 'whatsapp' && <IconeWhatsApp />}
      <span>{children}</span>
      {seta && <Icone nome="seta" tamanho={18} />}
    </>
  )

  return externo ? (
    <a className={classe} href={href} target="_blank" rel="noopener">
      {conteudo}
    </a>
  ) : (
    <Link className={classe} href={href}>
      {conteudo}
    </Link>
  )
}
