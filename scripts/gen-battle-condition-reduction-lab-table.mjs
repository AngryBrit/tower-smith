/**
 * Builds tables/labs/battle-condition/battle-condition-reduction.json from screenshot only.
 * Coins: lowercase q = 1e15, uppercase Q = 1e18.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outPath = path.join(
  __dirname,
  '..',
  'tables',
  'labs',
  'battle-condition',
  'battle-condition-reduction.json',
)

/** [value, time, gems, coins, totalTime, totalGems, totalCoins] — screenshot L1–10 */
const BY_LEVEL = {
  1: ['1.00', '16 days, 16h, 0m, 0s', '2.07K', '1.00q', '16 days, 16h, 0m, 0s', '2.07K', '1.00q'],
  2: ['2.00', '33 days, 8h, 0m, 0s', '3.80K', '2.10q', '50 days, 0s', '5.87K', '3.10q'],
  3: ['3.00', '50 days, 0s', '5.03K', '4.20q', '100 days, 0s', '10.90K', '7.30q'],
  4: ['4.00', '66 days, 16h, 0m, 0s', '6.27K', '8.60q', '166 days, 16h, 0m, 0s', '17.17K', '15.90q'],
  5: ['5.00', '83 days, 8h, 0m, 0s', '7.51K', '17.70q', '250 days, 0s', '24.68K', '33.60q'],
  6: ['6.00', '100 days, 0s', '8.63K', '36.20q', '350 days, 0s', '33.31K', '69.80q'],
  7: ['7.00', '116 days, 16h, 0m, 0s', '9.68K', '74.20q', '1 year, 101 days, 16h, 0s', '42.99K', '144.00q'],
  8: ['8.00', '133 days, 8h, 0m, 0s', '10.73K', '152.20q', '1 year, 235 days, 0s', '53.72K', '296.20q'],
  9: ['9.00', '150 days, 0s', '11.78K', '311.90q', '2 years, 20 days, 0s', '65.50K', '608.10q'],
  10: ['10.00', '166 days, 16h, 0m, 0s', '12.83K', '639.40q', '2 years, 186 days, 16h, 0s', '78.33K', '1.25Q'],
}

function parseAbbrevNum(raw) {
  const s = String(raw).trim().replace(/,/g, '')
  if (/Q$/.test(s)) return Math.round(parseFloat(s) * 1_000_000_000_000_000_000)
  if (/q$/.test(s)) return Math.round(parseFloat(s) * 1_000_000_000_000_000)
  if (/T$/.test(s)) return Math.round(parseFloat(s) * 1_000_000_000_000)
  if (/B$/.test(s)) return Math.round(parseFloat(s) * 1_000_000_000)
  if (/K$/.test(s)) return Math.round(parseFloat(s) * 1_000)
  const n = Number(s)
  return Number.isFinite(n) ? Math.round(n) : 0
}

function parseTimeToSeconds(display) {
  let sec = 0
  const year = display.match(/(\d+)\s*years?/i)
  const day = display.match(/(\d+)\s*days?/i)
  const hour = display.match(/(\d+)h\b/i)
  const min = display.match(/(\d+)m\b/i)
  const secPart = display.match(/(\d+)s\b/i)
  if (year) sec += Number(year[1]) * 365 * 86400
  if (day) sec += Number(day[1]) * 86400
  if (hour) sec += Number(hour[1]) * 3600
  if (min) sec += Number(min[1]) * 60
  if (secPart) sec += Number(secPart[1])
  return sec
}

const levels = []
for (let level = 1; level <= 10; level++) {
  const row = BY_LEVEL[level]
  if (!row) throw new Error(`Missing screenshot row for level ${level}`)
  const [value, time, gems, coins, totalTime, totalGems, totalCoins] = row
  levels.push({
    level,
    value: parseFloat(value),
    time: { display: time, seconds: parseTimeToSeconds(time) },
    gems: parseAbbrevNum(gems),
    coins: parseAbbrevNum(coins),
    totalTime: { display: totalTime, seconds: parseTimeToSeconds(totalTime) },
    totalGems: parseAbbrevNum(totalGems),
    totalCoins: parseAbbrevNum(totalCoins),
  })
}

const doc = {
  name: 'Battle Condition Reduction',
  maxLevel: 10,
  levels,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
console.log('Wrote', outPath, `(${levels.length} levels, screenshot data only)`)
