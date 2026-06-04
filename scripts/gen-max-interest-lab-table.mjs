/**
 * Builds tables/labs/utility/max-interest.json from Max Interest calculator screenshot only.
 * Value column: $100 … $15000 at L1–15 (benefit display uses L0=$50 via research.ts).
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outPath = path.join(__dirname, '..', 'tables', 'labs', 'utility', 'max-interest.json')

/** [value, time, gems, coins, totalTime, totalGems, totalCoins] — screenshot L1–15 */
const BY_LEVEL = {
  1: ['100.00', '41m, 39s', '6', '250', '41m, 39s', '6', '250'],
  2: ['200.00', '1h, 9m, 0s', '9', '910', '1h, 50m, 39s', '15', '1.16K'],
  3: ['300.00', '2h, 8m, 0s', '16', '2.13K', '3h, 58m, 39s', '31', '3.29K'],
  4: ['500.00', '4h, 33m, 0s', '32', '4.86K', '8h, 31m, 39s', '63', '8.15K'],
  5: ['700.00', '9h, 42m, 0s', '67', '10.33K', '18h, 13m, 39s', '130', '18.48K'],
  6: ['1000.00', '19h, 11m, 0s', '131', '20.02K', '1 day, 13h, 24m, 39s', '261', '38.50K'],
  7: ['1500.00', '1 day, 10h, 50m, 0s', '226', '35.60K', '3 days, 14m, 39s', '487', '74.10K'],
  8: ['2000.00', '2 days, 10h, 43m, 0s', '365', '58.90K', '5 days, 10h, 57m, 39s', '852', '133.00K'],
  9: ['2500.00', '3 days, 21h, 10m, 0s', '566', '91.94K', '9 days, 8h, 7m, 39s', '1.42K', '224.94K'],
  10: ['3500.00', '5 days, 20h, 39m, 0s', '842', '136.87K', '15 days, 4h, 46m, 39s', '2.26K', '361.81K'],
  11: ['5000.00', '8 days, 11h, 54m, 0s', '1.17K', '195.99K', '23 days, 16h, 40m, 39s', '3.43K', '557.80K'],
  12: ['7500.00', '11 days, 21h, 48m, 0s', '1.55K', '271.72K', '35 days, 14h, 28m, 39s', '4.97K', '829.52K'],
  13: ['10000.00', '16 days, 5h, 25m, 0s', '2.02K', '366.61K', '51 days, 19h, 53m, 39s', '6.99K', '1.20M'],
  14: ['12500.00', '21 days, 13h, 39m, 0s', '2.62K', '483.33K', '73 days, 9h, 32m, 39s', '9.61K', '1.68M'],
  15: ['15000.00', '28 days, 2h, 55m, 0s', '3.34K', '624.68K', '101 days, 12h, 27m, 39s', '12.95K', '2.30M'],
}

function parseAbbrevNum(raw) {
  const s = String(raw).trim().replace(/,/g, '')
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
for (let level = 1; level <= 15; level++) {
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
  name: 'Max Interest',
  maxLevel: 15,
  levels,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
console.log('Wrote', outPath, `(${levels.length} levels, screenshot data only)`)
