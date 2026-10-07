'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { Component, useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import {
  adicionar,
  areaOcupada,
  codificar,
  conflitos,
  contagem,
  CORES_CHAPA,
  decodificar,
  descreverForma,
  duplicar,
  ehParede,
  ehTipoParede,
  girar,
  interno,
  limitarPiso,
  nomeDaPeca,
  PECAS_PAREDE,
  PECAS_PISO,
  PONTOS_DE_PARTIDA,
  projetoInicial,
  resumoDoProjeto,
  trocarForma,
  type CorChapa,
  type Forma,
  type GrupoPeca,
  type Item,
  type PontoDePartida,
  type Projeto,
  type TipoPeca,
} from '@/lib/montador'
import { metros, MODULOS, TAMANHOS, type Modulos } from '@/lib/medidas'
import { linkWhatsApp } from '@/lib/whatsapp'
import { Icone, IconeWhatsApp } from '@/components/site/Icone'
import type { Vista } from './Cena'
import estilos from './Montador.module.css'

// O three.js só baixa nesta página, só no navegador e só quando a pessoa pede o 3D: abrir com ele
// custava cerca de 1,2 s de processamento no celular antes de qualquer toque.
const importarCena = () => import('./Cena')
const Cena = dynamic(importarCena, {
  ssr: false,
  loading: () => <div className={estilos.carregando}>Montando o container…</div>,
})

type Acao =
  | { tipo: 'trocar'; projeto: Projeto }
  | { tipo: 'mover'; item: Item }
  | { tipo: 'remover'; id: string }

function reduzir(projeto: Projeto, acao: Acao): Projeto {
  switch (acao.tipo) {
    case 'trocar':
      return acao.projeto
    case 'mover':
      return { ...projeto, itens: projeto.itens.map((i) => (i.id === acao.item.id ? acao.item : i)) }
    case 'remover':
      return { ...projeto, itens: projeto.itens.filter((i) => i.id !== acao.id) }
  }
}

const GRUPOS: GrupoPeca[] = ['Escritório', 'Banheiro', 'Cozinha', 'Descanso', 'Armazenagem', 'Loja', 'Estrutura', 'Parede']

const CATALOGO = GRUPOS.map((grupo) => ({
  grupo,
  pecas: [
    ...Object.entries(PECAS_PISO).filter(([, p]) => p.grupo === grupo),
    ...Object.entries(PECAS_PAREDE).filter(([, p]) => p.grupo === grupo),
  ].map(([tipo, p]) => ({ tipo: tipo as TipoPeca, ...p })),
})).filter((g) => g.pecas.length > 0)

class LimiteDeErro extends Component<{ children: React.ReactNode; reserva: React.ReactNode }, { erro: boolean }> {
  state = { erro: false }
  static getDerivedStateFromError() {
    return { erro: true }
  }
  render() {
    return this.state.erro ? this.props.reserva : this.props.children
  }
}

// Os containers lado a lado vistos de cima.
function IconeJuntos({ n }: { n: Modulos }) {
  const alto = 6
  const topo = 14 - (n * alto + (n - 1) * 2) / 2
  return (
    <svg width="30" height="28" viewBox="0 0 30 28" aria-hidden="true">
      {Array.from({ length: n }, (_, k) => (
        <rect key={k} x="2" y={topo + k * (alto + 2)} width="26" height={alto} rx="1" className={estilos.miniPlanta} />
      ))}
    </svg>
  )
}

// Planta da peça vista de cima, em escala, para o catálogo.
function MiniPlanta({ w, d }: { w: number; d: number }) {
  const escala = 22 / Math.max(w, d, 1)
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
      <rect
        x={14 - (w * escala) / 2}
        y={14 - (d * escala) / 2}
        width={w * escala}
        height={Math.max(2, d * escala)}
        rx="1.5"
        className={estilos.miniPlanta}
      />
    </svg>
  )
}

export function Montador() {
  const parametros = useSearchParams()
  const [projeto, despachar] = useReducer(reduzir, null, () => {
    const doLink = decodificar(parametros.get('p'))
    if (doLink) return doLink
    const partida = parametros.get('partida')
    return projetoInicial(partida && partida in PONTOS_DE_PARTIDA ? (partida as PontoDePartida) : 'escritorio')
  })
  const [selecionado, setSelecionado] = useState<string | null>(null)
  const [porDentro, setPorDentro] = useState(true)
  const [vista, setVista] = useState<Vista>({ modo: 'perspectiva', versao: 0 })
  const [aviso, setAviso] = useState('')
  const capturar = useRef<(() => string) | null>(null)
  // Link de projeto ou ponto de partida vindo de outra página já é um pedido de 3D: abre direto
  const [iniciado, setIniciado] = useState(() => parametros.has('p') || parametros.has('partida'))
  const raiz = useRef<HTMLDivElement>(null)
  const [telaCheia, setTelaCheia] = useState(false)
  const [dicaGiro, setDicaGiro] = useState(true)
  // Na tela cheia as opções (tamanho, cor, peças) ficam numa gaveta aberta pela barra de baixo
  const [opcoesAbertas, setOpcoesAbertas] = useState(false)

  // Tela cheia pela API do navegador quando existe; no iPhone, que não a tem para página, o mesmo
  // efeito vem do CSS (data-tela-cheia). No celular tenta deitar a tela (só o Android aceita).
  const alternarTelaCheia = async () => {
    if (telaCheia) {
      if (document.fullscreenElement) await document.exitFullscreen().catch(() => {})
      setTelaCheia(false)
      setOpcoesAbertas(false)
      return
    }
    setTelaCheia(true)
    setIniciado(true)
    try {
      await raiz.current?.requestFullscreen?.({ navigationUI: 'hide' })
      const orientacao = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> }
      if (window.matchMedia('(pointer: coarse)').matches) await orientacao.lock?.('landscape')
    } catch {}
  }

  useEffect(() => {
    // Saiu da tela cheia pelo Esc ou pelo gesto do sistema: o estado acompanha
    const aoMudar = () => {
      if (document.fullscreenElement) return
      setTelaCheia(false)
      setOpcoesAbertas(false)
    }
    document.addEventListener('fullscreenchange', aoMudar)
    return () => document.removeEventListener('fullscreenchange', aoMudar)
  }, [])

  // Marca no <html> para o botão flutuante do WhatsApp sair da frente da barra da peça (celular)
  const temSelecao = selecionado !== null
  useEffect(() => {
    if (!temSelecao) return
    document.documentElement.dataset.pecaSelecionada = ''
    return () => {
      delete document.documentElement.dataset.pecaSelecionada
    }
  }, [temSelecao])

  useEffect(() => {
    if (!telaCheia) return
    const html = document.documentElement
    const antes = html.style.overflow
    html.style.overflow = 'hidden'
    return () => {
      html.style.overflow = antes
    }
  }, [telaCheia])

  const emConflito = useMemo(() => conflitos(projeto), [projeto])
  const itemSelecionado = projeto.itens.find((i) => i.id === selecionado) ?? null
  const codigo = useMemo(() => codificar(projeto), [projeto])

  // O projeto vive na URL: copiar o endereço é compartilhar o container montado.
  useEffect(() => {
    const espera = setTimeout(() => {
      const url = new URL(window.location.href)
      url.searchParams.delete('partida')
      url.searchParams.set('p', codigo)
      window.history.replaceState(null, '', url)
    }, 300)
    return () => clearTimeout(espera)
  }, [codigo])

  useEffect(() => {
    if (!aviso) return
    const t = setTimeout(() => setAviso(''), 2600)
    return () => clearTimeout(t)
  }, [aviso])

  const trocar = (novo: Projeto) => despachar({ tipo: 'trocar', projeto: novo })

  const mudarForma = (forma: Forma) => {
    const antes = projeto.itens.length
    const novo = trocarForma(projeto, forma)
    trocar(novo)
    if (novo.itens.length < antes) setAviso(`${antes - novo.itens.length} peça(s) não couberam em ${descreverForma(forma)}.`)
  }

  const acrescentar = (tipo: TipoPeca) => {
    const novo = adicionar(projeto, tipo)
    if (novo === projeto) {
      setAviso('Chegou ao limite de peças deste esboço.')
      return
    }
    trocar(novo)
    setSelecionado(novo.itens.at(-1)?.id ?? null)
    setIniciado(true)
    // No celular a gaveta cobre o 3D: fecha para a pessoa ver a peça que entrou
    if (telaCheia && window.matchMedia('(max-width: 999px)').matches) setOpcoesAbertas(false)
  }

  const girarSelecionado = useCallback(() => {
    if (!itemSelecionado || ehParede(itemSelecionado)) return
    despachar({ tipo: 'mover', item: girar(itemSelecionado, projeto) })
  }, [itemSelecionado, projeto])

  const removerSelecionado = useCallback(() => {
    if (!itemSelecionado) return
    despachar({ tipo: 'remover', id: itemSelecionado.id })
    setSelecionado(null)
  }, [itemSelecionado])

  const duplicarSelecionado = useCallback(() => {
    if (!itemSelecionado) return
    const novo = duplicar(projeto, itemSelecionado.id)
    if (novo === projeto) return
    despachar({ tipo: 'trocar', projeto: novo })
    setSelecionado(novo.itens.at(-1)?.id ?? null)
  }, [itemSelecionado, projeto])

  // Atalhos: R gira, D duplica, Delete remove, setas empurram 5 cm (Shift, 25 cm), Esc desmarca.
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      const alvo = e.target as HTMLElement
      if (alvo.closest('input, textarea, select')) return
      if (e.key === 'Escape') {
        if (opcoesAbertas) setOpcoesAbertas(false)
        else if (!itemSelecionado && telaCheia && !document.fullscreenElement) setTelaCheia(false)
        setSelecionado(null)
      }
      if (!itemSelecionado) return
      const tecla = e.key.toLowerCase()
      if (tecla === 'r') girarSelecionado()
      else if (tecla === 'd') duplicarSelecionado()
      else if (e.key === 'Delete' || e.key === 'Backspace') removerSelecionado()
      else if (e.key.startsWith('Arrow') && !ehParede(itemSelecionado)) {
        e.preventDefault()
        const passo = e.shiftKey ? 0.25 : 0.05
        const dx = e.key === 'ArrowRight' ? passo : e.key === 'ArrowLeft' ? -passo : 0
        const dz = e.key === 'ArrowDown' ? passo : e.key === 'ArrowUp' ? -passo : 0
        despachar({
          tipo: 'mover',
          item: limitarPiso({ ...itemSelecionado, x: itemSelecionado.x + dx, z: itemSelecionado.z + dz }, projeto),
        })
      }
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [itemSelecionado, girarSelecionado, duplicarSelecionado, removerSelecionado, projeto, telaCheia, opcoesAbertas])

  const linkDoProjeto = () => {
    const url = new URL(window.location.href)
    url.search = `?p=${codigo}`
    url.hash = ''
    return url.toString()
  }

  const copiarLink = async () => {
    try {
      await navigator.clipboard.writeText(linkDoProjeto())
      setAviso('Link copiado. Quem abrir vê este mesmo container.')
    } catch {
      setAviso('Não deu para copiar: copie o endereço da barra do navegador.')
    }
  }

  const baixarImagem = () => {
    const dado = capturar.current?.()
    if (!dado) return
    const a = document.createElement('a')
    a.href = dado
    a.download = `container-${projeto.modulos > 1 ? `${projeto.modulos}x` : ''}${projeto.tamanho}-pes.png`
    a.click()
  }

  const enviarProjeto = () => window.open(linkWhatsApp(resumoDoProjeto(projeto, linkDoProjeto())), '_blank', 'noopener')

  const lista = contagem(projeto)
  const ocupada = areaOcupada(projeto)

  return (
    <div ref={raiz} className={estilos.montador} data-tela-cheia={telaCheia} data-opcoes={opcoesAbertas}>
      <aside id="opcoes-montador" className={estilos.painel} aria-label="Opções do container">
        <div className={estilos.cabecaGaveta}>
          <strong>Opções do container</strong>
          <button type="button" onClick={() => setOpcoesAbertas(false)}>
            Fechar
          </button>
        </div>
        <section className={estilos.bloco}>
          <h2>Tamanho</h2>
          <div className={estilos.tamanhos} role="radiogroup" aria-label="Tamanho do container">
            {TAMANHOS.map((t) => (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={projeto.tamanho === t}
                className={estilos.tamanho}
                onClick={() => mudarForma({ tamanho: t, modulos: projeto.modulos })}
              >
                <span className="marcacao">{t}&apos;</span>
              </button>
            ))}
          </div>
        </section>

        <section className={estilos.bloco}>
          <h2>Lado a lado</h2>
          <div className={estilos.juntos} role="radiogroup" aria-label="Quantos containers lado a lado">
            {MODULOS.map((m) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={projeto.modulos === m}
                className={estilos.junto}
                onClick={() => mudarForma({ tamanho: projeto.tamanho, modulos: m })}
              >
                <IconeJuntos n={m} />
                {m === 1 ? 'Um só' : `${m} juntos`}
              </button>
            ))}
          </div>
          <p className={estilos.dica}>Unidos pela lateral, sem a parede do meio: o espaço cresce na largura.</p>
        </section>

        <section className={estilos.bloco}>
          <h2>Cor da chapa</h2>
          <div className={estilos.cores} role="radiogroup" aria-label="Cor da chapa">
            {(Object.entries(CORES_CHAPA) as [CorChapa, (typeof CORES_CHAPA)[CorChapa]][]).map(([chave, cor]) => (
              <button
                key={chave}
                type="button"
                role="radio"
                aria-checked={projeto.cor === chave}
                aria-label={cor.nome}
                title={cor.nome}
                className={estilos.cor}
                style={{ '--amostra': cor.hex } as React.CSSProperties}
                onClick={() => trocar({ ...projeto, cor: chave })}
              />
            ))}
          </div>
        </section>

        <section className={estilos.bloco}>
          <h2>Começar de um modelo</h2>
          <div className={estilos.partidas}>
            {(Object.entries(PONTOS_DE_PARTIDA) as [PontoDePartida, { nome: string }][]).map(([chave, p]) => (
              <button
                key={chave}
                type="button"
                className={estilos.partida}
                onClick={() => {
                  trocar({ ...projetoInicial(chave), cor: projeto.cor })
                  setSelecionado(null)
                  setVista((v) => ({ ...v, versao: v.versao + 1 }))
                }}
              >
                {p.nome}
              </button>
            ))}
          </div>
        </section>

        <section className={estilos.bloco}>
          <h2>Peças</h2>
          <p className={estilos.dica}>Toque para pôr no container. Depois arraste no 3D para mudar de lugar.</p>
          {CATALOGO.map((g) => (
            <details key={g.grupo} className={estilos.grupo} open={g.grupo === 'Escritório' || g.grupo === 'Parede'}>
              <summary>{g.grupo}</summary>
              <ul className={estilos.pecas}>
                {g.pecas.map((p) => (
                  <li key={p.tipo}>
                    <button type="button" className={estilos.peca} onClick={() => acrescentar(p.tipo)}>
                      <MiniPlanta w={p.w} d={ehTipoParede(p.tipo) ? 0.15 : p.d} />
                      <span>
                        {p.nome}
                        <small>
                          {p.w.toLocaleString('pt-BR')} × {(ehTipoParede(p.tipo) ? p.h : p.d).toLocaleString('pt-BR')} m
                        </small>
                      </span>
                      <span className={estilos.mais} aria-hidden="true">
                        +
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </section>
      </aside>

      <div className={estilos.palco}>
        <div className={estilos.canvas}>
          {iniciado ? (
            <LimiteDeErro
              reserva={
                <div className={estilos.carregando}>
                  Este navegador não conseguiu abrir o 3D. Conte o seu projeto pelo formulário em{' '}
                  <a href="/sob-medida#projeto">Sob medida</a>.
                </div>
              }
            >
              <Cena
                projeto={projeto}
                selecionado={selecionado}
                emConflito={emConflito}
                porDentro={porDentro}
                vista={vista}
                onSelecionar={setSelecionado}
                onMover={(item) => despachar({ tipo: 'mover', item })}
                onCapturador={(fn) => {
                  capturar.current = fn
                }}
              />
            </LimiteDeErro>
          ) : (
            <div className={estilos.capa}>
              <Image src="/montador/previa.jpg" alt="" fill priority sizes="(min-width: 1000px) 70vw, 100vw" />
              <div className={estilos.capaChamada}>
                {/* Passar o mouse ou encostar o dedo já começa a baixar o 3D */}
                <button
                  type="button"
                  className={estilos.comecar}
                  onPointerEnter={() => void importarCena()}
                  onFocus={() => void importarCena()}
                  onClick={() => setIniciado(true)}
                >
                  Começar a montar <Icone nome="seta" tamanho={20} />
                </button>
                <p>Gire, arraste os móveis e mande o projeto pelo WhatsApp.</p>
              </div>
            </div>
          )}

          <div className={estilos.ferramentas} hidden={!iniciado}>
            <button type="button" aria-pressed={porDentro} onClick={() => setPorDentro((v) => !v)}>
              Ver por dentro
            </button>
            <button
              type="button"
              onClick={() => setVista((v) => ({ modo: v.modo === 'cima' ? 'perspectiva' : 'cima', versao: v.versao + 1 }))}
            >
              {vista.modo === 'cima' ? 'Vista 3D' : 'Vista de cima'}
            </button>
            <button type="button" onClick={() => setVista((v) => ({ ...v, versao: v.versao + 1 }))}>
              Centralizar
            </button>
            <button type="button" className={estilos.botaoTelaCheia} aria-pressed={telaCheia} onClick={alternarTelaCheia}>
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path
                  d={telaCheia ? 'M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5' : 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5'}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {telaCheia ? 'Sair da tela cheia' : 'Tela cheia'}
            </button>
            <span className={estilos.quebra} aria-hidden="true" />
            {/* Só no celular em pé (o CSS decide): deitado, o 3D fica bem maior */}
            {iniciado && dicaGiro && (
              <span className={estilos.dicaGiro}>
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <rect x="7" y="2" width="10" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M20 14a8 8 0 0 1-6 7.7M14 21.7l1.6-2.4M14 21.7l2.7.6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                Gire o celular ou use a tela cheia para ver maior
                <button type="button" aria-label="Fechar a dica" onClick={() => setDicaGiro(false)}>
                  ×
                </button>
                </span>
            )}
          </div>


          <p className={estilos.ocupacao} aria-live="polite" hidden={!iniciado}>
            <span className="marcacao">{ocupada}%</span> do piso ocupado · {metros(interno(projeto).c)} ×{' '}
            {metros(interno(projeto).l)} m
          </p>

          {itemSelecionado && (
            <div className={estilos.selecao} role="toolbar" aria-label={`Peça selecionada: ${nomeDaPeca(itemSelecionado.tipo)}`}>
              <strong>{nomeDaPeca(itemSelecionado.tipo)}</strong>
              {emConflito.has(itemSelecionado.id) && <span className={estilos.alerta}>encostando em outra peça</span>}
              {!ehParede(itemSelecionado) && (
                <button type="button" onClick={girarSelecionado}>
                  Girar <kbd>R</kbd>
                </button>
              )}
              <button type="button" onClick={duplicarSelecionado}>
                Duplicar <kbd>D</kbd>
              </button>
              <button type="button" className={estilos.remover} onClick={removerSelecionado}>
                Remover
              </button>
            </div>
          )}

          {aviso && (
            <p className={estilos.aviso} role="status">
              {aviso}
            </p>
          )}
        </div>

        {/* Tela cheia: as opções numa gaveta e o envio sempre à vista, numa barra na base */}
        {telaCheia && (
          <div className={estilos.barraTelaCheia}>
            <button
              type="button"
              className={estilos.botaoOpcoes}
              aria-expanded={opcoesAbertas}
              aria-controls="opcoes-montador"
              onClick={() => setOpcoesAbertas((v) => !v)}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M4 7h10M18 7h2M4 17h4M12 17h8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="16" cy="7" r="2" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle cx="10" cy="17" r="2" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
              Opções
            </button>
            <p className={estilos.barraResumo}>
              {descreverForma(projeto)} · {projeto.itens.length} {projeto.itens.length === 1 ? 'peça' : 'peças'}
            </p>
            <button type="button" className={estilos.enviar} onClick={enviarProjeto}>
              <IconeWhatsApp /> Enviar este projeto
            </button>
          </div>
        )}

        <section className={estilos.resumo} aria-labelledby="resumo-titulo">
          <div>
            <h2 id="resumo-titulo">
              {projeto.modulos === 1 ? 'Seu container' : 'Seus containers'}:{' '}
              <span className="marcacao">
                {projeto.modulos > 1 && `${projeto.modulos} × `}
                {projeto.tamanho}&apos;
              </span>
              {projeto.modulos > 1 && ' lado a lado'}, {CORES_CHAPA[projeto.cor].nome.toLowerCase()}
            </h2>
            <p className={estilos.listaItens}>
              {lista.length
                ? lista.map((i) => `${i.quantidade} × ${i.nome.toLowerCase()}`).join(' · ')
                : 'Nenhuma peça ainda: comece pelo catálogo ao lado.'}
            </p>
            {emConflito.size > 0 && (
              <p className={estilos.alertaResumo}>
                <Icone nome="escudo" tamanho={16} /> {emConflito.size} peça(s) em vermelho estão encostando em outra ou na
                frente de uma porta.
              </p>
            )}
          </div>
          <div className={estilos.acoes}>
            <button
              type="button"
              className={estilos.enviar}
              onClick={enviarProjeto}
            >
              <IconeWhatsApp /> Enviar este projeto
            </button>
            <button type="button" className={estilos.secundario} onClick={copiarLink}>
              Copiar link
            </button>
            <button type="button" className={estilos.secundario} onClick={baixarImagem}>
              Baixar imagem
            </button>
          </div>
          <p className={estilos.nota}>
            Projeto meramente ilustrativo, um esboço para a conversa: a equipe confirma medidas, instalações e o que é
            viável antes do orçamento.
          </p>
        </section>
      </div>
    </div>
  )
}
