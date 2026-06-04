/**
 * Builds tables/labs/ultimate-weapon/missile-radius.json from Missile Radius screenshot only.
 * Value 0.30 + 0.05/level (0.35 … 1.30 at L1–20); Include % off in calculator UI.
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
  'ultimate-weapon',
  'missile-radius.json',
)

/** [value, time, gems, coins, totalTime, totalGems, totalCoins] — screenshot L1–20 */
const BY_LEVEL = {
  1: ['0.35', '1 day, 14h, 53m, 0s', '250', '800.00K', '1 day, 14h, 53m, 0s', '250', '800.00K'],
  2: ['0.40', '1 day, 18h, 14m, 0s', '269', '835.00K', '3 days, 9h, 7m, 0s', '519', '1.64M'],
  3: ['0.45', '1 day, 21h, 46m, 0s', '290', '1.05M', '5 days, 6h, 53m, 0s', '809', '2.69M'],
  4: ['0.50', '2 days, 1h, 47m, 0s', '313', '2.00M', '7 days, 8h, 40m, 0s', '1.12K', '4.68M'],
  5: ['0.55', '2 days, 6h, 42m, 0s', '342', '4.78M', '9 days, 15h, 22m, 0s', '1.46K', '9.47M'],
  6: ['0.60', '2 days, 12h, 59m, 0s', '378', '11.05M', '12 days, 4h, 21m, 0s', '1.84K', '20.52M'],
  7: ['0.65', '2 days, 21h, 10m, 0s', '426', '23.13M', '15 days, 1h, 31m, 0s', '2.27K', '43.65M'],
  8: ['0.70', '3 days, 7h, 52m, 0s', '488', '44.02M', '18 days, 9h, 23m, 0s', '2.76K', '87.67M'],
  9: ['0.75', '3 days, 21h, 42m, 0s', '569', '77.43M', '22 days, 7h, 5m, 0s', '3.33K', '165.10M'],
  10: ['0.80', '4 days, 15h, 24m, 0s', '672', '127.86M', '26 days, 22h, 29m, 0s', '4.00K', '292.96M'],
  11: ['0.85', '5 days, 13h, 42m, 0s', '801', '200.58M', '32 days, 12h, 11m, 0s', '4.80K', '493.54M'],
  12: ['0.90', '6 days, 17h, 23m, 0s', '962', '301.67M', '39 days, 5h, 34m, 0s', '5.76K', '795.21M'],
  13: ['0.95', '8 days, 3h, 16m, 0s', '1.13K', '438.10M', '47 days, 8h, 50m, 0s', '6.89K', '1.23B'],
  14: ['1.00', '9 days, 20h, 14m, 0s', '1.32K', '617.66M', '57 days, 5h, 4m, 0s', '8.20K', '1.85B'],
  15: ['1.05', '11 days, 21h, 11m, 0s', '1.54K', '849.06M', '69 days, 2h, 15m, 0s', '9.74K', '2.70B'],
  16: ['1.10', '14 days, 7h, 3m, 0s', '1.81K', '1.14B', '83 days, 9h, 18m, 0s', '11.55K', '3.84B'],
  17: ['1.15', '17 days, 2h, 48m, 0s', '2.12K', '1.51B', '100 days, 12h, 6m, 0s', '13.68K', '5.35B'],
  18: ['1.20', '20 days, 9h, 26m, 0s', '2.49K', '1.96B', '120 days, 21h, 32m, 0s', '16.16K', '7.31B'],
  19: ['1.25', '24 days, 4h, 0m, 0s', '2.90K', '2.50B', '145 days, 1h, 32m, 0s', '19.06K', '9.81B'],
  20: ['1.30', '28 days, 11h, 33m, 0s', '3.38K', '3.15B', '173 days, 13h, 5m, 0s', '22.45K', '12.96B'],
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
  name: 'Missile Radius',
  maxLevel: 20,
  levels,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
console.log('Wrote', outPath, `(${levels.length} levels, screenshot data only)`)
