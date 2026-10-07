'use client'

import { useEffect, useRef, useState } from 'react'
import { APROVACAO, economiaDeEnergia, FONTES, RESIDUO, REUSO, TEMPO, tempoRelativo, type ChaveFonte } from '@/lib/numeros'
import { useNumeroAnimado } from './useNumeroAnimado'
import estilos from './NumerosModular.module.css'

const TRACOS_MEDIDOR = 40

const arred = (v: number) => Math.round(v * 100) / 100

function useVisivel<T extends Element>() {
  const ref = useRef<T>(null)
  const [visivel, setVisivel] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisivel(true)
          observador.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    observador.observe(el)
    return () => observador.disconnect()
  }, [])
  return [ref, visivel] as const
}

interface Dica {
  texto: string
  x: number
  y: number
  virar: boolean
}

// Valor exato de quem está sob o ponteiro (ou com foco do teclado). Perto da borda direita a dica
// vira para a esquerda; o resto do gráfico esmaece pelo CSS.
function Grafico({ className, rotulo, children }: { className: string; rotulo: string; children: React.ReactNode }) {
  const caixa = useRef<HTMLDivElement>(null)
  const [dica, setDica] = useState<Dica | null>(null)

  const mostrar = (alvo: EventTarget | null, x?: number, y?: number) => {
    const el = alvo instanceof Element ? (alvo.closest('[data-dica]') as HTMLElement | null) : null
    const area = caixa.current?.getBoundingClientRect()
    if (!el || !area || !el.dataset.dica) {
      setDica(null)
      return
    }
    const r = el.getBoundingClientRect()
    const px = (x ?? r.left + r.width / 2) - area.left
    const py = (y ?? r.top) - area.top
    setDica({ texto: el.dataset.dica, x: px, y: py, virar: px > area.width - 230 })
  }

  return (
    <div
      ref={caixa}
      className={`${className} ${estilos.grafico}`}
      role="group"
      aria-label={rotulo}
      onPointerMove={(e) => mostrar(e.target, e.clientX, e.clientY)}
      onPointerLeave={() => setDica(null)}
      onFocus={(e) => mostrar(e.target)}
      onBlur={() => setDica(null)}
    >
      {children}
      {dica && (
        <div
          className={estilos.dica}
          role="tooltip"
          style={{ transform: `translate(${dica.x}px, ${dica.y}px) translate(${dica.virar ? 'calc(-100% - 14px)' : '14px'}, -110%)` }}
        >
          {dica.texto}
        </div>
      )}
    </div>
  )
}

function Fonte({ chave, numero }: { chave: ChaveFonte; numero: number }) {
  return (
    <a className={estilos.fonte} href={FONTES[chave].url} target="_blank" rel="noopener">
      <sup>{numero}</sup> {FONTES[chave].nome}
    </a>
  )
}

function Numero({ valor, visivel, sufixo = '' }: { valor: number; visivel: boolean; sufixo?: string }) {
  const animado = useNumeroAnimado(visivel ? valor : 0, 1400)
  return (
    <span className={`${estilos.numero} marcacao`}>
      {Math.round(animado).toLocaleString('pt-BR')}
      {sufixo}
    </span>
  )
}

function Medidor({ pct }: { pct: number }) {
  const acesos = Math.round((TRACOS_MEDIDOR * pct) / 100)
  return (
    <svg className={estilos.medidor} viewBox="0 0 200 120" aria-hidden="true">
      {Array.from({ length: TRACOS_MEDIDOR }, (_, i) => {
        const angulo = Math.PI - (i / (TRACOS_MEDIDOR - 1)) * Math.PI
        // Arredondado: seno e cosseno diferem na última casa entre servidor e navegador
        const x1 = arred(100 + Math.cos(angulo) * 70)
        const y1 = arred(105 - Math.sin(angulo) * 70)
        const x2 = arred(100 + Math.cos(angulo) * 92)
        const y2 = arred(105 - Math.sin(angulo) * 92)
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            className={i < acesos ? estilos.tracoAceso : estilos.tracoApagado}
            style={{ '--i': i } as React.CSSProperties}
          />
        )
      })}
    </svg>
  )
}

function CartaoPrazo() {
  const [ref, visivel] = useVisivel<HTMLElement>()
  const de = tempoRelativo(TEMPO.menosMax)
  const ate = tempoRelativo(TEMPO.menosMin)
  return (
    <article ref={ref} className={`${estilos.cartao} ${estilos.largo}`} data-visivel={visivel}>
      <p className={estilos.rotulo}>Prazo de obra</p>
      <p className={estilos.chamada}>
        <Numero valor={TEMPO.menosMax} visivel={visivel} sufixo="%" />
        <span>
          mais rápido, no melhor caso. Projetos modulares já encurtaram o cronograma de {TEMPO.menosMin}% a{' '}
          {TEMPO.menosMax}%.<sup>1</sup>
        </span>
      </p>
      <Grafico
        className={estilos.barras}
        rotulo={`Obra tradicional: 100% do prazo. Modular: de ${de}% a ${ate}% do prazo.`}
      >
        <div className={estilos.linhaBarra}>
          <span>Obra tradicional</span>
          <div className={estilos.trilho}>
            <div
              className={estilos.barraCinza}
              style={{ '--v': 1 } as React.CSSProperties}
              tabIndex={0}
              data-dica="Obra tradicional: 100% do prazo"
            />
          </div>
        </div>
        <div className={estilos.linhaBarra}>
          <span>Modular</span>
          <div className={estilos.trilho}>
            <div
              className={estilos.barraAzul}
              style={{ '--v': de / 100 } as React.CSSProperties}
              tabIndex={0}
              data-dica={`Modular, no melhor caso: ${de}% do prazo (${TEMPO.menosMax}% mais rápido)`}
            />
            <div
              className={estilos.barraFaixa}
              style={{ '--de': de / 100, '--v': (ate - de) / 100 } as React.CSSProperties}
              tabIndex={0}
              data-dica={`Faixa medida: de ${de}% a ${ate}% do prazo, ou ${TEMPO.menosMin}% a ${TEMPO.menosMax}% mais rápido`}
            />
          </div>
        </div>
        <div className={estilos.escala} aria-hidden="true">
          <span>0</span>
          <span>50%</span>
          <span>100% do prazo</span>
        </div>
      </Grafico>
    </article>
  )
}

function CartaoResiduo() {
  const [ref, visivel] = useVisivel<HTMLElement>()
  return (
    <article ref={ref} className={estilos.cartao} data-visivel={visivel}>
      <p className={estilos.rotulo}>Resíduo na obra</p>
      <Grafico className={estilos.medidorLugar} rotulo={`Até ${RESIDUO.menosAte}% menos resíduo`}>
        <div tabIndex={0} data-dica={`Até ${RESIDUO.menosAte}% menos resíduo. Cada traço vale 2,5%.`}>
          <Medidor pct={RESIDUO.menosAte} />
        </div>
        <p className={estilos.medidorValor}>
          <small>até</small>
          <Numero valor={RESIDUO.menosAte} visivel={visivel} sufixo="%" />
          <small>menos</small>
        </p>
      </Grafico>
      <p className={estilos.texto}>
        de madeira, papelão, plástico e concreto desperdiçados, comparado à obra convencional.<sup>2</sup>
      </p>
    </article>
  )
}

function CartaoAprovacao() {
  const [ref, visivel] = useVisivel<HTMLElement>()
  return (
    <article ref={ref} className={estilos.cartao} data-visivel={visivel}>
      <p className={estilos.rotulo}>Quem já usa</p>
      <Grafico className={estilos.grade} rotulo={`${APROVACAO.deCada10} em cada 10 profissionais`}>
        {Array.from({ length: 10 }, (_, i) => (
          <span
            key={i}
            className={i < APROVACAO.deCada10 ? estilos.caixaAcesa : estilos.caixaApagada}
            style={{ '--i': i } as React.CSSProperties}
            data-dica={
              i < APROVACAO.deCada10
                ? `${APROVACAO.deCada10} em cada 10 relatam mais produtividade e prazo previsível`
                : `1 em cada 10 não relatou o ganho`
            }
          />
        ))}
      </Grafico>
      <p className={estilos.texto}>
        <strong className="marcacao">{APROVACAO.deCada10} em 10</strong> profissionais relatam mais produtividade,
        qualidade e previsibilidade de prazo com construção modular.<sup>3</sup>
      </p>
    </article>
  )
}

function CartaoEnergia() {
  const [ref, visivel] = useVisivel<HTMLElement>()
  const energia = economiaDeEnergia()
  return (
    <article ref={ref} className={estilos.cartao} data-visivel={visivel}>
      <p className={estilos.rotulo}>Reusar em vez de derreter</p>
      <Grafico
        className={estilos.colunas}
        rotulo={`Derreter: ${REUSO.kwhDerreter} kWh. Reusar: de ${REUSO.kwhReusarMin} a ${REUSO.kwhReusarMax} kWh.`}
      >
        <div className={estilos.coluna}>
          <div
            className={estilos.colunaCinza}
            style={{ '--v': 1 } as React.CSSProperties}
            tabIndex={0}
            data-dica={`Derreter o aço: cerca de ${REUSO.kwhDerreter.toLocaleString('pt-BR')} kWh`}
          />
          <span>Derreter</span>
        </div>
        <div className={estilos.coluna}>
          <div
            className={estilos.colunaAzul}
            style={
              {
                '--v': REUSO.kwhReusarMax / REUSO.kwhDerreter,
                '--cheio': `${(REUSO.kwhReusarMin / REUSO.kwhReusarMax) * 100}%`,
              } as React.CSSProperties
            }
            tabIndex={0}
            data-dica={`Reusar como construção: de ${REUSO.kwhReusarMin} a ${REUSO.kwhReusarMax} kWh`}
          />
          <span>Reusar</span>
        </div>
      </Grafico>
      <p className={estilos.texto}>
        <strong className="marcacao">
          {energia.min}–{energia.max}%
        </strong>{' '}
        menos energia: cerca de {REUSO.kwhDerreter.toLocaleString('pt-BR')} kWh para derreter um container, contra{' '}
        {REUSO.kwhReusarMin} a {REUSO.kwhReusarMax} kWh para reusá-lo.<sup>4</sup>
      </p>
    </article>
  )
}

// Cada cartão anima quando ELE entra na tela: no celular o painel inteiro não cabe de uma vez.
export function NumerosModular() {
  return (
    <div className={estilos.painel}>
      <CartaoPrazo />
      <CartaoResiduo />
      <CartaoAprovacao />
      <CartaoEnergia />
      <footer className={estilos.fontes}>
        <p>Números do setor de construção modular, não da EGI Rental. Fontes:</p>
        <Fonte chave={TEMPO.fonte} numero={1} />
        <Fonte chave={RESIDUO.fonte} numero={2} />
        <Fonte chave={APROVACAO.fonte} numero={3} />
        <Fonte chave={REUSO.fonte} numero={4} />
      </footer>
    </div>
  )
}
