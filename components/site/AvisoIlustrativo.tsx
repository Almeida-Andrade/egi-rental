import { AVISO_ILUSTRATIVO } from '@/lib/site'
import { linkWhatsApp, mensagemGeral } from '@/lib/whatsapp'
import { Icone } from './Icone'
import estilos from './AvisoIlustrativo.module.css'

// O aviso de que imagem e medida são exemplo, com o caminho para confirmar com a equipe.
export function AvisoIlustrativo({ claro = false, className = '' }: { claro?: boolean; className?: string }) {
  return (
    <p className={`${estilos.aviso} ${className}`} data-claro={claro}>
      <Icone nome="regua" tamanho={16} />
      <span>
        {AVISO_ILUSTRATIVO.curto}{' '}
        <a href={linkWhatsApp(mensagemGeral())} target="_blank" rel="noopener">
          Falar com a equipe
        </a>
      </span>
    </p>
  )
}
