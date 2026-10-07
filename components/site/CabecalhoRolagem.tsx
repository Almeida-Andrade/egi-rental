'use client'

import { useEffect, useState } from 'react'

// Só a casca do cabeçalho é cliente: logo e menu chegam prontos como children.
export function CabecalhoRolagem({ className, children }: { className: string; children: React.ReactNode }) {
  const [escondido, setEscondido] = useState(false)

  useEffect(() => {
    let anterior = window.scrollY
    let agendado = false
    let salto = 0
    const aoRolar = () => {
      if (agendado) return
      agendado = true
      requestAnimationFrame(() => {
        const atual = window.scrollY
        const delta = atual - anterior
        // Salto de mais de tela e meia num quadro é ida a uma âncora: o cabeçalho fica, e ocupa o
        // espaço que o scroll-padding reservou acima da seção. O navegador ainda ajusta a posição
        // logo depois; esse ajuste não conta como rolar para baixo.
        const agora = performance.now()
        if (Math.abs(delta) > window.innerHeight * 1.5) salto = agora
        if (atual < 120 || agora - salto < 1000) setEscondido(false)
        else if (delta > 6) setEscondido(true)
        else if (delta < -6) setEscondido(false)
        anterior = atual
        agendado = false
      })
    }
    window.addEventListener('scroll', aoRolar, { passive: true })
    return () => window.removeEventListener('scroll', aoRolar)
  }, [])

  return (
    <header
      className={className}
      data-escondido={escondido}
      onFocusCapture={() => setEscondido(false)}
    >
      {children}
    </header>
  )
}
