/** All visible Czech text. Shared so the server e-mail uses the same strings. */
export const cs = {
  calc: {
    heading: 'Spočítejte si, kolik vás stojí poplatky',
    monthlyLabel: 'Kolik měsíčně investujete',
    yearsLabel: 'Jak dlouho',
    yearsOption: (y: number) => `${y} let`,
    resultHeading: (years: number) => `Kolik budete mít za ${years} let`,
    feeGap: (gap: string, cheapest: string, priciest: string) =>
      `Rozdíl mezi nejlevnějším (${cheapest}) a nejdražším (${priciest}) fondem: ${gap}.`,
    terLabel: (ter: string) => `poplatek ${ter} % ročně`,
    assumption: (pct: number) =>
      `Předpoklad: výnos ${pct} % ročně před poplatky, vklad na konci každého měsíce. Bez daní a poplatků brokera. Skutečný výnos bude jiný.`,
  },
} as const
