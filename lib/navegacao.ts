export interface ItemNavegacao {
  href: string
  rotulo: string
}

export const NAVEGACAO: ItemNavegacao[] = [
  { href: '/containers', rotulo: 'Containers' },
  { href: '/sob-medida', rotulo: 'Sob medida' },
  { href: '/#aplicacoes', rotulo: 'Aplicações' },
  { href: '/#quem-somos', rotulo: 'Quem somos' },
  { href: '/contato', rotulo: 'Contato' },
]

export function itemAtivo(caminho: string, href: string): boolean {
  if (href.includes('#')) return false
  return caminho === href || caminho.startsWith(`${href}/`)
}
