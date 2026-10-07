import { linkWhatsApp, mensagemSobMedida } from '@/lib/whatsapp'
import { BotaoLink } from './Botao'
import estilos from './FaixaSobMedida.module.css'

// Cada traço é desenhado em ordem (--i) conforme a faixa entra na tela.
const TRACOS: { d: string; forte?: boolean; claro?: boolean }[] = [
  { d: 'M40 300H560', forte: true },
  { d: 'M60 300V180H420V300', forte: true },
  { d: 'M84 180V300M108 180V300M132 180V300M156 180V300M180 180V300M204 180V300' },
  { d: 'M300 300V212H352V300', claro: true },
  { d: 'M228 210H284V258H228Z', claro: true },
  { d: 'M372 196H404V222H372Z', claro: true },
  { d: 'M120 180V60H480V180', forte: true },
  { d: 'M150 92H262V146H150Z M300 92H412V146H300Z', claro: true },
  { d: 'M420 300L496 180H480M436 300L512 180M444 276H474M460 252H490M476 228H506M492 204H522' },
  { d: 'M60 330H420M60 322V338M420 322V338', claro: true },
]

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
            <BotaoLink href="/sob-medida" variante="claro" grande seta>
              Começar meu projeto
            </BotaoLink>
            <BotaoLink href={linkWhatsApp(mensagemSobMedida())} variante="contorno-claro" grande>
              Conversar no WhatsApp
            </BotaoLink>
          </div>
        </div>

        <svg className={estilos.desenho} viewBox="0 0 600 360" aria-hidden="true">
          {TRACOS.map((t, i) => (
            <path
              key={i}
              d={t.d}
              pathLength={1}
              className={[estilos.traco, t.forte && estilos.forte, t.claro && estilos.claro].filter(Boolean).join(' ')}
              style={{ '--i': i } as React.CSSProperties}
            />
          ))}
          <text x="240" y="352" className={`${estilos.cota} marcacao`}>
            6,06 m
          </text>
        </svg>
      </div>
    </section>
  )
}
