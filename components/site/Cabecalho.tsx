import Image from 'next/image'
import Link from 'next/link'
import { CabecalhoRolagem } from './CabecalhoRolagem'
import { MenuPrincipal } from './MenuPrincipal'
import estilos from './Cabecalho.module.css'

export function Cabecalho() {
  return (
    <CabecalhoRolagem className={estilos.cabecalho}>
      <div className={estilos.interno}>
        <Link href="/" className={estilos.marca} aria-label="EGI Rental — página inicial">
          <Image src="/marca/egi-rental-horizontal.png" alt="" width={470} height={214} priority />
        </Link>
        <MenuPrincipal />
      </div>
    </CabecalhoRolagem>
  )
}
