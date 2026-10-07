// O pedido não é gravado em lugar nenhum: vira o texto da conversa no WhatsApp ou o corpo do e-mail.
export type TipoPedido = 'orcamento' | 'sob-medida'

export interface Pedido {
  tipo: TipoPedido
  nome: string
  telefone: string
  email?: string
  empresa?: string
  modelo?: string
  quantidade?: string
  prazo?: string
  local?: string
  mensagem?: string
}

export type ErrosPedido = Partial<Record<'nome' | 'telefone' | 'email' | 'mensagem', string>>

const LIMITE_TEXTO = 1200

export function digitos(valor: string): string {
  return valor.replace(/\D/g, '')
}

export function validarPedido(p: Pedido): ErrosPedido {
  const erros: ErrosPedido = {}
  if (p.nome.trim().length < 2) erros.nome = 'Diga o seu nome.'

  const tel = digitos(p.telefone)
  if (tel.length < 10 || tel.length > 13) erros.telefone = 'Informe o celular com DDD.'

  const email = p.email?.trim()
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) erros.email = 'Confira o e-mail.'

  if (p.tipo === 'sob-medida' && (p.mensagem?.trim().length ?? 0) < 10) {
    erros.mensagem = 'Conte em poucas palavras o que você precisa.'
  }
  if ((p.mensagem?.length ?? 0) > LIMITE_TEXTO) {
    erros.mensagem = `Use até ${LIMITE_TEXTO} caracteres.`
  }
  return erros
}

export function formatarTelefone(valor: string): string {
  const d = digitos(valor).replace(/^55(?=\d{10,11}$)/, '')
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return valor.trim()
}

export function montarMensagem(p: Pedido): string {
  const abertura =
    p.tipo === 'sob-medida'
      ? 'Olá! Preciso de um container sob medida. Vi no site.'
      : 'Olá! Quero um orçamento de locação de container. Vi no site.'

  const linhas: [string, string | undefined][] = [
    ['Nome', p.nome],
    ['Empresa', p.empresa],
    ['Celular', formatarTelefone(p.telefone)],
    ['E-mail', p.email],
    ['Container', p.modelo],
    ['Quantidade', p.quantidade],
    ['Por quanto tempo', p.prazo],
    ['Onde vai ficar', p.local],
  ]
  const campos = linhas
    .map(([rotulo, valor]) => [rotulo, valor?.trim()] as const)
    .filter(([, valor]) => valor)
    .map(([rotulo, valor]) => `*${rotulo}:* ${valor}`)

  const mensagem = p.mensagem?.trim()
  return [abertura, '', ...campos, ...(mensagem ? ['', mensagem] : [])].join('\n')
}
