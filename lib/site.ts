export const URL_SITE =
  process.env.NEXT_PUBLIC_URL_SITE ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000')

export const EMPRESA = {
  nome: 'EGI Rental',
  slogan: 'Locação rápida, segura e sob medida',
  grupo: 'Grupo Almeida Andrade',
  irma: { nome: 'EGI Empreendimentos', url: 'https://egi.grupoaandrade.com.br' },
  cidade: 'São Luís',
  uf: 'MA',
}

// Todo contato do site sai daqui: número repetido em componente fica velho sem ninguém ver.
export const CONTATO = {
  whatsapp: '5598991022068',
  telefones: [
    { rotulo: '(98) 99102-2068', tel: '+5598991022068' },
    { rotulo: '(98) 98481-2776', tel: '+5598984812776' },
  ],
  email: 'contato@egirental.com.br',
  instagram: { usuario: '@egi.rental', url: 'https://www.instagram.com/egi.rental' },
  horario: 'Segunda a sábado, em horário comercial',
}
