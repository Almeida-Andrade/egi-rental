import type { Metadata } from 'next'
import Image from 'next/image'
import { Suspense } from 'react'
import { BotaoLink } from '@/components/site/Botao'
import { CabecaPagina } from '@/components/site/CabecaPagina'
import { FormularioPedido } from '@/components/site/FormularioPedido'
import { TituloSecao } from '@/components/site/TituloSecao'
import { ADAPTACOES, INSPIRACOES } from '@/lib/conteudo'
import { linkWhatsApp, mensagemSobMedida } from '@/lib/whatsapp'
import estilos from './page.module.css'

const DESCRICAO =
  'Containers adaptados ao seu projeto: divisórias, climatização, banheiro, balcão, cores da sua marca e ' +
  'módulos acoplados. Conte o que precisa e a EGI Rental monta.'

export const metadata: Metadata = {
  title: 'Containers sob medida',
  description: DESCRICAO,
  alternates: { canonical: '/sob-medida' },
  openGraph: { url: '/sob-medida', title: 'Containers sob medida', description: DESCRICAO },
}

const ETAPAS = [
  { titulo: 'Conversa', texto: 'Você conta o uso, o espaço disponível e o prazo.' },
  { titulo: 'Proposta', texto: 'Desenhamos a solução e enviamos o orçamento.' },
  { titulo: 'Adaptação', texto: 'Preparamos o container com o que foi combinado.' },
  { titulo: 'Entrega', texto: 'Levamos, posicionamos e deixamos pronto para uso.' },
]

export default function SobMedida() {
  return (
    <>
      <CabecaPagina
        kicker="Sob medida"
        titulo="O container do jeito que o seu projeto pede"
        texto="Quando nenhum modelo do catálogo encaixa, a gente adapta. Escritório com banheiro, stand com a sua marca, módulos lado a lado ou em dois andares."
        foto={{ src: '/fotos/sob-medida-dois-andares.jpg', alt: '' }}
        trilha={[{ href: '/sob-medida', rotulo: 'Sob medida' }]}
      >
        <BotaoLink href="#projeto" variante="claro" grande seta>
          Descrever meu projeto
        </BotaoLink>
        <BotaoLink href={linkWhatsApp(mensagemSobMedida())} variante="contorno-claro" grande>
          Falar no WhatsApp
        </BotaoLink>
      </CabecaPagina>

      <section className={estilos.secao} aria-labelledby="adaptacoes-titulo">
        <div className={estilos.interno}>
          <TituloSecao
            id="adaptacoes-titulo"
            kicker="O que dá para fazer"
            titulo="Exemplos do que adaptamos"
            texto="Cada projeto é combinado no orçamento. Estes são os pedidos mais comuns."
          />
          <ul className={estilos.adaptacoes}>
            {ADAPTACOES.map((a, i) => (
              <li key={a.titulo} className="revelar">
                <span className={estilos.numero}>{String(i + 1).padStart(2, '0')}</span>
                <h3>{a.titulo}</h3>
                <p>{a.texto}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={`${estilos.secao} ${estilos.escura}`} aria-labelledby="inspiracao-titulo">
        <div className={estilos.interno}>
          <TituloSecao
            id="inspiracao-titulo"
            kicker="Inspiração"
            titulo="Container também é arquitetura"
            texto="Referências do que um container bem adaptado pode virar. Fotos ilustrativas."
            claro
          />
          <ul className={estilos.inspiracoes}>
            {INSPIRACOES.map((foto) => (
              <li key={foto.src} className="revelar">
                <Image src={foto.src} alt={foto.alt} fill sizes="(min-width: 960px) 33vw, 100vw" />
              </li>
            ))}
          </ul>
          <ol className={estilos.etapas}>
            {ETAPAS.map((e, i) => (
              <li key={e.titulo}>
                <span>{i + 1}</span>
                <div>
                  <h3>{e.titulo}</h3>
                  <p>{e.texto}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="projeto" className={estilos.secao} aria-labelledby="projeto-titulo">
        <div className={`${estilos.interno} ${estilos.formulario}`}>
          <TituloSecao
            id="projeto-titulo"
            kicker="Seu projeto"
            titulo="Conte o que você precisa"
            texto="Quanto mais detalhe, mais certeira a proposta: uso, quantidade de pessoas, onde o container vai ficar e por quanto tempo."
          />
          <div className={estilos.cartaoForm}>
            <Suspense>
              <FormularioPedido tipo="sob-medida" />
            </Suspense>
          </div>
        </div>
      </section>
    </>
  )
}
