// Nível do aparelho para as animações: 'leve' desliga os efeitos caros (sombra, chapa ondulada,
// inércia da rolagem, resolução alta no 3D). Os sinais vêm do navegador; a medição dos quadros
// corrige o palpite depois.
export type Nivel = 'leve' | 'normal'

export interface SinaisDoAparelho {
  nucleos?: number
  memoriaGb?: number
  economiaDeDados?: boolean
  densidade?: number
  celular?: boolean
}

export function nivelDoAparelho(s: SinaisDoAparelho): Nivel {
  if (s.economiaDeDados) return 'leve'
  if (s.memoriaGb !== undefined && s.memoriaGb <= 4) return 'leve'
  if (s.nucleos !== undefined && s.nucleos <= 4) return 'leve'
  // Celular com tela muito densa e pouco processador empurra pixels demais para a GPU
  if (s.celular && (s.densidade ?? 1) >= 3 && (s.nucleos ?? 8) <= 6) return 'leve'
  return 'normal'
}

// Intervalos entre quadros em ms: lento quando a mediana passa de 20 ms (menos de 50 fps) ou mais de
// 10% dos quadros passam de 33 ms (menos de 30 fps). Com poucos quadros ainda não dá para julgar.
export const QUADROS_PARA_JULGAR = 45

export function quadrosLentos(intervalos: number[]): boolean {
  if (intervalos.length < QUADROS_PARA_JULGAR) return false
  const ordenados = [...intervalos].sort((a, b) => a - b)
  const mediana = ordenados[Math.floor(ordenados.length / 2)]
  const travados = intervalos.filter((d) => d > 33).length / intervalos.length
  return mediana > 20 || travados > 0.1
}
