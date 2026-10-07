'use client'

import Link from 'next/link'
import { useId, useMemo, useState } from 'react'
import { MEDIDAS_METROS, metros, type Tamanho } from '@/lib/medidas'
import type { Uso } from '@/lib/modelos'
import { plantaDe, type Peca } from '@/lib/plantas'
import { linkWhatsApp, mensagemDoModelo } from '@/lib/whatsapp'
import { IconeWhatsApp } from './Icone'
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

function PecaDaPlanta({ peca, i }: { peca: Peca; i: number }) {
  const x = peca.x * 100
  const y = peca.y * 100
  const w = peca.w * 100
  const h = peca.h * 100
  const estilo = { '--i': i } as React.CSSProperties

  switch (peca.tipo) {
    case 'porta':
      return (
        <g className={estilos.abertura} style={estilo}>
          <rect x={x} y={y - 4} width={w} height={h + 8} className={estilos.vao} />
          <path d={`M${x + w} ${y} A${w} ${w} 0 0 0 ${x} ${y - w}`} className={estilos.giro} />
          <line x1={x} y1={y} x2={x} y2={y - w} className={estilos.folha} />
        </g>
      )
    case 'portas-fundo': {
      // Portas de abrir para fora, desenhadas curtas para não sair do palco no 40 pés
      const r = 35
      return (
        <g className={estilos.abertura} style={estilo}>
          <rect x={x - 4} y={y} width={w + 8} height={h} className={estilos.vao} />
          <path d={`M${x + w} ${y} l${r} ${-r * 0.15} M${x + w} ${y + h} l${r} ${r * 0.15}`} className={estilos.folha} />
          <path d={`M${x + w} ${y + r} A${r} ${r} 0 0 0 ${x + w + r} ${y - r * 0.15}`} className={estilos.giro} />
          <path d={`M${x + w} ${y + h - r} A${r} ${r} 0 0 1 ${x + w + r} ${y + h + r * 0.15}`} className={estilos.giro} />
        </g>
      )
    }
    case 'janela':
      return (
        <g className={estilos.abertura} style={estilo}>
          <rect x={x} y={y - 4} width={w} height={h + 8} className={estilos.vao} />
          <line x1={x} y1={y + h / 2} x2={x + w} y2={y + h / 2} className={estilos.vidro} />
        </g>
      )
    case 'divisoria':
      return <rect x={x} y={y} width={w} height={h} className={estilos.divisoria} style={estilo} />
    case 'cadeira':
    case 'vaso':
    case 'pia':
      return <rect x={x} y={y} width={w} height={h} rx={Math.min(w, h) / 2.4} className={estilos.movel} style={estilo} />
    case 'fogao':
      return (
        <g className={estilos.peca} style={estilo}>
          <rect x={x} y={y} width={w} height={h} className={estilos.movelForte} />
          {[0.3, 0.7].flatMap((fx) =>
            [0.3, 0.7].map((fy) => <circle key={`${fx}${fy}`} cx={x + w * fx} cy={y + h * fy} r={w * 0.12} className={estilos.boca} />),
          )}
        </g>
      )
    case 'chuveiro':
      return (
        <g className={estilos.peca} style={estilo}>
          <rect x={x} y={y} width={w} height={h} className={estilos.movel} />
          <path d={`M${x} ${y}L${x + w} ${y + h}M${x + w} ${y}L${x} ${y + h}`} className={estilos.traco} />
        </g>
      )
    case 'prateleira':
    case 'palete':
      return <rect x={x} y={y} width={w} height={h} className={estilos.hachura} style={estilo} />
    default:
      return <rect x={x} y={y} width={w} height={h} rx="3" className={estilos.movelForte} style={estilo} />
  }
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
  const comprimento = useNumeroAnimado(externa.comprimento)
  const area = useNumeroAnimado(interna.comprimento * interna.largura)

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

      <div className={estilos.palco} style={{ '--comprimento': emPalco(externa.comprimento) } as React.CSSProperties}>
        <p className={estilos.rotuloVista}>Vista lateral, em escala</p>
        <div className={estilos.elevacao} aria-hidden="true">
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
          <div className={estilos.chao} />
          <div className={estilos.cota} style={{ left: emPalco(INICIO_CAIXA_M) }}>
            <span className="marcacao">{metros(comprimento)} m</span>
          </div>
        </div>

        <p className={estilos.rotuloVista}>Planta vista de cima · exemplo de uso</p>
        <div className={estilos.plantaLugar} style={{ marginLeft: emPalco(INICIO_CAIXA_M) }}>
          <svg
            key={`${modelo.slug}`}
            className={estilos.planta}
            viewBox={`-12 -12 ${planta.comprimento * 100 + 24} ${planta.largura * 100 + 24}`}
            role="img"
            aria-label={`Planta de exemplo do ${modelo.nomeCompleto}: ${planta.legenda}`}
          >
            <rect
              x="0"
              y="0"
              width={planta.comprimento * 100}
              height={planta.largura * 100}
              className={estilos.parede}
            />
            {planta.pecas.map((p, i) => (
              <PecaDaPlanta key={`${p.tipo}-${i}`} peca={p} i={i} />
            ))}
          </svg>
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
