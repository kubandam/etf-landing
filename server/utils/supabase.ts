import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Lead } from './lead'

let client: SupabaseClient | undefined

function supabase(): SupabaseClient {
  if (client) return client
  const { supabaseUrl, supabaseServiceKey } = useRuntimeConfig()
  if (!supabaseUrl || !supabaseServiceKey) throw new Error('Supabase env vars missing')
  // Common mistake: pasting the Postgres connection string instead of the API URL.
  if (!supabaseUrl.startsWith('https://')) throw new Error('NUXT_SUPABASE_URL must be the API URL https://<ref>.supabase.co')
  client = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } })
  return client
}

/** Insert, or update monthly/years/variant when the e-mail already exists. created_at stays from the first submit. */
export async function upsertLead(lead: Lead): Promise<void> {
  const { error } = await supabase()
    .from('leads')
    .upsert({ ...lead, updated_at: new Date().toISOString() }, { onConflict: 'email' })
  if (error) throw new Error(`Supabase upsert failed: ${error.message}`)
}
