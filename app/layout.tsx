import type { Metadata, Viewport } from 'next'
import { Archivo, Big_Shoulders_Stencil } from 'next/font/google'
import { BotaoWhatsApp } from '@/components/site/BotaoWhatsApp'
import { Cabecalho } from '@/components/site/Cabecalho'
import { Rodape } from '@/components/site/Rodape'
import { EMPRESA, URL_SITE } from '@/lib/site'
import './globals.css'

// O rodapé lista o catálogo em toda página: nenhuma pode ficar estática para sempre.
export const revalidate = 3600

// Uma família só, com a largura variável fazendo o papel de título; a stencil é a das marcações
// pintadas nos containers e só aparece em número e código.
const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--fonte-archivo',
  display: 'swap',
})
const stencil = Big_Shoulders_Stencil({
  subsets: ['latin'],
  axes: ['opsz'],
  variable: '--fonte-marcacao',
  display: 'swap',
  adjustFontFallback: false,
  fallback: ['Arial Narrow', 'sans-serif'],
})

const TITULO = 'EGI Rental — Locação de containers em São Luís'
const DESCRICAO =
  'Containers para escritório, almoxarifado, sanitário e stand em locação de curto, médio e longo prazo, ' +
  'com entrega e retirada no local. Projetos sob medida para obras, indústrias e eventos no Maranhão.'

export const metadata: Metadata = {
  metadataBase: new URL(URL_SITE),
  title: { default: TITULO, template: `%s · ${EMPRESA.nome}` },
  description: DESCRICAO,
  applicationName: EMPRESA.nome,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: EMPRESA.nome,
    title: TITULO,
    description: DESCRICAO,
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: EMPRESA.nome }],
  },
  twitter: { card: 'summary_large_image' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
}

export const viewport: Viewport = {
  themeColor: '#0a1222',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // O script da abertura marca data-portas no <html> antes da hidratação, de propósito.
    <html lang="pt-BR" className={`${archivo.variable} ${stencil.variable}`} suppressHydrationWarning>
      <body>
        <a className="pular-conteudo" href="#conteudo">
          Pular para o conteúdo
        </a>
        <Cabecalho />
        <main id="conteudo">{children}</main>
        <Rodape />
        <BotaoWhatsApp />
      </body>
    </html>
  )
}
