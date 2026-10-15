import type { Etf } from '#shared/types/etf'
import { cs, formatCsDate } from '#shared/content/cs'
import { latestCheckedDate } from '#shared/utils/etfData'
import { CALC_ASSUMPTIONS, compareAll, formatCzk } from '#shared/utils/feeCalc'
import { formatPct } from '#shared/utils/format'

export interface EmailContent {
  subject: string
  html: string
  text: string
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/**
 * The comparison promised by the form: all funds + UCITS versions for the visitor's numbers.
 * Plain HTML (tables, inline styles) so it renders the same in Gmail, Seznam and Outlook.
 */
export function comparisonEmail({ monthly, years }: { monthly: number; years: number }, funds: Etf[]): EmailContent {
  const rows = compareAll(monthly, years, funds)
  const m = formatCzk(monthly)
  const subject = cs.email.subject(m, years)
  const footer = [
    cs.calc.source(formatCsDate(latestCheckedDate(funds))),
    cs.calc.assumption(CALC_ASSUMPTIONS.annualReturnPct),
    cs.footer.notAdvice,
    cs.email.why,
  ]

  const td = 'padding:6px 0;border-bottom:1px solid #d9d4c9;vertical-align:top;'
  const small = 'font-size:13px;color:#6b675f;'
  const fundRows = rows
    .map((r) => {
      const us = `<tr>
  <td style="${td}"><strong>${esc(r.ticker)}</strong><br><span style="${small}">${esc(cs.thanks.usLabel)} · ${esc(cs.thanks.feeLine(formatPct(r.terPct), formatCzk(r.feesPaid)))}</span></td>
  <td style="${td}text-align:right;white-space:nowrap;"><strong>${esc(formatCzk(r.endValue))}</strong></td>
</tr>`
      const eu = `<tr>
  <td style="${td}padding-left:16px;"><strong>${esc(r.ucits.ticker)}</strong> <span style="${small}">ISIN ${esc(r.ucits.isin)}</span><br><span style="${small}">${esc(cs.thanks.ucitsLabel)} · ${esc(cs.thanks.feeLine(formatPct(r.ucits.terPct), formatCzk(r.ucits.feesPaid)))}</span></td>
  <td style="${td}text-align:right;white-space:nowrap;"><strong>${esc(formatCzk(r.ucits.endValue))}</strong></td>
</tr>`
      return us + eu
    })
    .join('\n')

  const html = `<!doctype html>
<html lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#f5f2eb;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f2eb;"><tr><td align="center" style="padding:24px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.45;color:#1c1b19;">
<tr><td style="font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1.2;padding-bottom:8px;">${esc(cs.email.heading)}</td></tr>
<tr><td style="padding-bottom:16px;">${esc(cs.email.intro(m, years))}</td></tr>
<tr><td style="${small}padding-bottom:4px;border-bottom:1px solid #1c1b19;">${esc(cs.email.endValue)}</td></tr>
<tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${fundRows}
</table></td></tr>
${footer.map(p => `<tr><td style="${small}padding-top:12px;">${esc(p)}</td></tr>`).join('\n')}
</table>
</td></tr></table>
</body></html>`

  const text = [
    cs.email.heading,
    '',
    cs.email.intro(m, years),
    '',
    `${cs.email.endValue}:`,
    ...rows.flatMap(r => [
      `${r.ticker}: ${formatCzk(r.endValue)} · ${cs.thanks.usLabel} · ${cs.thanks.feeLine(formatPct(r.terPct), formatCzk(r.feesPaid))}`,
      `  ${r.ucits.ticker}: ${formatCzk(r.ucits.endValue)} · ${cs.thanks.ucitsLabel}, ISIN ${r.ucits.isin} · ${cs.thanks.feeLine(formatPct(r.ucits.terPct), formatCzk(r.ucits.feesPaid))}`,
    ]),
    '',
    ...footer,
  ].join('\n')

  return { subject, html, text }
}
