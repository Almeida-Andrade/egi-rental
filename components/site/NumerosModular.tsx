'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import {
  APROVACAO,
  economiaDeEnergia,
  exemploDePrazo,
  FONTES,
  MESES_DE_EXEMPLO,
  RESIDUO,
  REUSO,
  TEMPO,
  tempoRelativo,
  type ChaveFonte,
} from '@/lib/numeros'
import { useNumeroAnimado } from './useNumeroAnimado'
import estilos from './NumerosModular.module.css'

const TRACOS_MEDIDOR = 40

const arred = (v: number) => Math.round(v * 100) / 100

// Os gráficos "respiram": depois da contagem, o número desce um passo e volta, e o desenho vai junto.
// O botão do painel pausa tudo.
const Vivo = createContext(true)
const RESPIRO_MS = 2200

// visivel: já entrou uma vez (a contagem só roda nessa hora); naTela: está na tela agora (o respiro
// só roda enquanto alguém pode ver).
function useVisivel<T extends Element>() {
  const ref = useRef<T>(null)
  const [visivel, setVisivel] = useState(false)
  const [naTela, setNaTela] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observador = new IntersectionObserver(
      ([entrada]) => {
        setNaTela(entrada.isIntersecting)
        if (entrada.isIntersecting) setVisivel(true)
      },
      { threshold: 0.4 },
    )
    observador.observe(el)
    return () => observador.disconnect()
  }, [])
  return [ref, visivel, naTela] as const
}

// Valor exibido e fase do respiro (0 no valor cheio, 1 um passo abaixo), para o desenho acompanhar.
function useValorVivo(valor: number, visivel: boolean, naTela: boolean, passo = 1) {
  const vivo = useContext(Vivo)
  const ativo = visivel && naTela && vivo
  const [baixo, setBaixo] = useState(false)
  useEffect(() => {
    if (!ativo) return
    const relogio = setInterval(() => setBaixo((b) => !b), RESPIRO_MS)
    return () => clearInterval(relogio)
  }, [ativo])
  const exibido = useNumeroAnimado(visivel ? valor - (ativo && baixo ? passo : 0) : 0, 1400)
  const fase = visivel ? Math.min(1, Math.max(0, (valor - exibido) / passo)) : 0
  return { exibido, fase }
}

// Troca o exemplo de prazo a cada poucos segundos, só com o cartão na tela e a animação ligada
function useExemplo(naTela: boolean) {
  const vivo = useContext(Vivo)
  const [i, setI] = useState(0)
  useEffect(() => {
    if (!naTela || !vivo) return
    const relogio = setInterval(() => setI((n) => (n + 1) % MESES_DE_EXEMPLO.length), 3200)
    return () => clearInterval(relogio)
  }, [naTela, vivo])
  return exemploDePrazo(MESES_DE_EXEMPLO[i])
}

const comFase = (fase: number) => ({ '--respiro': fase.toFixed(3) }) as React.CSSProperties

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
    setDica({
      texto: el.dataset.dica,
      x: px,
      y: py,
      virar: px > area.width - 230,
    })
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
          style={{
            transform: `translate(${dica.x}px, ${dica.y}px) translate(${dica.virar ? 'calc(-100% - 14px)' : '14px'}, -110%)`,
          }}
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

function Numero({ valor, sufixo = '' }: { valor: number; sufixo?: string }) {
  return (
    <span className={`${estilos.numero} marcacao`}>
      {Math.round(valor).toLocaleString('pt-BR')}
      {sufixo}
    </span>
  )
}

function Medidor({ pct }: { pct: number }) {
  // Para baixo: no respiro, 89% já apaga o último traço
  const acesos = Math.floor((TRACOS_MEDIDOR * pct) / 100 + 1e-9)
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
  const [ref, visivel, naTela] = useVisivel<HTMLElement>()
  const { exibido } = useValorVivo(TEMPO.menosMax, visivel, naTela)
  const exemplo = useExemplo(visivel && naTela)
  const de = tempoRelativo(TEMPO.menosMax)
  const ate = tempoRelativo(TEMPO.menosMin)
  return (
    <article ref={ref} className={`${estilos.cartao} ${estilos.largo}`} data-visivel={visivel}>
      <p className={estilos.rotulo}>Prazo de obra</p>
      <div className={estilos.chamada}>
        <Numero valor={exibido} sufixo="%" />
        <span>
          mais rápido, no melhor caso. Projetos modulares já encurtaram o cronograma de {TEMPO.menosMin}% a{' '}
          {TEMPO.menosMax}%.<sup>1</sup>
        </span>
        {/* O mesmo ganho em tempo de obra, trocando de exemplo; a chave refaz a entrada a cada troca */}
        <div className={estilos.exemplo}>
          <p className={estilos.exemploRotulo}>Exemplo ilustrativo, no melhor caso</p>
          <div key={exemplo.tradicional} className={estilos.exemploTroca}>
            <span>
              Obra tradicional <strong>{exemplo.tradicional}</strong>
            </span>
            <span className={estilos.exemploModular}>
              Modular <strong>a partir de {exemplo.modular}</strong>
            </span>
          </div>
        </div>
      </div>
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
              style={
                {
                  '--de': de / 100,
                  '--v': (ate - de) / 100,
                } as React.CSSProperties
              }
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
  const [ref, visivel, naTela] = useVisivel<HTMLElement>()
  const { exibido } = useValorVivo(RESIDUO.menosAte, visivel, naTela)
  return (
    <article ref={ref} className={estilos.cartao} data-visivel={visivel}>
      <p className={estilos.rotulo}>Resíduo na obra</p>
      <Grafico className={estilos.medidorLugar} rotulo={`Até ${RESIDUO.menosAte}% menos resíduo`}>
        <div tabIndex={0} data-dica={`Até ${RESIDUO.menosAte}% menos resíduo. Cada traço vale 2,5%.`}>
          <Medidor pct={visivel ? exibido : RESIDUO.menosAte} />
        </div>
        <p className={estilos.medidorValor}>
          <small>até</small>
          <Numero valor={exibido} sufixo="%" />
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
  const [ref, visivel, naTela] = useVisivel<HTMLElement>()
  return (
    <article ref={ref} className={estilos.cartao} data-visivel={visivel} data-na-tela={naTela}>
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
  const [ref, visivel, naTela] = useVisivel<HTMLElement>()
  // A coluna de reusar percorre a própria faixa medida, de 800 a 400 kWh
  const { fase } = useValorVivo(1, visivel, naTela)
  const energia = economiaDeEnergia()
  const encolhe = 1 - REUSO.kwhReusarMin / REUSO.kwhReusarMax
  return (
    <article
      ref={ref}
      className={estilos.cartao}
      data-visivel={visivel}
      style={
        {
          ...comFase(fase),
          '--encolhe': encolhe.toFixed(3),
        } as React.CSSProperties
      }
    >
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
  const [vivo, setVivo] = useState(true)
  return (
    <div className={estilos.painel} data-vivo={vivo}>
      <button type="button" className={estilos.pausa} aria-pressed={!vivo} onClick={() => setVivo((v) => !v)}>
        <span aria-hidden="true" className={vivo ? estilos.iconePausa : estilos.iconeTocar} />
        {vivo ? 'Pausar animação' : 'Animar gráficos'}
      </button>
      <Vivo.Provider value={vivo}>
        <CartaoPrazo />
        <CartaoResiduo />
        <CartaoAprovacao />
        <CartaoEnergia />
      </Vivo.Provider>
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
