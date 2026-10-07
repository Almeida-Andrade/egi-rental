import Image from 'next/image'
import { linkWhatsApp, mensagemSobMedida } from '@/lib/whatsapp'
import { BotaoLink } from './Botao'
import estilos from './FaixaSobMedida.module.css'

export function FaixaSobMedida() {
  return (
    <section className={estilos.faixa} aria-labelledby="faixa-sob-medida">
      <Image
        className={estilos.fundo}
        src="/fotos/sob-medida-dois-andares.jpg"
        alt=""
        fill
        sizes="100vw"
      />
      <div className={estilos.interno}>
        <div className={`${estilos.cartao} revelar`}>
          <p className={estilos.kicker}>Sob medida</p>
          <h2 id="faixa-sob-medida">Não achou o container certo? A gente monta o seu.</h2>
          <p className={estilos.texto}>
            Divisórias, climatização, banheiro, balcão, as cores da sua marca, módulos acoplados ou em dois
            andares. Você conta o que precisa e nós adaptamos o container para o seu projeto.
          </p>
          <div className={estilos.acoes}>
            <BotaoLink href="/sob-medida" variante="claro" grande seta>
              Quero um projeto sob medida
            </BotaoLink>
            <BotaoLink href={linkWhatsApp(mensagemSobMedida())} variante="contorno-claro" grande>
              Conversar agora
            </BotaoLink>
          </div>
        </div>
      </div>
    </section>
  )
}
