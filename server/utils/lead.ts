import { z } from 'zod'
import { MONTHLY, YEARS, type Years } from '#shared/utils/feeCalc'
import { normalizeVariant, type Variant } from '#shared/utils/variant'

export interface Lead {
  email: string
  monthly: number
  years: Years
  variant: Variant
}

export class LeadError extends Error {
  constructor(public code: 'invalid_email' | 'invalid_input') {
    super(code)
  }
}

const emailSchema = z.string().trim().toLowerCase().pipe(z.email())

const inputSchema = z.object({
  monthly: z.number().int().min(MONTHLY.min).max(MONTHLY.max).multipleOf(MONTHLY.step),
  years: z.union(YEARS.map(y => z.literal(y)) as [z.ZodLiteral<Years>, ...z.ZodLiteral<Years>[]]),
})

/** Validates a POST /api/lead body. Throws LeadError. Unknown keys (e.g. honeypot `website`) are dropped. */
export function parseLead(body: unknown): Lead {
  if (typeof body !== 'object' || body === null) throw new LeadError('invalid_input')
  const b = body as Record<string, unknown>

  const email = emailSchema.safeParse(b.email)
  if (!email.success) throw new LeadError('invalid_email')

  const input = inputSchema.safeParse(b)
  if (!input.success) throw new LeadError('invalid_input')

  return { email: email.data, ...input.data, variant: normalizeVariant(b.variant) }
}
