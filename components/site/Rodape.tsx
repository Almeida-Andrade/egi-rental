import Image from 'next/image'
import Link from 'next/link'
import { buscarCatalogo } from '@/lib/dados/catalogo'
import { NAVEGACAO } from '@/lib/navegacao'
import { AVISO_ILUSTRATIVO, CONTATO, EMPRESA } from '@/lib/site'
import { linkWhatsApp, mensagemGeral } from '@/lib/whatsapp'
import { Icone, IconeWhatsApp } from './Icone'
import estilos from './Rodape.module.css'

export async function Rodape() {
  const catalogo = await buscarCatalogo()
  const ano = new Date().getFullYear()

  return (
    <footer className={estilos.rodape}>
      <div className={estilos.interno}>
        <div className={estilos.marca}>
          <Image src="/marca/egi-rental-vertical-branca.png" alt="EGI Rental" width={218} height={376} />
          <p>
            {EMPRESA.slogan}. Uma empresa do {EMPRESA.grupo}, ao lado da{' '}
            <a href={EMPRESA.irma.url} target="_blank" rel="noopener">
              {EMPRESA.irma.nome}
            </a>
            .
          </p>
        </div>

        <nav className={estilos.coluna} aria-label="Containers">
          <h2>Containers</h2>
          <ul>
            {catalogo.map((m) => (
              <li key={m.slug}>
                <Link href={`/containers/${m.slug}`}>{m.nomeCompleto}</Link>
              </li>
            ))}
            <li>
              <Link href="/sob-medida">Sob medida</Link>
            </li>
          </ul>
        </nav>

        <nav className={estilos.coluna} aria-label="Site">
          <h2>Site</h2>
          <ul>
            <li>
              <Link href="/">Início</Link>
            </li>
            {NAVEGACAO.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.rotulo}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={estilos.coluna}>
          <h2>Fale com a gente</h2>
          <ul className={estilos.contatos}>
            <li>
              <a href={linkWhatsApp(mensagemGeral())} target="_blank" rel="noopener">
                <IconeWhatsApp /> {CONTATO.telefones[0].rotulo}
              </a>
            </li>
            {CONTATO.telefones.map((t) => (
              <li key={t.tel}>
                <a href={`tel:${t.tel}`}>
                  <Icone nome="telefone" /> {t.rotulo}
                </a>
              </li>
            ))}
            <li>
              <a href={`mailto:${CONTATO.email}`}>
                <Icone nome="email" /> {CONTATO.email}
              </a>
            </li>
            <li>
              <a href={CONTATO.instagram.url} target="_blank" rel="noopener">
                <Icone nome="instagram" /> {CONTATO.instagram.usuario}
              </a>
            </li>
            <li className={estilos.horario}>
              <Icone nome="relogio" /> {CONTATO.horario}
            </li>
          </ul>
        </div>
      </div>

      <div className={estilos.base}>
        <p>
          © {ano} {EMPRESA.nome} · {EMPRESA.cidade} — {EMPRESA.uf}
        </p>
        <p>
          <Link href="/creditos">Créditos das imagens</Link>
        </p>
      </div>
      <p className={estilos.aviso}>{AVISO_ILUSTRATIVO.completo}</p>
    </footer>
  )
}
