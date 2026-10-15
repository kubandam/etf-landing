export type Variant = 'a' | 'b'

/** Ad version from `?v=`. Only the exact string 'b' gives 'b'; anything else (missing, 'X', array) is 'a'. */
export function normalizeVariant(q: unknown): Variant {
  return q === 'b' ? 'b' : 'a'
}
