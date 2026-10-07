'use client'

import Link from 'next/link'
import type { AnimationParams } from 'animejs'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { dimensoesJuntas, MEDIDAS_METROS, metros, MODULOS, type Modulos, type Tamanho } from '@/lib/medidas'
import type { Uso } from '@/lib/modelos'
import { plantaDe } from '@/lib/plantas'
import { linkWhatsApp, mensagemDoModelo } from '@/lib/whatsapp'
import { IconeWhatsApp } from './Icone'
import { PlantaDoContainer } from './PlantaDoContainer'
import { useNumeroAnimado } from './useNumeroAnimado'
import estilos from './ComparadorTamanhos.module.css'

export interface ModeloComparavel {
  slug: string
  nome: string
  nomeCompleto: string
  uso: Uso
  tamanho: Tamanho
}

// Cada vista (de lado, de frente) cobre VISTA_M metros, o mesmo `--vista-m` do CSS: lado a lado no
// computador e uma embaixo da outra no celular, sempre na mesma escala entre si.
const VISTA_M = 7.75
const INICIO_CAIXA_M = 1.05
const INICIO_FRENTE_M = 0.2
const LARGURA_MODULO = MEDIDAS_METROS[20].externa.largura

type Eixo = 'comprimento' | 'largura'

const INICIO: Record<Eixo, number> = { comprimento: INICIO_CAIXA_M, largura: INICIO_FRENTE_M }
const LIMITES: Record<Eixo, [number, number]> = {
  comprimento: [2.4, MEDIDAS_METROS[20].externa.comprimento + 0.3],
  largura: [LARGURA_MODULO * 0.8, LARGURA_MODULO * 2 + 0.3],
}

function emVista(m: number): string {
  return `${(m / VISTA_M) * 100}%`
}

function Pessoa() {
  return (
    <svg className={estilos.pessoa} viewBox="0 0 50 175" aria-hidden="true">
      <circle cx="25" cy="12" r="11" />
      <path d="M12 30h26c4 0 7 3 7 7v48c0 3-2 5-5 5h-3v80c0 3-2 5-5 5h-4c-2 0-3-1-3-3V110h-2v62c0 2-1 3-3 3h-4c-3 0-5-2-5-5V90h-3c-3 0-5-2-5-5V37c0-4 3-7 7-7Z" />
    </svg>
  )
}

interface PropsAlca {
  eixo: Eixo
  arrastando: boolean
  posicao: string
  rotulo: string
  aoComecar: (eixo: Eixo, clienteX: number) => void
  aoMover: (eixo: Eixo, clienteX: number) => void
  aoSoltar: (eixo: Eixo, clienteX: number | null) => void
}

function Alca({ eixo, arrastando, posicao, rotulo, aoComecar, aoMover, aoSoltar }: PropsAlca) {
  return (
    <div
      className={estilos.alca}
      style={{ left: posicao }}
      data-arrastando={arrastando}
      title={rotulo}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        aoComecar(eixo, e.clientX)
      }}
      onPointerMove={(e) => arrastando && aoMover(eixo, e.clientX)}
      onPointerUp={(e) => arrastando && aoSoltar(eixo, e.clientX)}
      onPointerCancel={() => aoSoltar(eixo, null)}
    >
      <span />
    </div>
  )
}

export function ComparadorTamanhos({ modelos }: { modelos: ModeloComparavel[] }) {
  const id = useId()
  const tamanhos = useMemo(() => [...new Set(modelos.map((m) => m.tamanho))].sort((a, b) => a - b), [modelos])
  const [tamanho, setTamanho] = useState<Tamanho>(tamanhos.includes(20) ? 20 : tamanhos[0])
  const [modulos, setModulos] = useState<Modulos>(1)
  const doTamanho = modelos.filter((m) => m.tamanho === tamanho)
  const [slug, setSlug] = useState(doTamanho[0]?.slug ?? '')
  const modelo = doTamanho.find((m) => m.slug === slug) ?? doTamanho[0]

  const escolherTamanho = (t: Tamanho) => {
    setTamanho(t)
    const mesmoUso = modelos.find((m) => m.tamanho === t && m.uso === modelo?.uso)
    setSlug((mesmoUso ?? modelos.find((m) => m.tamanho === t))?.slug ?? '')
  }

  const { externa, interna } = dimensoesJuntas(tamanho, modulos)
  const planta = modelo ? plantaDe(modelo.uso, tamanho, modulos) : null
  const comprimentoAnimado = useNumeroAnimado(externa.comprimento)
  const larguraAnimada = useNumeroAnimado(externa.largura)
  const area = useNumeroAnimado(interna.comprimento * interna.largura)

  // Réguas: a alça da vista lateral estica o container e a da vista de frente junta mais um ao lado.
  // Ao soltar, encaixa na opção mais perto, com mola.
  const [esticado, setEsticado] = useState<{ eixo: Eixo; m: number } | null>(null)
  const [arrastando, setArrastando] = useState<Eixo | null>(null)
  const vistas = { comprimento: useRef<HTMLDivElement>(null), largura: useRef<HTMLDivElement>(null) }
  const planta3 = useRef<SVGSVGElement>(null)
  const comprimento = esticado?.eixo === 'comprimento' ? esticado.m : comprimentoAnimado
  const largura = esticado?.eixo === 'largura' ? esticado.m : larguraAnimada

  const metrosDoPonteiro = (eixo: Eixo, clienteX: number) => {
    const caixa = vistas[eixo].current?.getBoundingClientRect()
    if (!caixa) return null
    const m = ((clienteX - caixa.left) / caixa.width) * VISTA_M - INICIO[eixo]
    const [min, max] = LIMITES[eixo]
    return Math.min(max, Math.max(min, m))
  }

  const comecar = (eixo: Eixo, clienteX: number) => {
    setArrastando(eixo)
    const m = metrosDoPonteiro(eixo, clienteX)
    if (m !== null) setEsticado({ eixo, m })
  }

  const mover = (eixo: Eixo, clienteX: number) => {
    const m = metrosDoPonteiro(eixo, clienteX)
    if (m !== null) setEsticado({ eixo, m })
  }

  const soltar = async (eixo: Eixo, clienteX: number | null) => {
    setArrastando(null)
    const m = (clienteX !== null ? metrosDoPonteiro(eixo, clienteX) : null) ?? (eixo === 'comprimento' ? comprimento : largura)
    let alvo: number
    if (eixo === 'comprimento') {
      const maisPerto = tamanhos.reduce((melhor, t) =>
        Math.abs(MEDIDAS_METROS[t].externa.comprimento - m) < Math.abs(MEDIDAS_METROS[melhor].externa.comprimento - m)
          ? t
          : melhor,
      )
      escolherTamanho(maisPerto)
      alvo = MEDIDAS_METROS[maisPerto].externa.comprimento
    } else {
      const maisPerto = MODULOS.reduce((melhor, n) =>
        Math.abs(n * LARGURA_MODULO - m) < Math.abs(melhor * LARGURA_MODULO - m) ? n : melhor,
      )
      setModulos(maisPerto)
      alvo = maisPerto * LARGURA_MODULO
    }
    const { animate, spring } = await import('animejs')
    const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const estado = { m }
    const movimento: AnimationParams = reduzido
      ? { ease: 'outQuad', duration: 180 }
      : { ease: spring({ bounce: 0.4, duration: 520 }) }
    animate(estado, {
      m: alvo,
      ...movimento,
      onUpdate: () => setEsticado({ eixo, m: estado.m }),
      onComplete: () => setEsticado(null),
    })
  }

  // Peças da planta surgem do centro para as pontas, em cascata (anime.js).
  useEffect(() => {
    const svg = planta3.current
    if (!svg) return
    let cancelar = () => {}
    import('animejs').then(({ animate, stagger }) => {
      const pecas = svg.querySelectorAll('[data-peca]')
      if (!pecas.length) return
      const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const animacao = animate(pecas, {
        opacity: [0, 1],
        scale: reduzido ? [1, 1] : [0.55, 1],
        delay: stagger(reduzido ? 15 : 45, { from: 'center' }),
        duration: reduzido ? 200 : 520,
        ease: reduzido ? 'outQuad' : 'outBack(1.6)',
      })
      cancelar = () => {
        animacao.cancel()
      }
    })
    return () => cancelar()
  }, [slug, tamanho, modulos])

  if (!modelo || !planta) return null

  const nome = modulos === 1 ? modelo.nomeCompleto : `${modelo.nomeCompleto} · ${modulos} lado a lado`
  const pedido = modulos === 1 ? modelo.nomeCompleto : `${modelo.nomeCompleto} (${modulos} unidades lado a lado)`
  const alcas = {
    aoComecar: comecar,
    aoMover: mover,
    aoSoltar: soltar,
  }

  return (
    <div className={estilos.comparador}>
      <div className={estilos.controles}>
        <fieldset className={estilos.grupo}>
          <legend>Tamanho</legend>
          <div
            className={estilos.tamanhos}
            style={{ '--n': tamanhos.length, '--pos': tamanhos.indexOf(tamanho) } as React.CSSProperties}
          >
            {tamanhos.map((t) => (
              <label key={t} className={estilos.tamanho}>
                <input
                  type="radio"
                  name={`${id}-tamanho`}
                  value={t}
                  checked={t === tamanho}
                  onChange={() => escolherTamanho(t)}
                />
                <span className="marcacao">{t}&apos;</span>
                <small>pés</small>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className={estilos.grupo}>
          <legend>Lado a lado</legend>
          <div className={estilos.tamanhos} style={{ '--n': MODULOS.length, '--pos': modulos - 1 } as React.CSSProperties}>
            {MODULOS.map((n) => (
              <label key={n} className={estilos.tamanho}>
                <input
                  type="radio"
                  name={`${id}-modulos`}
                  value={n}
                  checked={n === modulos}
                  onChange={() => setModulos(n)}
                  aria-label={n === 1 ? 'Um container só' : `${n} containers lado a lado`}
                />
                <span className="marcacao">{n}×</span>
                <small>{n === 1 ? 'só' : 'juntos'}</small>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className={estilos.grupo}>
          <legend>Uso</legend>
          <div className={estilos.usos}>
            {doTamanho.map((m) => (
              <label key={m.slug} className={estilos.uso}>
                <input
                  type="radio"
                  name={`${id}-uso`}
                  value={m.slug}
                  checked={m.slug === modelo.slug}
                  onChange={() => setSlug(m.slug)}
                />
                <span>{m.nome}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div
        className={estilos.palco}
        data-esticando={esticado !== null || arrastando !== null}
        style={
          {
            '--comprimento': emVista(esticado?.eixo === 'comprimento' ? esticado.m : externa.comprimento),
            '--largura': emVista(esticado?.eixo === 'largura' ? esticado.m : externa.largura),
          } as React.CSSProperties
        }
      >
        <p className={estilos.rotuloVista}>
          Em escala, de lado e de frente · arraste as alças para mudar o tamanho e juntar containers
        </p>
        <div className={estilos.vistas} aria-hidden="true">
          <div ref={vistas.comprimento} className={estilos.vista}>
            <div className={estilos.elevacao}>
              <div className={estilos.nomeVista} style={{ left: emVista(INICIO_CAIXA_M) }}>
                de lado
              </div>
              <div className={estilos.pessoaLugar} style={{ left: emVista(0.25) }}>
                <Pessoa />
                <span>1,75 m</span>
              </div>
              <div className={estilos.caixa} style={{ left: emVista(INICIO_CAIXA_M) }}>
                <span className={`${estilos.pintura} marcacao`}>
                  EGI RENTAL <em>{tamanho}&apos;</em>
                </span>
              </div>
              <Alca
                eixo="comprimento"
                arrastando={arrastando === 'comprimento'}
                posicao={`calc(${emVista(INICIO_CAIXA_M)} + var(--comprimento))`}
                rotulo="Arraste para mudar o tamanho"
                {...alcas}
              />
              <div className={estilos.chao} />
              <div className={estilos.cota} style={{ left: emVista(INICIO_CAIXA_M) }}>
                <span className="marcacao">{metros(comprimento)} m</span>
              </div>
            </div>
          </div>

          <div ref={vistas.largura} className={estilos.vista}>
            <div className={estilos.elevacao}>
              <div className={estilos.nomeVista} style={{ left: emVista(INICIO_FRENTE_M) }}>
                de frente · {metros(externa.altura)} m de altura
              </div>
              <div className={estilos.frente} style={{ left: emVista(INICIO_FRENTE_M) }} />
              <Alca
                eixo="largura"
                arrastando={arrastando === 'largura'}
                posicao={`calc(${emVista(INICIO_FRENTE_M)} + var(--largura))`}
                rotulo="Arraste para juntar containers lado a lado"
                {...alcas}
              />
              <div className={estilos.chao} />
              <div className={`${estilos.cota} ${estilos.cotaLargura}`} style={{ left: emVista(INICIO_FRENTE_M) }}>
                <span className="marcacao">{metros(largura)} m</span>
              </div>
            </div>
          </div>
        </div>

        <p className={estilos.rotuloVista}>
          Planta vista de cima · exemplo de uso{modulos > 1 ? ' · a linha tracejada é onde a parede do meio saiu' : ''}
        </p>
        <div className={`${estilos.vista} ${estilos.vistaPlanta}`}>
          <div className={estilos.plantaLugar} style={{ marginLeft: emVista(INICIO_CAIXA_M) }}>
            <PlantaDoContainer
              key={`${modelo.slug}-${modulos}`}
              ref={planta3}
              planta={planta}
              rotulo={`Planta de exemplo do ${nome}: ${planta.legenda}`}
            />
          </div>
        </div>
      </div>

      <div className={estilos.resumo} aria-live="polite">
        <p className={estilos.resumoNome}>{nome}</p>
        <dl className={estilos.numeros}>
          <div>
            <dt>Comprimento</dt>
            <dd className="marcacao">{metros(comprimento)} m</dd>
          </div>
          <div>
            <dt>Largura</dt>
            <dd className="marcacao">{metros(largura)} m</dd>
          </div>
          <div>
            <dt>Área interna</dt>
            <dd className="marcacao">{area.toLocaleString('pt-BR', { maximumFractionDigits: 1, minimumFractionDigits: 1 })} m²</dd>
          </div>
        </dl>
        <p className={estilos.legenda}>{planta.legenda}. O layout final é combinado no orçamento.</p>
        <div className={estilos.acoes}>
          <a className={estilos.pedir} href={linkWhatsApp(mensagemDoModelo(pedido))} target="_blank" rel="noopener">
            <IconeWhatsApp /> Pedir {modulos === 1 ? 'este' : 'estes'}
          </a>
          <Link className={estilos.ficha} href={`/containers/${modelo.slug}`}>
            Ver a ficha
          </Link>
        </div>
      </div>
    </div>
  )
}
