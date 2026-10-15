import { normalizeVariant, type Variant } from '#shared/utils/variant'

/** Ad version from `?v=`, read during setup so SSR and client agree. */
export function useVariant(): Variant {
  return normalizeVariant(useRoute().query.v)
}
