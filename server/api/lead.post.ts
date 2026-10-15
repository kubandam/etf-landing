import { LeadError, parseLead } from '../utils/lead'
import { sendComparisonEmail } from '../utils/resend'
import { upsertLead } from '../utils/supabase'

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => null)

  // Honeypot: bots fill the hidden `website` field. Pretend success, store nothing.
  if (body && typeof body === 'object' && 'website' in body && body.website) {
    setResponseStatus(event, 201)
    return { ok: true, emailed: false }
  }

  let lead
  try {
    lead = parseLead(body)
  }
  catch (e) {
    setResponseStatus(event, 400)
    return { ok: false, error: e instanceof LeadError ? e.code : 'invalid_input' }
  }

  try {
    await upsertLead(lead)
  }
  catch (e) {
    // Lead not saved: tell the client so the user can retry instead of a false "thank you".
    console.error('[lead] storage failed:', e instanceof Error ? e.message : e)
    setResponseStatus(event, 500)
    return { ok: false, error: 'storage' }
  }

  // Only after the lead is saved. A failed e-mail never fails the request.
  const emailed = await sendComparisonEmail(lead)

  setResponseStatus(event, 201)
  return { ok: true, emailed }
})
