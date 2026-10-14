#!/usr/bin/env node
// Fails the build when any figure in data/etfs.json lacks a value, an issuer
// source URL or the date it was checked. See PLAN.md Task 1 and README §7.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const file = resolve(here, '../data/etfs.json')
const data = JSON.parse(readFileSync(file, 'utf8'))

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
// The exchange may be verified on the exchange's own site when the issuer page does not state it.
const EXTRA_HOSTS = { exchange: ['nyse.com'] }
const errors = []

function host(url) {
  try {
    return new URL(url).host.replace(/^www\./, '')
  } catch {
    return null
  }
}

function checkValue(path, v, issuerUrl, field) {
  if (v === null || typeof v !== 'object') return errors.push(`${path}: not an object`)
  const allowedHosts = [host(issuerUrl), ...(EXTRA_HOSTS[field] ?? [])]
  if (v.value === null || v.value === undefined || v.value === '' || (typeof v.value === 'number' && !Number.isFinite(v.value)))
    errors.push(`${path}.value: missing`)
  if (typeof v.source !== 'string' || !v.source.startsWith('https://'))
    errors.push(`${path}.source: must be an https URL`)
  else if (!allowedHosts.includes(host(v.source)))
    errors.push(`${path}.source: host ${host(v.source)} is not one of ${allowedHosts.join(', ')}`)
  if (typeof v.checked !== 'string' || !ISO_DATE.test(v.checked) || Number.isNaN(Date.parse(v.checked)))
    errors.push(`${path}.checked: missing or not YYYY-MM-DD`)
}

if (!Array.isArray(data.funds) || data.funds.length === 0) {
  console.error('data/etfs.json: funds must be a non-empty array')
  process.exit(1)
}

const FUND_VALUES = ['exchange', 'terPct', 'aumUsd', 'dividendYieldPct']
const UCITS_VALUES = ['isin', 'terPct']

data.funds.forEach((f, i) => {
  const p = `funds[${i}]`
  for (const k of ['ticker', 'name', 'issuer', 'issuerUrl'])
    if (typeof f[k] !== 'string' || !f[k]) errors.push(`${p}.${k}: missing`)
  if (typeof f.showOnPage !== 'boolean') errors.push(`${p}.showOnPage: must be boolean`)
  for (const k of FUND_VALUES) checkValue(`${p}.${k}`, f[k], f.issuerUrl, k)
  if (!f.ucits || typeof f.ucits !== 'object') {
    errors.push(`${p}.ucits: missing`)
  } else {
    for (const k of ['ticker', 'name', 'issuerUrl'])
      if (typeof f.ucits[k] !== 'string' || !f.ucits[k]) errors.push(`${p}.ucits.${k}: missing`)
    for (const k of UCITS_VALUES) checkValue(`${p}.ucits.${k}`, f.ucits[k], f.ucits.issuerUrl, k)
  }
})

const onPage = data.funds.filter((f) => f.showOnPage).length
if (onPage !== 3) errors.push(`exactly 3 funds must have showOnPage: true, found ${onPage}`)

if (errors.length) {
  console.error(`data/etfs.json: ${errors.length} problem(s)`)
  for (const e of errors) console.error('  - ' + e)
  process.exit(1)
}

console.table(
  data.funds.map((f) => ({
    ticker: f.ticker,
    page: f.showOnPage ? 'yes' : 'no',
    'TER %': f.terPct.value,
    UCITS: f.ucits.ticker,
    ISIN: f.ucits.isin.value,
    checked: f.terPct.checked,
  })),
)
