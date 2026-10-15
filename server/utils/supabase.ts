import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { EMAIL_COOLDOWN_MS, type Lead } from './lead'

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

/**
 * Atomically claims the right to e-mail this address: one UPDATE that only matches when no e-mail
 * went out within the cooldown. Postgres locks the row and re-checks the condition, so of several
 * parallel requests exactly one gets `true`.
 */
export async function claimEmailSlot(email: string): Promise<boolean> {
  const cutoff = new Date(Date.now() - EMAIL_COOLDOWN_MS).toISOString()
  const { data, error } = await supabase()
    .from('leads')
    .update({ emailed_at: new Date().toISOString() })
    .eq('email', email)
    .or(`emailed_at.is.null,emailed_at.lt.${cutoff}`)
    .select('id')
  if (error) throw new Error(`Supabase claim failed: ${error.message}`)
  return data.length > 0
}

/** Undo a claim when sending failed, so the visitor can retry right away. */
export async function releaseEmailSlot(email: string): Promise<void> {
  const { error } = await supabase().from('leads').update({ emailed_at: null }).eq('email', email)
  if (error) throw new Error(`Supabase release failed: ${error.message}`)
}
