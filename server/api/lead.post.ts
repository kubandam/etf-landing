import { LeadError, parseLead } from '../utils/lead'
import { sendComparisonEmail } from '../utils/resend'
import { claimEmailSlot, releaseEmailSlot, upsertLead } from '../utils/supabase'

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
  let emailed = false
  try {
    if (await claimEmailSlot(lead.email)) {
      emailed = await sendComparisonEmail(lead)
      if (!emailed) await releaseEmailSlot(lead.email)
    }
    else {
      // A comparison was sent to this address within the cooldown (failed sends release the slot).
      // Answer exactly like a fresh send, so the response does not reveal that the address was used.
      emailed = true
      console.warn('[email] skipped: address e-mailed within the cooldown')
    }
  }
  catch (e) {
    console.error('[email] cooldown check failed:', e instanceof Error ? e.message : e)
  }

  setResponseStatus(event, 201)
  return { ok: true, emailed }
})
