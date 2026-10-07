import Link from 'next/link'
import { CabecalhoRolagem } from './CabecalhoRolagem'
import { Marca } from './Marca'
import { MenuPrincipal } from './MenuPrincipal'
import estilos from './Cabecalho.module.css'

export function Cabecalho() {
  return (
    <CabecalhoRolagem className={estilos.cabecalho}>
      <div className={estilos.interno}>
        <Link href="/" className={estilos.marca} aria-label="EGI Rental — página inicial">
          <Marca />
        </Link>
        <MenuPrincipal />
      </div>
    </CabecalhoRolagem>
  )
}
