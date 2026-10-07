'use client'

import { useEffect, useRef, useState } from 'react'

// Sobe do valor anterior ao novo; com movimento reduzido fica mais curto, nunca some.
export function useNumeroAnimado(alvo: number, duracaoMs = 700): number {
  const [valor, setValor] = useState(alvo)
  const atual = useRef(alvo)

  useEffect(() => {
    const de = atual.current
    if (de === alvo) return
    const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const duracao = reduzido ? Math.min(300, duracaoMs) : duracaoMs
    const inicio = performance.now()
    let quadro = 0
    const passo = (agora: number) => {
      const t = Math.min(1, (agora - inicio) / duracao)
      const suave = 1 - Math.pow(1 - t, 3)
      const v = de + (alvo - de) * suave
      atual.current = v
      setValor(v)
      if (t < 1) quadro = requestAnimationFrame(passo)
    }
    quadro = requestAnimationFrame(passo)
    return () => cancelAnimationFrame(quadro)
  }, [alvo, duracaoMs])

  return valor
}
