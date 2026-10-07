import { linkWhatsApp, mensagemGeral } from '@/lib/whatsapp'
import { IconeWhatsApp } from './Icone'
import estilos from './BotaoWhatsApp.module.css'

export function BotaoWhatsApp() {
  return (
    <a
      className={estilos.botao}
      href={linkWhatsApp(mensagemGeral())}
      target="_blank"
      rel="noopener"
      aria-label="Conversar no WhatsApp"
    >
      <IconeWhatsApp tamanho={28} />
      <span className={estilos.rotulo}>Fale no WhatsApp</span>
    </a>
  )
}
