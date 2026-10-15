import { describe, expect, test } from 'vitest'
import { LeadError, parseLead } from './lead'

const ok = { email: 'jan@example.cz', monthly: 3000, years: 20, variant: 'a' }

function code(body: unknown): string | undefined {
  try {
    parseLead(body)
  }
  catch (e) {
    return e instanceof LeadError ? e.code : 'other'
  }
}

describe('parseLead', () => {
  test('valid body passes through', () => {
    expect(parseLead(ok)).toEqual(ok)
  })

  test('e-mail trimmed and lowercased', () => {
    expect(parseLead({ ...ok, email: ' Jan@Example.CZ ' }).email).toBe('jan@example.cz')
  })

  test.each(['foo', '', 'jan@', '@example.cz'])('e-mail %j → invalid_email', (email) => {
    expect(code({ ...ok, email })).toBe('invalid_email')
  })

  test('missing e-mail → invalid_email', () => {
    expect(code({ monthly: 3000, years: 20 })).toBe('invalid_email')
  })

  test.each([400, 25000, 3250, '3000', null])('monthly %j → invalid_input', (monthly) => {
    expect(code({ ...ok, monthly })).toBe('invalid_input')
  })

  test.each([15, 0, '20'])('years %j → invalid_input', (years) => {
    expect(code({ ...ok, years })).toBe('invalid_input')
  })

  test('bounds 500 / 20 000 and years 5 / 30 accepted', () => {
    expect(parseLead({ ...ok, monthly: 500, years: 5 }).monthly).toBe(500)
    expect(parseLead({ ...ok, monthly: 20000, years: 30 }).years).toBe(30)
  })

  test.each(['x', undefined, '', ['b']])('variant %j → a', (variant) => {
    expect(parseLead({ ...ok, variant }).variant).toBe('a')
  })

  test('variant b kept', () => {
    expect(parseLead({ ...ok, variant: 'b' }).variant).toBe('b')
  })

  test('non-object body → invalid_input', () => {
    expect(code(null)).toBe('invalid_input')
    expect(code('x')).toBe('invalid_input')
  })

  test('honeypot field is not part of the lead', () => {
    expect(parseLead({ ...ok, website: '' })).toEqual(ok)
  })
})
