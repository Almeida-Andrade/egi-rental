import type { Metadata } from 'next'
import { CabecaPagina } from '@/components/site/CabecaPagina'
import { CartaoModelo } from '@/components/site/CartaoModelo'
import { ComparadorTamanhos } from '@/components/site/ComparadorTamanhos'
import { FaixaSobMedida } from '@/components/site/FaixaSobMedida'
import { TituloSecao } from '@/components/site/TituloSecao'
import { tamanhosDoCatalogo } from '@/lib/catalogo'
import { buscarCatalogo } from '@/lib/dados/catalogo'
import { MEDIDAS } from '@/lib/modelos'
import { medidasJuntas, type Modulos } from '@/lib/medidas'
import { linkWhatsApp, mensagemGeral } from '@/lib/whatsapp'
import { BotaoLink } from '@/components/site/Botao'
import estilos from './page.module.css'

export const revalidate = 3600

const DESCRICAO =
  'Catálogo de containers para locação em São Luís: escritório, almoxarifado, sanitário, cozinha e stand, ' +
  'em 10 e 20 pés, sozinhos ou lado a lado, com entrega e retirada no local.'

export const metadata: Metadata = {
  title: 'Containers para locação',
  description: DESCRICAO,
  alternates: { canonical: '/containers' },
  openGraph: { url: '/containers', title: 'Containers para locação', description: DESCRICAO },
}

const USO_DO_TAMANHO: Record<number, string> = {
  10: 'Compacto: cabe em terreno apertado e resolve a armazenagem pequena.',
  20: 'O mais versátil: escritório, almoxarifado, sanitário ou copa para a equipe.',
}

const JUNTOS: { modulos: Modulos; uso: string }[] = [
  { modulos: 2, uso: 'Salão sem a parede do meio: loja, refeitório, sala de reunião ou escritório maior.' },
]

export default async function Containers() {
  const catalogo = await buscarCatalogo()
  const tamanhos = tamanhosDoCatalogo(catalogo)

  return (
    <>
      <CabecaPagina
        kicker="Catálogo"
        titulo="Containers para locação"
        texto="Modelos da nossa frota, prontos para trabalhar. A disponibilidade muda conforme os contratos: fale com a gente e confirmamos na hora."
        trilha={[{ href: '/containers', rotulo: 'Containers' }]}
      >
        <BotaoLink href={linkWhatsApp(mensagemGeral())} variante="whatsapp" grande>
          Consultar disponibilidade
        </BotaoLink>
      </CabecaPagina>

      <section className={estilos.secao} aria-labelledby="modelos-titulo">
        <div className={estilos.interno}>
          <h2 id="modelos-titulo" className="sr-only">
            Modelos
          </h2>
          <ul className={estilos.grade}>
            {catalogo.map((modelo, i) => (
              <li key={modelo.slug}>
                <CartaoModelo modelo={modelo} prioridade={i < 3} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={`${estilos.secao} ${estilos.papel}`} aria-labelledby="tamanhos-titulo">
        <div className={estilos.interno}>
          <TituloSecao
            id="tamanhos-titulo"
            kicker="Tamanhos"
            titulo="Qual tamanho escolher?"
            texto="Arraste as alças ou escolha o tamanho e quantos containers vão lado a lado: o desenho está em escala, ao lado de uma pessoa de 1,75 m."
          />
          <div className={estilos.comparador}>
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
          <details className={estilos.tabelaDetalhe}>
            <summary>Ver a tabela de medidas</summary>
            <p className={estilos.tabelaNota}>
              Medidas de referência do padrão marítimo. Lado a lado, as paredes do meio saem e o espaço vira um só.
              Container fabricado pode variar um pouco: confirmamos a medida exata no orçamento.
            </p>
            <div className={estilos.tabelaRolagem}>
              <table className={estilos.tabela}>
                <thead>
                  <tr>
                    <th scope="col">Tamanho</th>
                    <th scope="col">Área interna</th>
                    <th scope="col">Medidas externas (C × L × A)</th>
                    <th scope="col">Medidas internas (C × L × A)</th>
                    <th scope="col">Bom para</th>
                  </tr>
                </thead>
                <tbody>
                  {tamanhos.map((t) => (
                    <tr key={t}>
                      <th scope="row">{t} pés</th>
                      <td>≈ {MEDIDAS[t].areaM2.toLocaleString('pt-BR')} m²</td>
                      <td>{MEDIDAS[t].externa}</td>
                      <td>{MEDIDAS[t].interna}</td>
                      <td>{USO_DO_TAMANHO[t]}</td>
                    </tr>
                  ))}
                  {tamanhos.includes(20) &&
                    JUNTOS.map(({ modulos, uso }) => {
                      const m = medidasJuntas(20, modulos)
                      return (
                        <tr key={modulos}>
                          <th scope="row">{modulos} × 20 pés lado a lado</th>
                          <td>≈ {m.areaM2.toLocaleString('pt-BR')} m²</td>
                          <td>{m.externa}</td>
                          <td>{m.interna}</td>
                          <td>{uso}</td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          </details>
        </div>
      </section>

      <FaixaSobMedida />
    </>
  )
}
