import { BotaoLink } from '@/components/site/Botao'
import { CabecaPagina } from '@/components/site/CabecaPagina'

export default function NaoEncontrada() {
  return (
    <CabecaPagina
      kicker="Página não encontrada"
      titulo="Esse container não está aqui"
      texto="O endereço pode ter mudado ou o modelo saiu do catálogo. Veja os containers disponíveis ou fale com a gente."
    >
      <BotaoLink href="/containers" variante="claro" grande seta>
        Ver os containers
      </BotaoLink>
      <BotaoLink href="/" variante="contorno-claro" grande>
        Ir para o início
      </BotaoLink>
    </CabecaPagina>
  )
}
