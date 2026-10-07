import Image from 'next/image'
import Link from 'next/link'
import type { Modelo } from '@/lib/catalogo'
import { Icone } from './Icone'
import estilos from './CartaoModelo.module.css'

export function CartaoModelo({ modelo, prioridade }: { modelo: Modelo; prioridade?: boolean }) {
  return (
    <article className={estilos.cartao}>
      <div className={estilos.foto}>
        <Image
          src={modelo.capa.src}
          alt={modelo.capa.alt}
          fill
          sizes="(min-width: 1080px) 380px, (min-width: 640px) 50vw, 100vw"
          priority={prioridade}
        />
        <span className={estilos.selo}>{modelo.tamanho} pés</span>
      </div>
      <div className={estilos.corpo}>
        <h3>
          <Link href={`/containers/${modelo.slug}`} className={estilos.link}>
            {modelo.nomeCompleto}
          </Link>
        </h3>
        <p>{modelo.resumo}</p>
        <dl className={estilos.ficha}>
          <div>
            <dt>Área interna</dt>
            <dd>≈ {modelo.medidas.areaM2.toLocaleString('pt-BR')} m²</dd>
          </div>
          <div>
            <dt>Medidas externas</dt>
            <dd>{modelo.medidas.externa}</dd>
          </div>
        </dl>
        <span className={estilos.ver} aria-hidden="true">
          Ver detalhes <Icone nome="seta" tamanho={18} />
        </span>
      </div>
    </article>
  )
}
