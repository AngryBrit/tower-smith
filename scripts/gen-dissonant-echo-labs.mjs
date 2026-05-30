/**
 * Wiki: Dissonant Echo labs (Attack / Defense / Utility / Ultimate Weapons).
 * Emits marginal DURATION (seconds) and COST, patches tower-labs.json, prints coinsToMaxRaw sum.
 *
 * Year in time = 365d (same as scripts/build-module-tower-labs.mjs).
 * Coin suffixes: q=1e15, Q=1e18, s=1e21 (marginal costs scale ×2.25 per level in table).
 *
 * Run: node scripts/gen-dissonant-echo-labs.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { touchWikiDataStamp } from './lib/wiki-data-stamp.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

/** Level → wiki Time (minutes optional; hours optional after days). */
const ROWS = [
  [1, '20d 20h', '1q'],
  [2, '41d 16h', '2.25q'],
  [3, '62d 12h', '5.06q'],
  [4, '83d 8h', '11.39q'],
  [5, '104d 4h', '25.63q'],
  [6, '125d', '57.67q'],
  [7, '145d 20h', '129.75q'],
  [8, '166d 16h', '291.93q'],
  [9, '187d 12h', '656.84q'],
  [10, '208d 8h', '1.48Q'],
  [11, '229d 4h', '3.33Q'],
  [12, '250d', '7.48Q'],
  [13, '270d 20h', '16.83Q'],
  [14, '291d 16h', '37.88Q'],
  [15, '312d 12h', '85.22Q'],
  [16, '333d 8h', '191.75Q'],
  [17, '354d 4h', '431.44Q'],
  [18, '1y 10d', '970.74Q'],
  [19, '1y 30d 20h', '2.18s'],
  [20, '1y 51d 16h', '4.91s'],
]

function parseDurationSeconds(timeRaw) {
  const s = String(timeRaw).replace(/\s+/g, ' ').trim()
  let days = 0
  let rest = s
  const yM = /^(\d+)\s*y\s+/i.exec(rest)
  if (yM) {
    days += Number.parseInt(yM[1], 10) * 365
    rest = rest.slice(yM[0].length).trim()
  }
  const dM = /^(\d+)\s*d/i.exec(rest)
  if (dM) {
    days += Number.parseInt(dM[1], 10)
    rest = rest.slice(dM[0].length).trim()
  }
  const hM = /^(\d+)\s*h/i.exec(rest)
  const hours = hM ? Number.parseInt(hM[1], 10) : 0
  if (hM) rest = rest.slice(hM[0].length).trim()
  const mM = /^(\d+)\s*m/i.exec(rest)
  const mins = mM ? Number.parseInt(mM[1], 10) : 0
  return ((days * 24 + hours) * 60 + mins) * 60
}

function parseCost(cell) {
  const t = String(cell).replace(/,/g, '').trim()
  const m = /^([\d.]+)\s*(q|Q|s)$/.exec(t)
  if (!m) throw new Error(`Bad cost: ${cell}`)
  const n = Number.parseFloat(m[1])
  const suf = m[2]
  const mult = suf === 'q' ? 1e15 : suf === 'Q' ? 1e18 : 1e21
  return Math.round(n * mult)
}

function labObject() {
  const out = {}
  for (const [lv, time, cost] of ROWS) {
    out[String(lv)] = {
      DURATION: parseDurationSeconds(time),
      COST: parseCost(cost),
    }
  }
  return out
}

function formatLabJsonBlock(name, obj) {
  const lines = [`  "${name}": {`]
  for (let i = 1; i <= 20; i++) {
    const e = obj[String(i)]
    lines.push(`    "${i}": {`)
    lines.push(`      "DURATION": ${e.DURATION},`)
    lines.push(`      "COST": ${e.COST}`)
    lines.push(`    }${i < 20 ? ',' : ''}`)
  }
  lines.push('  }')
  return lines.join('\n')
}

const oneLab = labObject()
let sumCost = 0
for (let i = 1; i <= 20; i++) sumCost += oneLab[String(i)].COST

const names = [
  'Dissonant Echo - Attack',
  'Dissonant Echo - Defense',
  'Dissonant Echo - Utility',
  'Dissonant Echo - Ultimate Weapons',
]

const insert = names.map((n) => formatLabJsonBlock(n, oneLab)).join(',\n')

const labsPath = path.join(root, 'src', 'data', 'tower-labs.json')
let labsText = fs.readFileSync(labsPath, 'utf8')

if (labsText.includes('"Dissonant Echo - Attack"')) {
  console.log('tower-labs.json already has Dissonant Echo labs; skip patch.')
  process.exit(0)
}

const needle = `    "100": {
      "DURATION": 9330780,
      "COST": 190720000000000000000
    }
  }
}
`

if (!labsText.endsWith(needle) && !labsText.endsWith(needle.trimEnd() + '\r\n')) {
  console.error('Expected EOF (Enhancement Utility L100) not found; abort.')
  process.exit(1)
}

const normalized = labsText.endsWith(needle)
  ? labsText
  : labsText.replace(/\r\n/g, '\n')
if (!normalized.endsWith(needle)) {
  console.error('EOF needle mismatch after CRLF normalize')
  process.exit(1)
}

const replacement =
  `    "100": {
      "DURATION": 9330780,
      "COST": 190720000000000000000
    }
  },
` +
  insert +
  `
}`

const outText = normalized.slice(0, -needle.length) + replacement
fs.writeFileSync(labsPath, outText, 'utf8')

console.log('Patched', labsPath)
console.log('coinsToMaxRaw (one lab, sum L1..L20):', sumCost)
console.log('L1 DURATION', oneLab['1'].DURATION, 'COST', oneLab['1'].COST)
console.log('L20', oneLab['20'])
touchWikiDataStamp('gen-dissonant-echo-labs')
