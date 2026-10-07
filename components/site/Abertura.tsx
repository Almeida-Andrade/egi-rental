import { PortasDeAbertura } from './PortasDeAbertura'

// Roda antes da primeira pintura: quem já viu as portas nesta visita não as vê de novo.
const JA_VIU = `try{if(sessionStorage.getItem('egi-portas'))document.documentElement.dataset.portas='vistas'}catch(e){}`

export function Abertura() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: JA_VIU }} />
      <PortasDeAbertura />
    </>
  )
}
