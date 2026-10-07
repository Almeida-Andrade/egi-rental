import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CabecaPagina } from '@/components/site/CabecaPagina'
import { FormularioPedido } from '@/components/site/FormularioPedido'
import { Icone, IconeWhatsApp } from '@/components/site/Icone'
import { TituloSecao } from '@/components/site/TituloSecao'
import { buscarCatalogo } from '@/lib/dados/catalogo'
import { CONTATO } from '@/lib/site'
import { linkWhatsApp, mensagemGeral } from '@/lib/whatsapp'
import estilos from './page.module.css'

export const revalidate = 3600

const DESCRICAO = 'Fale com a EGI Rental pelo WhatsApp, telefone ou e-mail e peça o orçamento de locação de containers.'

export const metadata: Metadata = {
  title: 'Contato e orçamento',
  description: DESCRICAO,
  alternates: { canonical: '/contato' },
  openGraph: { url: '/contato', title: 'Contato e orçamento', description: DESCRICAO },
}

export default async function Contato() {
  const catalogo = await buscarCatalogo()

  return (
    <>
      <CabecaPagina
        kicker="Contato"
        titulo="Vamos falar do seu projeto"
        texto={`Atendimento ${CONTATO.horario.toLowerCase()}. Pelo WhatsApp a resposta é mais rápida.`}
        trilha={[{ href: '/contato', rotulo: 'Contato' }]}
      />

      <section className={estilos.secao}>
        <div className={`${estilos.interno} ${estilos.grade}`}>
          <aside className={estilos.canais} aria-label="Canais de atendimento">
            <a className={`${estilos.canal} ${estilos.whatsapp}`} href={linkWhatsApp(mensagemGeral())} target="_blank" rel="noopener">
              <IconeWhatsApp tamanho={26} />
              <span>
                <small>WhatsApp</small>
                {CONTATO.telefones[0].rotulo}
              </span>
            </a>
            {CONTATO.telefones.map((t) => (
              <a key={t.tel} className={estilos.canal} href={`tel:${t.tel}`}>
                <Icone nome="telefone" tamanho={22} />
                <span>
                  <small>Telefone</small>
                  {t.rotulo}
                </span>
              </a>
            ))}
            <a className={estilos.canal} href={`mailto:${CONTATO.email}`}>
              <Icone nome="email" tamanho={22} />
              <span>
                <small>E-mail</small>
                {CONTATO.email}
              </span>
            </a>
            <a className={estilos.canal} href={CONTATO.instagram.url} target="_blank" rel="noopener">
              <Icone nome="instagram" tamanho={22} />
              <span>
                <small>Instagram</small>
                {CONTATO.instagram.usuario}
              </span>
            </a>
            <p className={estilos.horario}>
              <Icone nome="relogio" tamanho={18} /> {CONTATO.horario}
            </p>
          </aside>

          <div id="orcamento" className={estilos.cartaoForm}>
            <TituloSecao kicker="Orçamento" titulo="Peça o seu orçamento" texto="Preencha o que souber. O resto a gente resolve na conversa." />
            <div className={estilos.form}>
              <Suspense>
                <FormularioPedido tipo="orcamento" modelos={catalogo.map((m) => m.nomeCompleto)} />
              </Suspense>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
