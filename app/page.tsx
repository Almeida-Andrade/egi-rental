import Image from 'next/image'
import Link from 'next/link'
import { BotaoLink } from '@/components/site/Botao'
import { CartaoModelo } from '@/components/site/CartaoModelo'
import { ComparadorTamanhos } from '@/components/site/ComparadorTamanhos'
import { ContainerAbrindo } from '@/components/site/ContainerAbrindo'
import { DadosEstruturados } from '@/components/site/DadosEstruturados'
import { FaixaSobMedida } from '@/components/site/FaixaSobMedida'
import { Icone, IconeWhatsApp } from '@/components/site/Icone'
import { ListaAplicacoes } from '@/components/site/ListaAplicacoes'
import { NumerosModular } from '@/components/site/NumerosModular'
import { Rota } from '@/components/site/Rota'
import { tamanhosDoCatalogo } from '@/lib/catalogo'
import { APLICACOES, capitulosDaAbertura, INCLUSO, PASSOS } from '@/lib/conteudo'
import { buscarCatalogo } from '@/lib/dados/catalogo'
import { CONTATO, EMPRESA, URL_SITE } from '@/lib/site'
import { linkWhatsApp, mensagemGeral } from '@/lib/whatsapp'
import estilos from './page.module.css'

export const revalidate = 3600

function juntar(itens: string[]): string {
  return itens.length < 2 ? itens.join('') : `${itens.slice(0, -1).join(', ')} e ${itens.at(-1)}`
}

export default async function Inicio() {
  const catalogo = await buscarCatalogo()
  const tamanhos = tamanhosDoCatalogo(catalogo)
  const usos = [...new Set(catalogo.filter((m) => m.uso !== 'hibrido').map((m) => m.nome.toLowerCase()))]
  const [destaque, ...demais] = catalogo

  return (
    <>
      <DadosEstruturados
        dados={{
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: EMPRESA.nome,
          slogan: EMPRESA.slogan,
          url: URL_SITE,
          logo: `${URL_SITE}/marca/egi-rental-vertical.png`,
          image: `${URL_SITE}/og.jpg`,
          telephone: CONTATO.telefones[0].tel,
          email: CONTATO.email,
          address: {
            '@type': 'PostalAddress',
            addressLocality: EMPRESA.cidade,
            addressRegion: EMPRESA.uf,
            addressCountry: 'BR',
          },
          areaServed: 'Maranhão',
          openingHours: 'Mo-Sa',
          sameAs: [CONTATO.instagram.url],
          parentOrganization: { '@type': 'Organization', name: EMPRESA.grupo },
          makesOffer: catalogo.map((m) => ({
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: `Locação de container ${m.nomeCompleto}` },
          })),
        }}
      />

      <ContainerAbrindo capitulos={capitulosDaAbertura(usos)}>
        <h1 id="hero-titulo">Containers para alugar em São Luís.</h1>
        <p className={estilos.heroTexto}>
          {juntar(usos).replace(/^./, (l) => l.toUpperCase())}, de {tamanhos[0]} a {tamanhos.at(-1)} pés.
          A gente leva até a sua obra, posiciona e busca no fim do contrato.
        </p>
        <div className={estilos.heroAcoes}>
          <BotaoLink href={linkWhatsApp(mensagemGeral())} variante="whatsapp" grande>
            Pedir orçamento
          </BotaoLink>
          <BotaoLink href="#tamanhos" variante="contorno-claro" grande>
            Comparar os tamanhos
          </BotaoLink>
        </div>
      </ContainerAbrindo>

      <section id="frota" className={estilos.secao} aria-labelledby="catalogo-titulo">
        <div className={estilos.interno}>
          <div className={estilos.cabeca}>
            <h2 id="catalogo-titulo" className={estilos.titulo}>
              O que tem na frota
            </h2>
            <p className={estilos.lead}>
              Cada modelo existe hoje na nossa frota. Disponibilidade muda conforme os contratos: confirmamos na
              conversa.
            </p>
            <Link href="/containers" className={estilos.linkSeco}>
              Catálogo completo <Icone nome="seta" tamanho={18} />
            </Link>
          </div>
          {destaque && <CartaoModelo modelo={destaque} prioridade destaque />}
          <ul className={estilos.gradeModelos}>
            {demais.map((modelo) => (
              <li key={modelo.slug}>
                <CartaoModelo modelo={modelo} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="tamanhos" className={`${estilos.secao} ${estilos.secaoPapel}`} aria-labelledby="tamanhos-titulo">
        <div className={estilos.interno}>
          <div className={estilos.cabeca}>
            <h2 id="tamanhos-titulo" className={estilos.titulo}>
              Qual tamanho cabe no seu terreno?
            </h2>
            <p className={estilos.lead}>
              Troque o tamanho, o uso e quantos containers vão lado a lado: o desenho está em escala, ao lado de uma pessoa de 1,75 m.
            </p>
          </div>
          <ComparadorTamanhos
            modelos={catalogo.map((m) => ({
              slug: m.slug,
              nome: m.nome,
              nomeCompleto: m.nomeCompleto,
              uso: m.uso,
              tamanho: m.tamanho,
            }))}
          />
        </div>
      </section>

      <section className={`${estilos.secao} ${estilos.secaoEscura}`} aria-labelledby="numeros-titulo">
        <div className={estilos.interno}>
          <div className={estilos.cabeca}>
            <h2 id="numeros-titulo" className={estilos.titulo}>
              Por que container, e não obra?
            </h2>
            <p className={`${estilos.lead} ${estilos.leadClaro}`}>
              Quem troca a construção no local por módulos prontos ganha prazo e gera menos entulho. Os números do
              setor, com as fontes.
            </p>
          </div>
          <NumerosModular />
        </div>
      </section>

      <FaixaSobMedida />

      <section id="aplicacoes" className={estilos.secao} aria-labelledby="aplicacoes-titulo">
        <div className={estilos.interno}>
          <div className={estilos.cabeca}>
            <h2 id="aplicacoes-titulo" className={estilos.titulo}>
              Onde eles trabalham
            </h2>
          </div>
          <ListaAplicacoes aplicacoes={APLICACOES} />
        </div>
      </section>

      <section id="passos" className={`${estilos.secao} ${estilos.secaoPapel}`} aria-labelledby="passos-titulo">
        <div className={estilos.interno}>
          <div className={estilos.cabeca}>
            <h2 id="passos-titulo" className={estilos.titulo}>
              Do pedido à retirada
            </h2>
          </div>
          <Rota passos={PASSOS} />
        </div>
      </section>

      <section id="quem-somos" className={`${estilos.secao} ${estilos.secaoEscura}`} aria-labelledby="quem-somos-titulo">
        <div className={`${estilos.interno} ${estilos.quemSomos}`}>
          <div className={estilos.quemSomosLado}>
            <div className={estilos.quemSomosFoto}>
              <Image
                src="/fotos/qualidade-solda.jpg"
                alt="Soldador trabalhando numa estrutura metálica"
                fill
                sizes="(min-width: 960px) 45vw, 100vw"
              />
            </div>
          </div>
          <div>
            <h2 id="quem-somos-titulo" className={estilos.titulo}>
              Do mesmo grupo da {EMPRESA.irma.nome}
            </h2>
            <div className={estilos.quemSomosTexto}>
              <p>
                A {EMPRESA.nome} é do {EMPRESA.grupo}, ao lado da{' '}
                <a href={EMPRESA.irma.url} target="_blank" rel="noopener">
                  {EMPRESA.irma.nome}
                </a>
                , que constrói e administra imóveis no Maranhão. Os containers saem da mesma cultura de obra:
                inspecionados e adaptados antes de chegar ao cliente.
              </p>
              <p>Você fala direto com quem decide, sem intermediário.</p>
            </div>
            <h3 className={estilos.inclusoTitulo}>O que vem com a locação</h3>
            <dl className={estilos.incluso}>
              {INCLUSO.map((d) => (
                <div key={d.titulo}>
                  <dt>{d.titulo}</dt>
                  <dd>{d.texto}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className={estilos.secao} aria-labelledby="contato-titulo">
        <div className={`${estilos.interno} ${estilos.fechamento}`}>
          <div>
            <h2 id="contato-titulo" className={estilos.titulo}>
              Conta pra gente o que você precisa.
            </h2>
            <p className={estilos.lead}>{CONTATO.horario}. Pelo WhatsApp a resposta é mais rápida.</p>
          </div>
          <div className={estilos.canais}>
            <a className={`${estilos.canal} ${estilos.canalDestaque}`} href={linkWhatsApp(mensagemGeral())} target="_blank" rel="noopener">
              <IconeWhatsApp tamanho={26} />
              <span>
                <small>WhatsApp</small>
                {CONTATO.telefones[0].rotulo}
              </span>
            </a>
            <a className={estilos.canal} href={`tel:${CONTATO.telefones[1].tel}`}>
              <Icone nome="telefone" tamanho={24} />
              <span>
                <small>Telefone</small>
                {CONTATO.telefones[1].rotulo}
              </span>
            </a>
            <a className={estilos.canal} href={`mailto:${CONTATO.email}`}>
              <Icone nome="email" tamanho={24} />
              <span>
                <small>E-mail</small>
                {CONTATO.email}
              </span>
            </a>
            <Link className={estilos.canal} href="/contato#orcamento">
              <Icone nome="seta" tamanho={24} />
              <span>
                <small>Formulário</small>
                Orçamento detalhado
              </span>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
