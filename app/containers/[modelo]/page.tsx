import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ViewTransition } from 'react'
import { BotaoLink } from '@/components/site/Botao'
import { CartaoModelo } from '@/components/site/CartaoModelo'
import { DadosEstruturados } from '@/components/site/DadosEstruturados'
import { FaixaSobMedida } from '@/components/site/FaixaSobMedida'
import { Icone } from '@/components/site/Icone'
import { PlantaDoContainer } from '@/components/site/PlantaDoContainer'
import { AvisoIlustrativo } from '@/components/site/AvisoIlustrativo'
import { TituloSecao } from '@/components/site/TituloSecao'
import { modeloPorSlug, outrosModelos } from '@/lib/catalogo'
import { buscarCatalogo } from '@/lib/dados/catalogo'
import { ROTULO_FABRICACAO, type Uso } from '@/lib/modelos'
import { plantaDe } from '@/lib/plantas'
import { URL_SITE } from '@/lib/site'
import { linkWhatsApp, mensagemDoModelo } from '@/lib/whatsapp'
import estilos from './page.module.css'

export const revalidate = 3600

type Parametros = { params: Promise<{ modelo: string }> }

// De qual ponto de partida o montador 3D abre, a partir do uso do modelo.
const PARTIDA_DO_USO: Partial<Record<Uso, string>> = {
  escritorio: 'escritorio',
  hibrido: 'escritorio',
  wc: 'banheiro',
  stand: 'loja',
}

export async function generateStaticParams() {
  const catalogo = await buscarCatalogo()
  return catalogo.map((m) => ({ modelo: m.slug }))
}

export async function generateMetadata({ params }: Parametros): Promise<Metadata> {
  const { modelo: slug } = await params
  const modelo = modeloPorSlug(await buscarCatalogo(), slug)
  if (!modelo) return {}
  const titulo = `Container ${modelo.nomeCompleto} para locação`
  const descricao = `${modelo.resumo} Área interna de cerca de ${modelo.medidas.areaM2.toLocaleString('pt-BR')} m². Locação em São Luís com entrega e retirada.`
  return {
    title: titulo,
    description: descricao,
    alternates: { canonical: `/containers/${modelo.slug}` },
    openGraph: {
      type: 'article',
      url: `/containers/${modelo.slug}`,
      title: titulo,
      description: descricao,
      images: [{ url: modelo.capa.src, alt: modelo.capa.alt }],
    },
  }
}

export default async function FichaModelo({ params }: Parametros) {
  const { modelo: slug } = await params
  const catalogo = await buscarCatalogo()
  const modelo = modeloPorSlug(catalogo, slug)
  if (!modelo) notFound()

  const fotos = [modelo.capa, ...modelo.galeria]
  const outros = outrosModelos(catalogo, modelo)
  const linkPedido = linkWhatsApp(mensagemDoModelo(modelo.nomeCompleto))
  const planta = plantaDe(modelo.uso, modelo.tamanho)

  return (
    <>
      <DadosEstruturados
        dados={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Início', item: URL_SITE },
            { '@type': 'ListItem', position: 2, name: 'Containers', item: `${URL_SITE}/containers` },
            { '@type': 'ListItem', position: 3, name: modelo.nomeCompleto, item: `${URL_SITE}/containers/${modelo.slug}` },
          ],
        }}
      />

      <div className={estilos.interno}>
        <nav aria-label="Você está em" className={estilos.trilha}>
          <ol>
            <li>
              <Link href="/">Início</Link>
            </li>
            <li>
              <Link href="/containers">Containers</Link>
            </li>
            <li aria-current="page">{modelo.nomeCompleto}</li>
          </ol>
        </nav>

        <div className={estilos.topo}>
          <div className={estilos.galeria} data-fotos={Math.min(fotos.length, 3)}>
            {fotos.slice(0, 3).map((foto, i) => {
              const imagem = (
                <Image
                  src={foto.src}
                  alt={foto.alt}
                  fill
                  priority={i === 0}
                  sizes={i === 0 ? '(min-width: 1080px) 700px, 100vw' : '(min-width: 1080px) 340px, 50vw'}
                />
              )
              return (
                <div key={foto.src} className={estilos.foto}>
                  {i === 0 ? (
                    <ViewTransition name={`foto-${modelo.slug}`} share="morph" default="none">
                      {imagem}
                    </ViewTransition>
                  ) : (
                    imagem
                  )}
                </div>
              )
            })}
          </div>

          <div className={estilos.info}>
            <h1 className={estilos.titulo}>
              {modelo.nome} <span className="marcacao">{modelo.tamanho}&apos;</span>
            </h1>
            <p className={estilos.resumo}>{modelo.resumo}</p>

            <dl className={estilos.ficha}>
              <div>
                <dt>Área interna</dt>
                <dd>≈ {modelo.medidas.areaM2.toLocaleString('pt-BR')} m²</dd>
              </div>
              <div>
                <dt>Tamanho</dt>
                <dd>{modelo.tamanho} pés</dd>
              </div>
              <div>
                <dt>Medidas externas</dt>
                <dd>{modelo.medidas.externa}</dd>
              </div>
              <div>
                <dt>Medidas internas</dt>
                <dd>{modelo.medidas.interna}</dd>
              </div>
              {modelo.fabricacoes.length > 0 && (
                <div className={estilos.fichaInteira}>
                  <dt>Tipo</dt>
                  <dd>{modelo.fabricacoes.map((f) => ROTULO_FABRICACAO[f]).join(' ou ')}</dd>
                </div>
              )}
            </dl>

            <div className={estilos.acoes}>
              <BotaoLink href={linkPedido} variante="whatsapp" grande>
                Pedir orçamento deste modelo
              </BotaoLink>
              <BotaoLink href={`/contato?modelo=${encodeURIComponent(modelo.nomeCompleto)}#orcamento`} variante="secundario" grande>
                Usar o formulário
              </BotaoLink>
            </div>
            <p className={estilos.nota}>
              <Icone nome="relogio" tamanho={16} /> Disponibilidade confirmada no atendimento. Fotos e medidas de
              referência, meramente ilustrativas: o container entregue pode variar.
            </p>
          </div>
        </div>
      </div>

      <section className={estilos.secao} aria-labelledby="detalhes-titulo">
        <div className={`${estilos.interno} ${estilos.detalhes}`}>
          <div>
            <TituloSecao id="detalhes-titulo" kicker="Sobre este container" titulo={`Para que serve o ${modelo.nome.toLowerCase()}`} />
            <div className={estilos.descricao}>
              {modelo.descricao.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
          <div className={estilos.listas}>
            <div>
              <h3>Indicado para</h3>
              <ul>
                {modelo.indicadoPara.map((item) => (
                  <li key={item}>
                    <Icone nome="check" tamanho={18} /> {item}
                  </li>
                ))}
              </ul>
            </div>
            {modelo.combinaveis.length > 0 && (
              <div>
                <h3>Dá para combinar no orçamento</h3>
                <ul>
                  {modelo.combinaveis.map((item) => (
                    <li key={item}>
                      <Icone nome="ferramenta" tamanho={18} /> {item}
                    </li>
                  ))}
                </ul>
                <p className={estilos.listaNota}>
                  Precisa de mais?{' '}
                  <Link href="/sob-medida">Veja o que fazemos sob medida</Link>.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className={`${estilos.secao} ${estilos.papel}`} aria-labelledby="planta-titulo">
        <div className={`${estilos.interno} ${estilos.plantaBloco}`}>
          <div>
            <TituloSecao
              id="planta-titulo"
              kicker="Exemplo de uso"
              titulo="Como ele pode ficar por dentro"
              texto={`${planta.legenda}. É um exemplo: o layout final é combinado no orçamento.`}
            />
            <div className={estilos.plantaAcoes}>
              <BotaoLink
                href={`/sob-medida/montar${PARTIDA_DO_USO[modelo.uso] ? `?partida=${PARTIDA_DO_USO[modelo.uso]}` : ''}`}
                variante="primario"
                seta
              >
                Montar o meu em 3D
              </BotaoLink>
            </div>
          </div>
          <div className={estilos.plantaDesenho}>
            <PlantaDoContainer planta={planta} rotulo={`Planta de exemplo do ${modelo.nomeCompleto}: ${planta.legenda}`} />
            <AvisoIlustrativo />
          </div>
        </div>
      </section>

      {outros.length > 0 && (
        <section className={`${estilos.secao} ${estilos.papel}`} aria-labelledby="outros-titulo">
          <div className={estilos.interno}>
            <TituloSecao id="outros-titulo" kicker="Veja também" titulo="Outros containers" />
            <ul className={estilos.gradeOutros}>
              {outros.map((m) => (
                <li key={m.slug}>
                  <CartaoModelo modelo={m} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <FaixaSobMedida />
    </>
  )
}
