import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Montador } from '@/components/montador/Montador'
import estilos from './page.module.css'

const DESCRICAO =
  'Monte o seu container em 3D: escolha o tamanho e a cor, coloque móveis, porta e janela, e envie o projeto para a EGI Rental.'

export const metadata: Metadata = {
  title: 'Monte o seu container em 3D',
  description: DESCRICAO,
  alternates: { canonical: '/sob-medida/montar' },
  openGraph: { url: '/sob-medida/montar', title: 'Monte o seu container em 3D', description: DESCRICAO },
}

export default function Montar() {
  return (
    <>
      <header className={estilos.cabeca}>
        <div>
          <h1>Monte o seu container</h1>
          <p>
            Escolha o tamanho, ponha as peças e arraste no 3D até ficar do seu jeito. Gire a câmera com o dedo ou o
            mouse. Quando gostar, envie o projeto: a gente recebe o mesmo container que você montou.
          </p>
        </div>
      </header>
      <Suspense fallback={<div className={estilos.reserva}>Carregando o montador…</div>}>
        <Montador />
      </Suspense>
    </>
  )
}
