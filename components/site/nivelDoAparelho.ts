import { nivelDoAparelho, type Nivel } from '@/lib/desempenho'

// Só no navegador: os sinais que cada um expõe (deviceMemory e saveData só existem no Chromium).
export function lerNivelDoAparelho(): Nivel {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } }
  return nivelDoAparelho({
    nucleos: nav.hardwareConcurrency,
    memoriaGb: nav.deviceMemory,
    economiaDeDados: nav.connection?.saveData,
    densidade: window.devicePixelRatio,
    celular: window.matchMedia('(pointer: coarse)').matches,
  })
}
