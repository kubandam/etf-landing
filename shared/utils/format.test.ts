import { expect, test } from 'vitest'
import { formatPct, formatUsdBn } from './format'

test('formatPct keeps the issuer precision, Czech decimal comma, NBSP before %', () => {
  expect(formatPct(0.0945)).toBe('0,0945 %')
  expect(formatPct(0.03)).toBe('0,03 %')
  expect(formatPct(1.0)).toBe('1,00 %')
  expect(formatPct(0.94)).toBe('0,94 %')
})

test('formatUsdBn rounds to whole billions, "mld. USD"', () => {
  expect(formatUsdBn(823230730000)).toBe('823 mld. USD')
  expect(formatUsdBn(1000000000000)).toBe('1 000 mld. USD')
  expect(formatUsdBn(185171570000)).toBe('185 mld. USD')
})
