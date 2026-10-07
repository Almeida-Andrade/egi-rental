'use client'

import { useSearchParams } from 'next/navigation'
import { useId, useState } from 'react'
import { linhasDaMensagem, montarMensagem, validarPedido, type ErrosPedido, type Pedido, type TipoPedido } from '@/lib/pedido'
import { CONTATO } from '@/lib/site'
import { linkWhatsApp } from '@/lib/whatsapp'
import { Icone, IconeWhatsApp } from './Icone'
import estilos from './FormularioPedido.module.css'

interface Props {
  tipo: TipoPedido
  // só os nomes: o catálogo inteiro não precisa ir ao navegador
  modelos?: string[]
}

const PRAZOS = ['Até 1 mês', '1 a 3 meses', '3 a 6 meses', '6 a 12 meses', 'Mais de 1 ano', 'Ainda não sei']

export function FormularioPedido({ tipo, modelos = [] }: Props) {
  const id = useId()
  const parametros = useSearchParams()
  const modeloDaUrl = parametros.get('modelo') ?? ''
  const [erros, setErros] = useState<ErrosPedido>({})
  const [previa, setPrevia] = useState('')

  function lerPedido(form: HTMLFormElement): Pedido {
    const dados = new FormData(form)
    const texto = (campo: string) => String(dados.get(campo) ?? '')
    return {
      tipo,
      nome: texto('nome'),
      telefone: texto('telefone'),
      email: texto('email'),
      empresa: texto('empresa'),
      modelo: texto('modelo'),
      quantidade: texto('quantidade'),
      prazo: texto('prazo'),
      local: texto('local'),
      mensagem: texto('mensagem'),
    }
  }

  function enviar(form: HTMLFormElement, canal: 'whatsapp' | 'email') {
    const pedido = lerPedido(form)
    const encontrados = validarPedido(pedido)
    setErros(encontrados)
    const primeiro = Object.keys(encontrados)[0]
    if (primeiro) {
      form.querySelector<HTMLElement>(`[name="${primeiro}"]`)?.focus()
      return
    }
    const texto = montarMensagem(pedido)
    if (canal === 'whatsapp') {
      window.open(linkWhatsApp(texto), '_blank', 'noopener')
    } else {
      const assunto = tipo === 'sob-medida' ? 'Container sob medida' : 'Orçamento de locação de container'
      window.location.href = `mailto:${CONTATO.email}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(texto.replaceAll('*', ''))}`
    }
  }

  const campo = (nome: keyof ErrosPedido) => ({
    id: `${id}-${nome}`,
    name: nome,
    'aria-invalid': erros[nome] ? true : undefined,
    'aria-describedby': erros[nome] ? `${id}-${nome}-erro` : undefined,
  })

  const erro = (nome: keyof ErrosPedido) =>
    erros[nome] && (
      <span id={`${id}-${nome}-erro`} className={estilos.erro}>
        {erros[nome]}
      </span>
    )

  return (
    <form
      className={estilos.form}
      noValidate
      onInput={(e) => setPrevia(montarMensagem(lerPedido(e.currentTarget)))}
      onSubmit={(e) => {
        e.preventDefault()
        enviar(e.currentTarget, 'whatsapp')
      }}
    >
      <div className={estilos.grade}>
        <label className={estilos.campo}>
          <span>Seu nome *</span>
          <input {...campo('nome')} autoComplete="name" required />
          {erro('nome')}
        </label>
        <label className={estilos.campo}>
          <span>Celular / WhatsApp *</span>
          <input {...campo('telefone')} type="tel" inputMode="tel" autoComplete="tel" placeholder="(98) 99999-9999" required />
          {erro('telefone')}
        </label>
        <label className={estilos.campo}>
          <span>E-mail</span>
          <input {...campo('email')} type="email" autoComplete="email" />
          {erro('email')}
        </label>
        <label className={estilos.campo}>
          <span>Empresa</span>
          <input id={`${id}-empresa`} name="empresa" autoComplete="organization" />
        </label>

        {tipo === 'orcamento' && (
          <>
            <label className={estilos.campo}>
              <span>Container</span>
              <select id={`${id}-modelo`} name="modelo" defaultValue={modelos.includes(modeloDaUrl) ? modeloDaUrl : ''}>
                <option value="">Preciso de ajuda para escolher</option>
                {modelos.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </label>
            <label className={estilos.campo}>
              <span>Quantidade</span>
              <input id={`${id}-quantidade`} name="quantidade" inputMode="numeric" placeholder="1" />
            </label>
          </>
        )}

        <label className={estilos.campo}>
          <span>Por quanto tempo</span>
          <select id={`${id}-prazo`} name="prazo" defaultValue="">
            <option value="">Selecione</option>
            {PRAZOS.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
        <label className={estilos.campo}>
          <span>Onde vai ficar</span>
          <input id={`${id}-local`} name="local" placeholder="Bairro ou cidade" />
        </label>

        <label className={`${estilos.campo} ${estilos.inteiro}`}>
          <span>{tipo === 'sob-medida' ? 'O que você precisa? *' : 'Mensagem'}</span>
          <textarea
            {...campo('mensagem')}
            rows={tipo === 'sob-medida' ? 5 : 3}
            placeholder={
              tipo === 'sob-medida'
                ? 'Ex.: escritório com banheiro e ar-condicionado, dois containers lado a lado, pintura com a nossa marca…'
                : 'Algum detalhe que ajude no orçamento'
            }
          />
          {erro('mensagem')}
        </label>
      </div>

      <figure className={estilos.previa}>
        <figcaption>Assim a mensagem chega para a gente</figcaption>
        <p className={estilos.balao}>
          {linhasDaMensagem(previa || montarMensagem({ tipo, nome: '', telefone: '', modelo: modeloDaUrl })).map(
            (linha, i) => (
              <span key={i} className={estilos.linhaBalao}>
                {linha.map((trecho, j) => (trecho.negrito ? <b key={j}>{trecho.texto}</b> : trecho.texto))}
              </span>
            ),
          )}
        </p>
      </figure>

      <div className={estilos.acoes}>
        <button type="submit" className={estilos.whatsapp}>
          <IconeWhatsApp /> Enviar pelo WhatsApp
        </button>
        <button
          type="button"
          className={estilos.email}
          onClick={(e) => e.currentTarget.form && enviar(e.currentTarget.form, 'email')}
        >
          <Icone nome="email" /> Enviar por e-mail
        </button>
      </div>
      <p className={estilos.aviso}>
        O pedido abre no seu WhatsApp ou no seu e-mail, já escrito. Nada fica guardado neste site.
      </p>
    </form>
  )
}
