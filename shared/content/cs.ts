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
  form: {
    heading: 'Pošleme vám celé srovnání se všemi fondy a vašimi čísly',
    emailLabel: 'Váš e-mail',
    emailPlaceholder: 'jan@email.cz',
    submit: 'Poslat srovnání',
    sending: 'Odesílám…',
    consent:
      'Odesláním souhlasíte se zpracováním e-mailu, abychom vám poslali srovnání. Nic dalšího vám bez souhlasu posílat nebudeme a e-mail můžete kdykoli nechat smazat. Nejde o investiční doporučení.',
    errors: {
      invalid_email: 'Zkontrolujte prosím e-mail, takhle ho neumíme použít.',
      invalid_input: 'Něco se pokazilo. Zkuste prosím obnovit stránku.',
      storage: 'E-mail se nepodařilo uložit. Zkuste to prosím za chvíli znovu.',
      network: 'Nepodařilo se spojit se serverem. Zkontrolujte připojení a zkuste to znovu.',
    },
    thanks: 'Děkujeme.',
  },
} as const
