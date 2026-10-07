import { BotaoLink } from './Botao'
import { DesenhoSobMedida } from './DesenhoSobMedida'
import estilos from './FaixaSobMedida.module.css'

export function FaixaSobMedida() {
  return (
    <section className={estilos.faixa} aria-labelledby="faixa-sob-medida">
      <div className={estilos.interno}>
        <div className={estilos.texto}>
          <h2 id="faixa-sob-medida">Nenhum modelo serve? Desenhamos o seu.</h2>
          <p>
            Porta e janela onde você precisa, banheiro, ar-condicionado, balcão, as cores da sua empresa,
            dois módulos lado a lado ou um em cima do outro. Você descreve o uso; nós adaptamos o container.
          </p>
          <div className={estilos.acoes}>
            <BotaoLink href="/sob-medida/montar" variante="claro" grande seta>
              Montar o meu em 3D
            </BotaoLink>
            <BotaoLink href="/sob-medida" variante="contorno-claro" grande>
              Começar meu projeto
            </BotaoLink>
          </div>
        </div>

        <DesenhoSobMedida />
      </div>
    </section>
  )
}
