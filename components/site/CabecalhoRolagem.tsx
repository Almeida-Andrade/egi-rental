'use client'

import { useEffect, useState } from 'react'

// Só a casca do cabeçalho é cliente: logo e menu chegam prontos como children.
export function CabecalhoRolagem({ className, children }: { className: string; children: React.ReactNode }) {
  const [escondido, setEscondido] = useState(false)

  useEffect(() => {
    let anterior = window.scrollY
    let agendado = false
    const aoRolar = () => {
      if (agendado) return
      agendado = true
      requestAnimationFrame(() => {
        const atual = window.scrollY
        const delta = atual - anterior
        if (atual < 120) setEscondido(false)
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
