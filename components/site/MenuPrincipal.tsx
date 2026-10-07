'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { itemAtivo, NAVEGACAO } from '@/lib/navegacao'
import { Icone } from './Icone'
import estilos from './MenuPrincipal.module.css'

export function MenuPrincipal() {
  const caminho = usePathname()
  const [aberto, setAberto] = useState(false)
  const [caminhoDoMenu, setCaminhoDoMenu] = useState(caminho)

  // Trocar de página fecha o menu do celular.
  if (caminho !== caminhoDoMenu) {
    setCaminhoDoMenu(caminho)
    setAberto(false)
  }

  useEffect(() => {
    if (!aberto) return
    const fecharNoEsc = (e: KeyboardEvent) => e.key === 'Escape' && setAberto(false)
    document.addEventListener('keydown', fecharNoEsc)
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', fecharNoEsc)
      document.documentElement.style.overflow = ''
    }
  }, [aberto])

  return (
    <>
      <nav className={estilos.desktop} aria-label="Principal">
        <ul>
          {NAVEGACAO.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={estilos.link}
                aria-current={itemAtivo(caminho, item.href) ? 'page' : undefined}
              >
                {item.rotulo}
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/contato#orcamento" className={estilos.cta}>
          Pedir orçamento
        </Link>
      </nav>

      <button
        type="button"
        className={estilos.botaoMenu}
        aria-expanded={aberto}
        aria-controls="menu-celular"
        onClick={() => setAberto((a) => !a)}
      >
        <Icone nome={aberto ? 'fechar' : 'menu'} tamanho={24} />
        <span className="sr-only">{aberto ? 'Fechar menu' : 'Abrir menu'}</span>
      </button>

      <div id="menu-celular" className={estilos.painel} data-aberto={aberto} hidden={!aberto}>
        <nav aria-label="Principal">
          <ul>
            {NAVEGACAO.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={estilos.linkCelular}
                  aria-current={itemAtivo(caminho, item.href) ? 'page' : undefined}
                  onClick={() => setAberto(false)}
                >
                  {item.rotulo}
                  <Icone nome="seta" />
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/contato#orcamento" className={estilos.ctaCelular} onClick={() => setAberto(false)}>
            Pedir orçamento
          </Link>
        </nav>
      </div>
    </>
  )
}
