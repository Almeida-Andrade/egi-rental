export const URL_SITE =
  process.env.NEXT_PUBLIC_URL_SITE ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000')

// Foto, medida, planta e 3D são exemplo: o que vale é o que a equipe confirma no atendimento.
// Fica perto de toda imagem de modelo, medida e desenho, e inteiro no rodapé.
export const AVISO_ILUSTRATIVO = {
  curto: 'Imagens, medidas e layouts meramente ilustrativos. O container entregue pode variar: confirme com a equipe antes de contratar.',
  completo:
    'Imagens, medidas, plantas, desenhos e projetos em 3D deste site são meramente ilustrativos e servem de exemplo. O container entregue pode variar em medidas, acabamento e itens. Disponibilidade, medidas exatas e o que acompanha cada locação são confirmados pela equipe no atendimento, antes da contratação.',
}

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
