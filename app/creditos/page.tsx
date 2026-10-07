import type { Metadata } from 'next'
import { CabecaPagina } from '@/components/site/CabecaPagina'
import { CREDITOS } from '@/lib/creditos'
import estilos from './page.module.css'

export const metadata: Metadata = {
  title: 'Créditos das imagens',
  alternates: { canonical: '/creditos' },
  robots: { index: false, follow: true },
}

export default function Creditos() {
  return (
    <>
      <CabecaPagina
        kicker="Créditos"
        titulo="Créditos das imagens"
        texto="As fotos deste site são ilustrativas, publicadas no Unsplash sob a licença Unsplash."
      />
      <section className={estilos.secao}>
        <ul className={estilos.lista}>
          {CREDITOS.map((c) => (
            <li key={c.arquivo}>
              <span>{c.arquivo}</span>
              <a href={c.url} target="_blank" rel="noopener">
                Foto de {c.autor} no Unsplash
              </a>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
