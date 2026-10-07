import Image from 'next/image'
import Link from 'next/link'
import { BotaoLink } from '@/components/site/Botao'
import { CartaoModelo } from '@/components/site/CartaoModelo'
import { DadosEstruturados } from '@/components/site/DadosEstruturados'
import { FaixaSobMedida } from '@/components/site/FaixaSobMedida'
import { Icone, IconeWhatsApp, type NomeIcone } from '@/components/site/Icone'
import { TituloSecao } from '@/components/site/TituloSecao'
import { tamanhosDoCatalogo } from '@/lib/catalogo'
import { APLICACOES, DIFERENCIAIS, PASSOS } from '@/lib/conteudo'
import { buscarCatalogo } from '@/lib/dados/catalogo'
import { CONTATO, EMPRESA, URL_SITE } from '@/lib/site'
import { linkWhatsApp, mensagemGeral } from '@/lib/whatsapp'
import estilos from './page.module.css'

export const revalidate = 3600

const ICONES_DIFERENCIAIS: NomeIcone[] = ['escudo', 'ferramenta', 'caminhao', 'calendario', 'aperto', 'moeda']

function listaDeTamanhos(tamanhos: number[]): string {
  if (tamanhos.length <= 1) return `${tamanhos[0] ?? 20} pés`
  return `${tamanhos.slice(0, -1).join(', ')} e ${tamanhos.at(-1)} pés`
}

export default async function Inicio() {
  const catalogo = await buscarCatalogo()
  const tamanhos = tamanhosDoCatalogo(catalogo)

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

      {/* Abertura */}
      <section className={estilos.hero} aria-labelledby="hero-titulo">
        <Image
          className={estilos.heroFoto}
          src="/fotos/capa-container-escuro.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
        />
        <div className={estilos.heroInterno}>
          <p className={estilos.heroKicker}>Locação de containers · {EMPRESA.cidade} — {EMPRESA.uf}</p>
          <h1 id="hero-titulo" className={estilos.heroTitulo}>
            O espaço que a sua obra precisa, <em>entregue pronto.</em>
          </h1>
          <p className={estilos.heroTexto}>
            Containers para escritório, almoxarifado, sanitário e stand em locação de curto, médio e longo
            prazo, com entrega e retirada no local. E, quando o catálogo não basta, montamos sob medida.
          </p>
          <div className={estilos.heroAcoes}>
            <BotaoLink href="/containers" variante="claro" grande seta>
              Ver os containers
            </BotaoLink>
            <BotaoLink href={linkWhatsApp(mensagemGeral())} variante="whatsapp" grande>
              Pedir orçamento
            </BotaoLink>
          </div>
        </div>
        <ul className={estilos.heroFatos}>
          <li>
            <Icone nome="calendario" /> Curto, médio e longo prazo
          </li>
          <li>
            <Icone nome="caminhao" /> Entrega e retirada no local
          </li>
          <li>
            <Icone nome="regua" /> Modelos de {listaDeTamanhos(tamanhos)}
          </li>
          <li>
            <Icone nome="ferramenta" /> Projetos sob medida
          </li>
        </ul>
      </section>

      {/* Catálogo */}
      <section className={estilos.secao} aria-labelledby="catalogo-titulo">
        <div className={estilos.interno}>
          <div className={estilos.cabecaComAcao}>
            <TituloSecao
              id="catalogo-titulo"
              kicker="Nossos containers"
              titulo="Um container para cada etapa do projeto"
              texto="Modelos da nossa frota, prontos para locação. Escolha pelo uso e fale com a gente para confirmar a disponibilidade."
            />
            <BotaoLink href="/containers" variante="secundario" seta>
              Ver catálogo completo
            </BotaoLink>
          </div>
          <ul className={estilos.gradeModelos}>
            {catalogo.slice(0, 6).map((modelo, i) => (
              <li key={modelo.slug} className="revelar">
                <CartaoModelo modelo={modelo} prioridade={i < 3} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <FaixaSobMedida />

      {/* Aplicações */}
      <section id="aplicacoes" className={`${estilos.secao} ${estilos.secaoPapel}`} aria-labelledby="aplicacoes-titulo">
        <div className={estilos.interno}>
          <TituloSecao
            id="aplicacoes-titulo"
            kicker="Aplicações"
            titulo="Onde os nossos containers trabalham"
            texto="Da frente de obra ao evento de fim de semana: estrutura rápida, segura e sem construção."
          />
          <ul className={estilos.gradeAplicacoes}>
            {APLICACOES.map((a, i) => (
              <li key={a.titulo} className={`${estilos.aplicacao} ${i === 0 ? estilos.aplicacaoDestaque : ''} revelar`}>
                <Image src={a.foto.src} alt={a.foto.alt} fill sizes="(min-width: 960px) 40vw, 100vw" />
                <div className={estilos.aplicacaoTexto}>
                  <h3>{a.titulo}</h3>
                  <p>{a.texto}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Como funciona */}
      <section className={estilos.secao} aria-labelledby="passos-titulo">
        <div className={estilos.interno}>
          <TituloSecao id="passos-titulo" kicker="Como funciona" titulo="Do pedido à retirada, sem complicação" centro />
          <ol className={estilos.passos}>
            {PASSOS.map((p, i) => (
              <li key={p.titulo} className="revelar">
                <span className={estilos.passoNumero}>{String(i + 1).padStart(2, '0')}</span>
                <h3>{p.titulo}</h3>
                <p>{p.texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Quem somos */}
      <section id="quem-somos" className={`${estilos.secao} ${estilos.secaoEscura}`} aria-labelledby="quem-somos-titulo">
        <div className={`${estilos.interno} ${estilos.quemSomos}`}>
          <div className={`${estilos.quemSomosFoto} revelar`}>
            <Image
              src="/fotos/qualidade-solda.jpg"
              alt="Soldador trabalhando numa estrutura metálica"
              fill
              sizes="(min-width: 960px) 45vw, 100vw"
            />
          </div>
          <div>
            <TituloSecao
              id="quem-somos-titulo"
              kicker="Quem somos"
              titulo="Engenharia de grupo, atendimento de perto"
              claro
            />
            <div className={estilos.quemSomosTexto}>
              <p>
                A {EMPRESA.nome} faz parte do {EMPRESA.grupo}, ao lado da{' '}
                <a href={EMPRESA.irma.url} target="_blank" rel="noopener">
                  {EMPRESA.irma.nome}
                </a>
                , referência em engenharia, infraestrutura e construção civil no Maranhão.
              </p>
              <p>
                Com foco em inovação e eficiência, oferecemos containers e estruturas modulares para
                diferentes finalidades: de canteiros de obra e escritórios móveis a eventos e armazenagem
                temporária.
              </p>
              <p>
                Cada container passa por inspeção e adaptação antes de chegar ao cliente, para entregar
                segurança, funcionalidade e conforto no uso de todo dia.
              </p>
            </div>
            <ul className={estilos.diferenciais}>
              {DIFERENCIAIS.map((d, i) => (
                <li key={d.titulo}>
                  <span className={estilos.diferencialIcone}>
                    <Icone nome={ICONES_DIFERENCIAIS[i] ?? 'check'} />
                  </span>
                  <div>
                    <h3>{d.titulo}</h3>
                    <p>{d.texto}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Contato */}
      <section className={estilos.secao} aria-labelledby="contato-titulo">
        <div className={`${estilos.interno} ${estilos.fechamento}`}>
          <TituloSecao
            id="contato-titulo"
            kicker="Fale com a gente"
            titulo="Conte o que você precisa. A gente responde rápido."
            texto={CONTATO.horario + '.'}
          />
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
                Pedir orçamento detalhado
              </span>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
