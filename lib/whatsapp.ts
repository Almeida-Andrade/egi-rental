import { CONTATO } from './site'

export function linkWhatsApp(texto?: string): string {
  const base = `https://wa.me/${CONTATO.whatsapp}`
  return texto ? `${base}?text=${encodeURIComponent(texto)}` : base
}

export function mensagemGeral(): string {
  return 'Olá! Quero saber mais sobre a locação de containers. Vi no site.'
}

export function mensagemDoModelo(nomeModelo: string): string {
  return `Olá! Quero um orçamento de locação do container ${nomeModelo}. Vi no site.`
}

export function mensagemSobMedida(): string {
  return 'Olá! Preciso de um container sob medida e quero conversar sobre o projeto. Vi no site.'
}
