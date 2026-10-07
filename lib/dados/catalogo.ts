import { cache } from 'react'
import { FROTA_RESERVA, montarCatalogo, type LinhaFrota, type Modelo } from '@/lib/catalogo'
import { criarClientePublico } from '@/lib/supabase/publico'

// A view só tem estas três colunas: coluna nova no OMNIS é decisão do dono e migração nova.
const CAMPOS = 'uso, tamanho_pes, fabricacao'

export const buscarCatalogo = cache(async (): Promise<Modelo[]> => {
  const supabase = criarClientePublico()
  if (!supabase) {
    console.error('Catálogo: sem NEXT_PUBLIC_SUPABASE_URL/ANON_KEY, usando a frota de reserva.')
    return montarCatalogo(FROTA_RESERVA)
  }

  const { data, error } = await supabase.from('v_site_containers').select(CAMPOS)
  if (error || !data?.length) {
    console.error('Catálogo: falha ao ler v_site_containers, usando a frota de reserva.', error?.message)
    return montarCatalogo(FROTA_RESERVA)
  }
  return montarCatalogo(data as LinhaFrota[])
})
