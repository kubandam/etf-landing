import { describe, expect, test } from 'vitest'
import type { EtfData } from '#shared/types/etf'
import data from '../../data/etfs.json'
import { compareAll, formatCzk } from '#shared/utils/feeCalc'
import { comparisonEmail } from './email'

const funds = (data as EtfData).funds
const mail = comparisonEmail({ monthly: 5000, years: 30 }, funds)

describe('comparisonEmail', () => {
  test('subject in Czech with the visitor numbers', () => {
    expect(mail.subject).toContain('5 000 Kč')
    expect(mail.subject).toContain('30 let')
  })

  test('all 4 funds and their UCITS versions with the same numbers as the thank-you screen', () => {
    for (const r of compareAll(5000, 30, funds)) {
      for (const part of [mail.html, mail.text]) {
        expect(part).toContain(r.ticker)
        expect(part).toContain(r.ucits.ticker)
        expect(part).toContain(r.ucits.isin)
        expect(part).toContain(formatCzk(r.endValue))
        expect(part).toContain(formatCzk(r.feesPaid))
        expect(part).toContain(formatCzk(r.ucits.endValue))
      }
    }
  })

  test('assumption, source date and not-advice line present', () => {
    for (const part of [mail.html, mail.text]) {
      expect(part).toContain('7 % ročně')
      expect(part).toContain('14. 10. 2026')
      expect(part).toContain('Nejde o investiční doporučení')
    }
  })

  test('html is escaped (S&P)', () => {
    expect(mail.html).not.toMatch(/S&P/)
    expect(mail.html).toContain('S&amp;P')
  })
})
