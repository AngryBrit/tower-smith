/**
 * Builds tables/labs/defense/orbs-speed.json from Orbs Speed calculator screenshots only.
 * Sources: Orbs Speed screenshot (L1–20).
 * Value +0.10/level (0.10 … 2.00).
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outPath = path.join(__dirname, '..', 'tables', 'labs', 'defense', 'orbs-speed.json')

/** [value, time, gems, coins, totalTime, totalGems, totalCoins] — screenshot L1–20 */
const BY_LEVEL = {
  1: ['0.10', '1h, 19m, 0s', '10', '15.00K', '1h, 19m, 0s', '10', '15.00K'],
  2: ['0.20', '3h, 1m, 0s', '22', '22.50K', '4h, 20m, 0s', '32', '37.50K'],
  3: ['0.30', '4h, 52m, 0s', '34', '105.74K', '9h, 12m, 0s', '66', '143.24K'],
  4: ['0.40', '7h, 8m, 0s', '49', '474.53K', '16h, 20m, 0s', '115', '617.77K'],
  5: ['0.50', '10h, 10m, 0s', '70', '1.50M', '1 day, 2h, 30m, 0s', '185', '2.12M'],
  6: ['0.60', '14h, 17m, 0s', '98', '3.70M', '1 day, 16h, 47m, 0s', '283', '5.82M'],
  7: ['0.70', '19h, 56m, 0s', '136', '7.78M', '2 days, 12h, 43m, 0s', '419', '13.60M'],
  8: ['0.80', '1 day, 3h, 31m, 0s', '184', '14.62M', '3 days, 16h, 14m, 0s', '603', '28.22M'],
  9: ['0.90', '1 day, 13h, 32m, 0s', '242', '25.25M', '5 days, 5h, 46m, 0s', '845', '53.47M'],
  10: ['1.00', '2 days, 2h, 28m, 0s', '317', '40.90M', '7 days, 8h, 14m, 0s', '1.16K', '94.37M'],
  11: ['1.10', '2 days, 18h, 50m, 0s', '412', '62.99M', '10 days, 3h, 4m, 0s', '1.57K', '157.36M'],
  12: ['1.20', '3 days, 15h, 12m, 0s', '531', '93.08M', '13 days, 18h, 16m, 0s', '2.11K', '250.44M'],
  13: ['1.30', '4 days, 16h, 7m, 0s', '676', '132.97M', '18 days, 10h, 23m, 0s', '2.78K', '383.41M'],
  14: ['1.40', '5 days, 22h, 10m, 0s', '850', '184.61M', '24 days, 8h, 33m, 0s', '3.63K', '568.02M'],
  15: ['1.50', '7 days, 9h, 59m, 0s', '1.05K', '250.14M', '31 days, 18h, 32m, 0s', '4.68K', '818.16M'],
  16: ['1.60', '9 days, 4h, 12m, 0s', '1.24K', '331.90M', '40 days, 22h, 44m, 0s', '5.92K', '1.15B'],
  17: ['1.70', '11 days, 5h, 26m, 0s', '1.47K', '432.43M', '52 days, 4h, 10m, 0s', '7.39K', '1.58B'],
  18: ['1.80', '13 days, 14h, 22m, 0s', '1.73K', '554.44M', '65 days, 18h, 32m, 0s', '9.12K', '2.14B'],
  19: ['1.90', '16 days, 7h, 40m, 0s', '2.03K', '700.85M', '82 days, 2h, 12m, 0s', '11.16K', '2.84B'],
  20: ['2.00', '19 days, 10h, 10m, 0s', '2.38K', '874.76M', '101 days, 12h, 22m, 0s', '13.53K', '3.71B'],
}

function parseAbbrevNum(raw) {
  const s = String(raw).trim().replace(/,/g, '')
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
for (let level = 1; level <= 20; level++) {
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
  name: 'Orbs Speed',
  maxLevel: 20,
  levels,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
console.log('Wrote', outPath, `(${levels.length} levels, screenshot data only)`)
