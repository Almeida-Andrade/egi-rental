'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import type { Capitulo } from '@/lib/conteudo'
import { quadrosLentos } from '@/lib/desempenho'
import { lerNivelDoAparelho } from './nivelDoAparelho'
import { Icone } from './Icone'
import estilos from './ContainerAbrindo.module.css'

// A linha do tempo vai de 0 a 1000 e acompanha a rolagem do trilho inteiro: as portas destravam e
// abrem, a câmera entra e o fundo do container mostra um capítulo de cada vez. O último ganha a
// sobra do fim, senão ele aparecia quando a seção já saía da tela.
const INICIO_CAPITULOS = 480
const FIM = 1000
const SOBRA_DO_ULTIMO = 110

function inicioDoCapitulo(i: number, total: number): number {
  return INICIO_CAPITULOS + (i * (FIM - INICIO_CAPITULOS - SOBRA_DO_ULTIMO)) / total
}

function Folha({ lado, codigo }: { lado: 'esquerda' | 'direita'; codigo: string }) {
  return (
    <div
      className={`${estilos.plano} ${estilos.folha} ${lado === 'esquerda' ? estilos.folhaEsquerda : estilos.folhaDireita}`}
      data-a="folha"
    >
      <span className={`${estilos.codigo} marcacao`} data-a="externo">
        {codigo}
      </span>
      <span className={estilos.haste} data-a="externo">
        <i className={estilos.manopla} data-a="manopla" />
      </span>
    </div>
  )
}

interface Props {
  capitulos: Capitulo[]
  // O título da home, os botões e a frase de abertura, renderizados no servidor
  children: React.ReactNode
}

export function ContainerAbrindo({ capitulos, children }: Props) {
  const trilho = useRef<HTMLElement>(null)
  const palco = useRef<HTMLDivElement>(null)
  const [atual, setAtual] = useState(-1)
  // As fotos do fundo ficam escondidas (opacidade 0, dentro do 3D) e o carregamento preguiçoso não
  // as busca a tempo: com a animação pronta, todas passam a carregar.
  const [fotosJa, setFotosJa] = useState(false)

  useEffect(() => {
    const raiz = trilho.current
    const cena = palco.current
    if (!raiz || !cena) return
    let cancelado = false
    let desfazer = () => {}

    import('animejs').then(({ createScope, createTimeline, onScroll }) => {
      if (cancelado) return
      // O trilho só fica alto quando a animação existe: sem JS, a abertura é uma tela só.
      raiz.dataset.viva = ''
      setFotosJa(true)
      if (lerNivelDoAparelho() === 'leve') raiz.dataset.leve = ''
      const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const $ = (seletor: string) => [...raiz.querySelectorAll<HTMLElement>(`[data-a="${seletor}"]`)]
      const fotos = $('foto')
      const cartoes = $('capitulo')
      const [caixa] = $('caixa')
      const [breu] = $('breu')
      const [folhaEsquerda, folhaDireita] = $('folha')
      const externos = $('externo')
      const manoplas = $('manopla')

      // A linha do tempo anima só estes números; desenhar() escreve transform e opacidade direto
      // nas poucas peças que mudam. Variável CSS animada no palco recalculava o estilo da cena
      // inteira a cada quadro.
      const e = { giro: -30, incl: 9, avanco: -0.8, porta: 0, trava: 0, luz: 0 }
      const escrito = new Map<HTMLElement, string>()
      const escrever = (el: HTMLElement | undefined, prop: 'transform' | 'opacity', valor: string) => {
        if (!el || escrito.get(el) === prop + valor) return
        escrito.set(el, prop + valor)
        el.style[prop] = valor
      }
      const desenhar = () => {
        escrever(caixa, 'transform', `translateZ(calc(var(--alto) * ${e.avanco.toFixed(4)})) rotateX(${(-e.incl).toFixed(2)}deg) rotateY(${e.giro.toFixed(2)}deg)`)
        escrever(folhaEsquerda, 'transform', `translateZ(1px) rotateY(${(-e.porta).toFixed(2)}deg)`)
        escrever(folhaDireita, 'transform', `translateZ(1px) rotateY(${e.porta.toFixed(2)}deg)`)
        escrever(breu, 'opacity', (1 - e.luz).toFixed(3))
        // Com a câmera de lado, o avesso da folha aparece antes dos 90°: a pintura some entre 60° e 80°
        const externo = Math.min(1, Math.max(0, (80 - e.porta) / 20)).toFixed(3)
        for (const el of externos) escrever(el, 'opacity', externo)
        for (const el of manoplas) {
          escrever(el, 'transform', `translateX(-50%) rotate(${(-78 * e.trava).toFixed(1)}deg)`)
          escrever(el.parentElement ?? undefined, 'transform', `translateY(calc(var(--alto) * ${(-0.012 * e.trava).toFixed(4)}))`)
        }
      }

      // Aparelho que não acompanha passa para o modo leve no meio do caminho.
      let anterior = 0
      const intervalos: number[] = []
      const medir = () => {
        if (raiz.dataset.leve !== undefined) return
        const agora = performance.now()
        if (anterior && agora - anterior < 250) intervalos.push(agora - anterior)
        anterior = agora
        if (intervalos.length > 90) intervalos.shift()
        if (quadrosLentos(intervalos)) raiz.dataset.leve = ''
      }

      const escopo = createScope({ root: raiz }).add(() => {
        const linha = createTimeline({
          defaults: { ease: 'linear' },
          // Com movimento reduzido a imagem segue a rolagem sem inércia; o resto é igual.
          autoplay: onScroll({ target: raiz, enter: 'top top', leave: 'bottom bottom', sync: reduzido ? true : 0.5 }),
          onRender: () => {
            desenhar()
            medir()
          },
          onUpdate: (self) => {
            const t = self.progress * FIM
            let indice = -1
            for (let i = 0; i < capitulos.length; i++) if (t >= inicioDoCapitulo(i, capitulos.length) - 10) indice = i
            // -1: a abertura ainda está na tela; -2: entre as portas e o primeiro capítulo
            setAtual(t < 120 ? -1 : indice === -1 ? -2 : indice)
          },
        })

        linha
          .add($('dica'), { opacity: [1, 0], duration: 60 }, 0)
          .add($('hero'), { opacity: [1, 0], y: [0, -60], duration: 150, ease: 'inQuad' }, 30)
          .add(e, { giro: [-30, 0], incl: [9, 0], duration: 480, ease: 'inOutSine' }, 0)
          .add(e, { trava: [0, 1], duration: 110, ease: 'inOutQuad' }, 40)
          .add(e, { porta: [0, 252], duration: 340, ease: 'inOutSine' }, 140)
          .add(e, { luz: [0, 1], duration: 170, ease: 'outQuad' }, 180)
          // Encostadas nas laterais, as folhas saem de cena quando a câmera passa por elas
          .add($('folha'), { opacity: [1, 0], duration: 80 }, 370)
          // A câmera sai do pátio, com o container inteiro à vista, e termina lá dentro
          .add(e, { avanco: [-0.8, 0.88], duration: 530, ease: 'inOutSine' }, 0)
          .add(e, { avanco: [0.88, 0.98], duration: FIM - 530 }, 530)
          .add($('barra'), { scaleX: [0, 1], duration: FIM }, 0)

        capitulos.forEach((_, i) => {
          const inicio = inicioDoCapitulo(i, capitulos.length)
          const fim = inicioDoCapitulo(i + 1, capitulos.length)
          // A primeira foto acende enquanto a câmera entra; as outras cobrem a anterior junto com o texto.
          linha.add(fotos[i], { opacity: [0, 1], duration: i === 0 ? 120 : 40 }, i === 0 ? 360 : inicio - 10)
          linha.add(cartoes[i], { opacity: [0, 1], y: [40, 0], duration: 45, ease: 'outQuad' }, inicio)
          if (i < capitulos.length - 1)
            linha.add(cartoes[i], { opacity: [1, 0], y: [0, -30], duration: 30, ease: 'inQuad' }, fim - 35)
        })
      })

      desfazer = () => {
        escopo.revert()
        for (const el of escrito.keys()) el.removeAttribute('style')
        delete raiz.dataset.viva
        delete raiz.dataset.leve
      }
    })

    return () => {
      cancelado = true
      desfazer()
    }
  }, [capitulos])

  const irPara = (i: number) => {
    const raiz = trilho.current
    if (!raiz) return
    const topo = raiz.getBoundingClientRect().top + window.scrollY
    const percurso = raiz.offsetHeight - window.innerHeight
    const alvo = (inicioDoCapitulo(i, capitulos.length) + 50) / FIM
    const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: topo + percurso * alvo, behavior: reduzido ? 'auto' : 'smooth' })
  }

  return (
    <section ref={trilho} className={estilos.trilho} aria-labelledby="hero-titulo">
      <div ref={palco} className={estilos.palco}>
        <div className={estilos.chao} aria-hidden="true" />

        <div className={estilos.tunel} aria-hidden="true">
          <div className={estilos.caixa} data-a="caixa">
            <div className={`${estilos.plano} ${estilos.sombra}`} />
            <div className={`${estilos.plano} ${estilos.piso}`} />
            <div className={`${estilos.plano} ${estilos.teto}`} />
            <div className={`${estilos.plano} ${estilos.parede} ${estilos.paredeEsquerda}`} />
            <div className={`${estilos.plano} ${estilos.parede} ${estilos.paredeDireita}`} />
            <div className={`${estilos.plano} ${estilos.parede} ${estilos.fundo}`}>
              <div className={estilos.tela}>
                {capitulos.map((c) => (
                  <div key={c.href} className={estilos.foto} data-a="foto">
                    <Image src={c.foto.src} alt="" fill sizes="(min-width: 760px) 45vw, 80vw" loading={fotosJa ? 'eager' : 'lazy'} />
                  </div>
                ))}
              </div>
            </div>
            <div className={`${estilos.plano} ${estilos.breu}`} data-a="breu" />
            <div className={`${estilos.plano} ${estilos.moldura}`} />
            <Folha lado="esquerda" codigo="EGI" />
            <Folha lado="direita" codigo="RENTAL" />
          </div>
        </div>

        <div className={estilos.coluna}>
          <div className={estilos.hero} data-a="hero" inert={atual !== -1}>
            {children}
          </div>
          {capitulos.map((c, i) => (
            <article key={c.href} className={estilos.capitulo} data-a="capitulo" inert={atual !== i} aria-hidden={atual !== i}>
              <p className={estilos.rotulo}>
                <span className="marcacao">{String(i + 1).padStart(2, '0')}</span> {c.rotulo}
              </p>
              <h2 className={estilos.titulo}>{c.titulo}</h2>
              <p className={estilos.texto}>{c.texto}</p>
              <Link className={estilos.acao} href={c.href}>
                {c.acao} <Icone nome="seta" tamanho={18} />
              </Link>
            </article>
          ))}
        </div>

        <p className={estilos.dica} data-a="dica" aria-hidden="true">
          Role para abrir
          <span />
        </p>

        <nav className={estilos.regua} aria-label="Capítulos da abertura">
          <ol>
            {capitulos.map((c, i) => (
              <li key={c.href}>
                <button type="button" aria-current={atual === i ? 'step' : undefined} onClick={() => irPara(i)}>
                  <span className="marcacao">{String(i + 1).padStart(2, '0')}</span>
                  <small>{c.rotulo}</small>
                </button>
              </li>
            ))}
          </ol>
          <span className={estilos.reguaTrilha}>
            <span className={estilos.reguaBarra} data-a="barra" />
          </span>
        </nav>
      </div>
    </section>
  )
}
