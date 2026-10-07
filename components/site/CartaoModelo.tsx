import Image from 'next/image'
import Link from 'next/link'
import { ViewTransition } from 'react'
import type { Modelo } from '@/lib/catalogo'
import { MEDIDAS_METROS, metros, ROTULO_FABRICACAO } from '@/lib/modelos'
import { Icone } from './Icone'
import estilos from './CartaoModelo.module.css'

interface Props {
  modelo: Modelo
  prioridade?: boolean
  destaque?: boolean
}

export function CartaoModelo({ modelo, prioridade, destaque }: Props) {
  return (
    <article className={`${estilos.cartao} ${destaque ? estilos.destaque : ''}`}>
      <div className={estilos.foto}>
        <ViewTransition name={`foto-${modelo.slug}`} share="morph" default="none">
          <Image
            src={modelo.capa.src}
            alt={modelo.capa.alt}
            fill
            sizes={destaque ? '(min-width: 1080px) 760px, 100vw' : '(min-width: 1080px) 380px, (min-width: 640px) 50vw, 100vw'}
            priority={prioridade}
          />
        </ViewTransition>
        <span className={`${estilos.pintado} marcacao`} aria-hidden="true">
          {modelo.tamanho}&apos;
        </span>
        <span className={estilos.ver} aria-hidden="true">
          <Icone nome="seta" tamanho={20} />
        </span>
      </div>
      <div className={estilos.corpo}>
        <p className={estilos.tipo}>
          Container {modelo.tamanho} pés
          {modelo.fabricacoes.length > 0 && ` · ${modelo.fabricacoes.map((f) => ROTULO_FABRICACAO[f].toLowerCase()).join(' ou ')}`}
        </p>
        <h3>
          <Link href={`/containers/${modelo.slug}`} className={estilos.link} transitionTypes={['ir-para-ficha']}>
            {modelo.nome}
          </Link>
        </h3>
        <p className={estilos.resumo}>{modelo.resumo}</p>
        <p className={estilos.medidas}>
          <span>≈ {modelo.medidas.areaM2.toLocaleString('pt-BR')} m² internos</span>
          <span>{metros(MEDIDAS_METROS[modelo.tamanho].externa.comprimento)} m de comprimento</span>
        </p>
      </div>
    </article>
  )
}
