/** All visible Czech text. Shared so the server e-mail uses the same strings. */
export const cs = {
  meta: {
    title: 'Kolik vám poplatky ETF seberou? Kalkulačka S&P 500',
    description:
      'Spočítejte si, kolik vás za 5 až 30 let stojí poplatky fondů SPY, VOO a IVV. Výsledek v korunách, s vašimi čísly.',
  },
  hero: {
    kicker: 'S&P 500 ETF · poplatky v Kč',
    headline: { a: 'Kolik vám poplatky seberou za 20 let?' },
  },
  calc: {
    monthlyLabel: 'Kolik měsíčně investujete',
    yearsLabel: 'Jak dlouho',
    yearsOption: (y: number) => `${y}`,
    yearsUnit: 'let',
    hint: 'Kolik vám poplatky vezmou? Posuňte částku.',
    resultHeading: (years: number) => `Za ${years} let budete mít`,
    feeLine: (ter: string, paid: string) => `poplatek ${ter} % · zaplatíte ${paid}`,
    gapLabel: (years: number) => `Rozdíl za ${years} let`,
    gapWho: (cheapest: string, priciest: string) => `${cheapest} oproti ${priciest}`,
    assumption: (pct: number) =>
      `Předpoklad: výnos ${pct} % ročně před poplatky, vklad na konci každého měsíce. Bez daní a poplatků brokera. Skutečný výnos bude jiný.`,
    source: (date: string) => `Poplatky ze stránek správců fondů, ověřeno ${date}.`,
  },
  compare: {
    heading: 'Tři fondy, jeden index',
    intro: 'Všechny tři kopírují S&P 500. Liší se poplatkem a velikostí, ne tím, co držíte.',
    ter: 'Poplatek (TER)',
    size: 'Velikost fondu',
    yield: 'Dividendový výnos',
    yieldNote: '30denní SEC',
    ucits: 'Evropská verze',
    ucitsLine: (ticker: string, ter: string) => `${ticker} · poplatek ${ter}`,
  },
  howToBuy: {
    heading: 'Jak to koupit z Česka',
    points: [
      'Americké fondy jako SPY, VOO nebo IVV vám evropský broker většinou neprodá. Chybí jim KID, povinný dokument pro drobné investory v EU.',
      'Proto se kupuje evropská (UCITS) verze. Sleduje stejný index S&P 500, jen je založená v Irsku:',
      'Koupíte je u běžných brokerů dostupných z Česka. Hledejte podle ISIN, ticker se mezi burzami může lišit.',
    ],
    mapping: (us: string, ucits: string) => `${us} → ${ucits}`,
    isin: 'ISIN',
  },
  footer: {
    sourcesHeading: 'Zdroje',
    sourcesIntro: 'Údaje o fondech jsou ze stránek jejich správců, burza u VOO ze stránky NYSE.',
    checked: (date: string) => `Data ověřena ${date}.`,
    assumption: (pct: number) =>
      `${pct} % ročně je zaokrouhlený předpoklad pro dlouhodobý výnos akciového indexu, ne předpověď: skutečný výnos může být vyšší i nižší a v jednotlivých letech i záporný.`,
    notAdvice: 'Nejde o investiční doporučení.',
  },
  form: {
    heading:
      'Pošleme vám porovnání všech 4 fondů včetně evropských variant, které koupíte u českého brokera, s vašimi čísly.',
    emailLabel: 'Váš e-mail',
    emailPlaceholder: 'jan@email.cz',
    submit: 'Poslat porovnání',
    sending: 'Odesílám…',
    consent:
      'Odesláním souhlasíte se zpracováním e-mailu, abychom vám poslali porovnání. Nic dalšího vám bez souhlasu posílat nebudeme a e-mail můžete kdykoli nechat smazat. Nejde o investiční doporučení.',
    errors: {
      invalid_email: 'Zkontrolujte prosím e-mail, takhle ho neumíme použít.',
      invalid_input: 'Něco se pokazilo. Zkuste prosím obnovit stránku.',
      storage: 'E-mail se nepodařilo uložit. Zkuste to prosím za chvíli znovu.',
      network: 'Nepodařilo se spojit se serverem. Zkontrolujte připojení a zkuste to znovu.',
    },
    thanks: 'Děkujeme.',
  },
} as const

/** "2026-10-14" → "14. 10. 2026" (Czech date, no leading zeros, NBSP so it never wraps). */
export function formatCsDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return `${d}.\u00a0${m}.\u00a0${y}`
}
