import { createClient } from '@supabase/supabase-js'

export function criarClientePublico() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !chave) return null
  return createClient(url, chave, { auth: { persistSession: false } })
}
