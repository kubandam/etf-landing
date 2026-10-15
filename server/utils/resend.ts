import { Resend } from 'resend'
import type { EtfData } from '#shared/types/etf'
import data from '../../data/etfs.json'
import { comparisonEmail } from './email'
import type { Lead } from './lead'

const SEND_TIMEOUT_MS = 8000

let client: Resend | undefined

/**
 * Sends the full comparison. Never throws: returns false and logs on any failure,
 * because the lead is already saved and the thank-you screen shows the same comparison.
 * Logs never contain the e-mail address.
 */
export async function sendComparisonEmail(lead: Lead): Promise<boolean> {
  const { resendApiKey, mailFrom } = useRuntimeConfig()
  if (!resendApiKey || !mailFrom) {
    console.error('[email] not sent: NUXT_RESEND_API_KEY or NUXT_MAIL_FROM missing')
    return false
  }
  client ??= new Resend(resendApiKey)

  const { subject, html, text } = comparisonEmail(lead, (data as EtfData).funds)
  try {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`timeout after ${SEND_TIMEOUT_MS} ms`)), SEND_TIMEOUT_MS),
    )
    const { error } = await Promise.race([client.emails.send({ from: mailFrom, to: lead.email, subject, html, text }), timeout])
    if (error) {
      console.error(`[email] Resend error: ${error.name} ${error.statusCode ?? ''} ${error.message}`)
      return false
    }
    return true
  }
  catch (e) {
    console.error('[email] send failed:', e instanceof Error ? e.message : e)
    return false
  }
}
