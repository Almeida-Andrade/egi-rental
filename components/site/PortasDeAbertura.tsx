'use client'

import estilos from './PortasDeAbertura.module.css'

export function PortasDeAbertura() {
  const marcarVistas = () => {
    document.documentElement.dataset.portas = 'vistas'
    try {
      sessionStorage.setItem('egi-portas', '1')
    } catch {}
  }

  return (
    <div
      className={estilos.portas}
      aria-hidden="true"
      onAnimationEnd={(e) => e.target === e.currentTarget && marcarVistas()}
    >
      <div className={`${estilos.folha} ${estilos.esquerda}`}>
        <span className={`${estilos.codigo} marcacao`}>EGI</span>
        <span className={estilos.trava} />
        <span className={estilos.trava} />
      </div>
      <div className={`${estilos.folha} ${estilos.direita}`}>
        <span className={`${estilos.codigo} marcacao`}>RENTAL</span>
        <span className={estilos.trava} />
        <span className={estilos.trava} />
      </div>
    </div>
  )
}
