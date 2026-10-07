'use client'

import Link from 'next/link'
import type { AnimationParams } from 'animejs'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { MEDIDAS_METROS, metros, type Tamanho } from '@/lib/medidas'
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

// Largura total do palco em metros: cabe a pessoa e o container de 40 pés na mesma escala.
const PALCO_M = 13.6
const INICIO_CAIXA_M = 1.05

function emPalco(m: number): string {
  return `${(m / PALCO_M) * 100}%`
}

function Pessoa() {
  return (
    <svg className={estilos.pessoa} viewBox="0 0 50 175" aria-hidden="true">
      <circle cx="25" cy="12" r="11" />
      <path d="M12 30h26c4 0 7 3 7 7v48c0 3-2 5-5 5h-3v80c0 3-2 5-5 5h-4c-2 0-3-1-3-3V110h-2v62c0 2-1 3-3 3h-4c-3 0-5-2-5-5V90h-3c-3 0-5-2-5-5V37c0-4 3-7 7-7Z" />
    </svg>
  )
}

export function ComparadorTamanhos({ modelos }: { modelos: ModeloComparavel[] }) {
  const id = useId()
  const tamanhos = useMemo(() => [...new Set(modelos.map((m) => m.tamanho))].sort((a, b) => a - b), [modelos])
  const [tamanho, setTamanho] = useState<Tamanho>(tamanhos.includes(20) ? 20 : tamanhos[0])
  const doTamanho = modelos.filter((m) => m.tamanho === tamanho)
  const [slug, setSlug] = useState(doTamanho[0]?.slug ?? '')
  const modelo = doTamanho.find((m) => m.slug === slug) ?? doTamanho[0]

  const escolherTamanho = (t: Tamanho) => {
    setTamanho(t)
    const mesmoUso = modelos.find((m) => m.tamanho === t && m.uso === modelo?.uso)
    setSlug((mesmoUso ?? modelos.find((m) => m.tamanho === t))?.slug ?? '')
  }

  const { externa, interna } = MEDIDAS_METROS[tamanho]
  const planta = modelo ? plantaDe(modelo.uso, tamanho) : null
  const comprimentoAnimado = useNumeroAnimado(externa.comprimento)
  const area = useNumeroAnimado(interna.comprimento * interna.largura)

  // Régua: a alça na ponta estica o container; ao soltar ele encaixa no tamanho mais perto, com mola.
  const [esticado, setEsticado] = useState<number | null>(null)
  const [arrastando, setArrastando] = useState(false)
  const elevacao = useRef<HTMLDivElement>(null)
  const planta3 = useRef<SVGSVGElement>(null)
  const comprimento = esticado ?? comprimentoAnimado

  const metrosDoPonteiro = (clienteX: number) => {
    const caixa = elevacao.current?.getBoundingClientRect()
    if (!caixa) return null
    const m = ((clienteX - caixa.left) / caixa.width) * PALCO_M - INICIO_CAIXA_M
    return Math.min(MEDIDAS_METROS[40].externa.comprimento + 0.3, Math.max(2.4, m))
  }

  const soltar = async (m: number) => {
    setArrastando(false)
    const maisPerto = tamanhos.reduce((melhor, t) =>
      Math.abs(MEDIDAS_METROS[t].externa.comprimento - m) < Math.abs(MEDIDAS_METROS[melhor].externa.comprimento - m)
        ? t
        : melhor,
    )
    escolherTamanho(maisPerto)
    const alvo = MEDIDAS_METROS[maisPerto].externa.comprimento
    const { animate, spring } = await import('animejs')
    const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const estado = { m }
    const movimento: AnimationParams = reduzido
      ? { ease: 'outQuad', duration: 180 }
      : { ease: spring({ bounce: 0.4, duration: 520 }) }
    animate(estado, {
      m: alvo,
      ...movimento,
      onUpdate: () => setEsticado(estado.m),
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
  }, [slug, tamanho])

  if (!modelo || !planta) return null

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
        data-esticando={esticado !== null || arrastando}
        style={{ '--comprimento': emPalco(esticado ?? externa.comprimento) } as React.CSSProperties}
      >
        <p className={estilos.rotuloVista}>Vista lateral, em escala · arraste a ponta para mudar o tamanho</p>
        <div ref={elevacao} className={estilos.elevacao} aria-hidden="true">
          <div className={estilos.pessoaLugar} style={{ left: emPalco(0.25) }}>
            <Pessoa />
            <span>1,75 m</span>
          </div>
          <div className={estilos.caixa} style={{ left: emPalco(INICIO_CAIXA_M) }}>
            <span className={`${estilos.pintura} marcacao`}>
              EGI RENTAL <em>{tamanho}&apos;</em>
            </span>
            <span className={estilos.altura}>{metros(externa.altura)} m</span>
          </div>
          <div
            className={estilos.alca}
            style={{ left: `calc(${emPalco(INICIO_CAIXA_M)} + var(--comprimento))` }}
            data-arrastando={arrastando}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId)
              setArrastando(true)
              const m = metrosDoPonteiro(e.clientX)
              if (m !== null) setEsticado(m)
            }}
            onPointerMove={(e) => {
              if (!arrastando) return
              const m = metrosDoPonteiro(e.clientX)
              if (m !== null) setEsticado(m)
            }}
            onPointerUp={(e) => {
              if (!arrastando) return
              soltar(metrosDoPonteiro(e.clientX) ?? comprimento)
            }}
            onPointerCancel={() => soltar(comprimento)}
          >
            <span />
          </div>
          <div className={estilos.chao} />
          <div className={estilos.cota} style={{ left: emPalco(INICIO_CAIXA_M) }}>
            <span className="marcacao">{metros(comprimento)} m</span>
          </div>
        </div>

        <p className={estilos.rotuloVista}>Planta vista de cima · exemplo de uso</p>
        <div className={estilos.plantaLugar} style={{ marginLeft: emPalco(INICIO_CAIXA_M) }}>
          <PlantaDoContainer
            key={modelo.slug}
            ref={planta3}
            planta={planta}
            rotulo={`Planta de exemplo do ${modelo.nomeCompleto}: ${planta.legenda}`}
          />
        </div>
      </div>

      <div className={estilos.resumo} aria-live="polite">
        <p className={estilos.resumoNome}>{modelo.nomeCompleto}</p>
        <dl className={estilos.numeros}>
          <div>
            <dt>Comprimento</dt>
            <dd className="marcacao">{metros(comprimento)} m</dd>
          </div>
          <div>
            <dt>Área interna</dt>
            <dd className="marcacao">{area.toLocaleString('pt-BR', { maximumFractionDigits: 1, minimumFractionDigits: 1 })} m²</dd>
          </div>
          <div>
            <dt>Largura × altura</dt>
            <dd className="marcacao">
              {metros(externa.largura)} × {metros(externa.altura)}
            </dd>
          </div>
        </dl>
        <p className={estilos.legenda}>{planta.legenda}. O layout final é combinado no orçamento.</p>
        <div className={estilos.acoes}>
          <a className={estilos.pedir} href={linkWhatsApp(mensagemDoModelo(modelo.nomeCompleto))} target="_blank" rel="noopener">
            <IconeWhatsApp /> Pedir este
          </a>
          <Link className={estilos.ficha} href={`/containers/${modelo.slug}`}>
            Ver a ficha
          </Link>
        </div>
      </div>
    </div>
  )
}
