'use client'

import Image from 'next/image'
import { useState } from 'react'
import type { Aplicacao } from '@/lib/conteudo'
import estilos from './ListaAplicacoes.module.css'

export function ListaAplicacoes({ aplicacoes }: { aplicacoes: Aplicacao[] }) {
  const [ativa, setAtiva] = useState(0)

  return (
    <div className={estilos.lista}>
      <ul className={estilos.itens}>
        {aplicacoes.map((a, i) => (
          <li key={a.titulo} className={estilos.item} data-ativa={i === ativa}>
            <button
              type="button"
              className={estilos.titulo}
              aria-expanded={i === ativa}
              aria-controls={`aplicacao-${i}`}
              onClick={() => setAtiva(i)}
              onMouseEnter={() => setAtiva(i)}
              onFocus={() => setAtiva(i)}
            >
              {a.titulo}
            </button>
            <div id={`aplicacao-${i}`} className={estilos.detalhe}>
              <div>
                <p>{a.texto}</p>
                <div className={estilos.fotoCelular}>
                  <Image src={a.foto.src} alt={a.foto.alt} fill sizes="100vw" />
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className={estilos.palco} aria-hidden="true">
        {aplicacoes.map((a, i) => (
          <div key={a.foto.src} className={estilos.foto} data-ativa={i === ativa}>
            {/* Carregadas de cara: preguiçosa, a foto escondida só baixava quando a cortina já abria sobre o vazio */}
            <Image src={a.foto.src} alt="" fill sizes="(min-width: 960px) 55vw, 1px" loading="eager" />
          </div>
        ))}
      </div>
    </div>
  )
}
