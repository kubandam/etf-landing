import { expect, test } from 'vitest'
import { normalizeVariant } from './variant'

test.each([
  ['b', 'b'],
  ['a', 'a'],
  ['X', 'a'],
  ['B', 'a'],
  ['', 'a'],
  [undefined, 'a'],
  [['b'], 'a'],
])('%j → %s', (q, expected) => {
  expect(normalizeVariant(q)).toBe(expected)
})
