/**
 * Builds tables/labs/card-mastery/demon-mode-mastery.json from screenshot only.
 * Calculator Value 2.00 + 0.50/level (2.00 … 6.00 at L1–9); coins in q; Include % off.
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
  'card-mastery',
  'demon-mode-mastery.json',
)

/** [value, time, gems, coins, totalTime, totalGems, totalCoins] — screenshot L1–9 */
const BY_LEVEL = {
  1: ['2.00', '20 days, 20h, 0m, 0s', '2.53K', '1.10q', '20 days, 20h, 0m, 0s', '2.53K', '1.10q'],
  2: ['2.50', '31 days, 6h, 0m, 0s', '3.64K', '1.30q', '52 days, 2h, 0m, 0s', '6.18K', '2.40q'],
  3: ['3.00', '41 days, 16h, 0m, 0s', '4.42K', '2.00q', '93 days, 18h, 0m, 0s', '10.59K', '4.40q'],
  4: ['3.50', '52 days, 2h, 0m, 0s', '5.19K', '3.40q', '145 days, 20h, 0m, 0s', '15.78K', '7.80q'],
  5: ['4.00', '62 days, 12h, 0m, 0s', '5.96K', '5.60q', '208 days, 8h, 0m, 0s', '21.74K', '13.40q'],
  6: ['4.50', '72 days, 22h, 0m, 0s', '6.73K', '7.70q', '281 days, 6h, 0m, 0s', '28.48K', '21.10q'],
  7: ['5.00', '83 days, 8h, 0m, 0s', '7.51K', '9.10q', '364 days, 14h, 0m, 0s', '35.98K', '30.20q'],
  8: ['5.50', '93 days, 18h, 0m, 0s', '8.24K', '9.80q', '1 year, 93 days, 8h, 0m, 0s', '44.22K', '40.00q'],
  9: ['6.00', '104 days, 4h, 0m, 0s', '8.89K', '10.00q', '1 year, 197 days, 12h, 0m, 0s', '53.11K', '50.00q'],
}

function parseAbbrevNum(raw) {
  const s = String(raw).trim().replace(/,/g, '')
  if (/q$/i.test(s)) return Math.round(parseFloat(s) * 1_000_000_000_000_000)
  if (/T$/i.test(s)) return Math.round(parseFloat(s) * 1_000_000_000_000)
  if (/B$/i.test(s)) return Math.round(parseFloat(s) * 1_000_000_000)
  if (/M$/i.test(s)) return Math.round(parseFloat(s) * 1_000_000)
  if (/K$/i.test(s)) return Math.round(parseFloat(s) * 1_000)
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
for (let level = 1; level <= 9; level++) {
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
  name: 'Demon Mode Mastery',
  maxLevel: 9,
  levels,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
console.log('Wrote', outPath, `(${levels.length} levels, screenshot data only)`)
