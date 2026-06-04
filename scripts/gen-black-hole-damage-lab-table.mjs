/**
 * Builds tables/labs/ultimate-weapon/black-hole-damage.json from Black Hole Damage screenshot only.
 * Calculator Value 0.20%/level (0.20 … 2.00 at L1–10); Golden Tower–style time/gem ladder, unique coins.
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
  'black-hole-damage.json',
)

/** [value, time, gems, coins, totalTime, totalGems, totalCoins] — screenshot L1–10 */
const BY_LEVEL = {
  1: ['0.20', '1 day, 15h, 59m, 0s', '256', '20.00M', '1 day, 15h, 59m, 0s', '256', '20.00M'],
  2: ['0.40', '2 days, 21m, 0s', '305', '20.81M', '3 days, 16h, 20m, 0s', '561', '40.81M'],
  3: ['0.60', '2 days, 8h, 53m, 0s', '355', '21.85M', '6 days, 1h, 13m, 0s', '916', '62.66M'],
  4: ['0.80', '2 days, 17h, 54m, 0s', '407', '24.05M', '8 days, 19h, 7m, 0s', '1.32K', '86.71M'],
  5: ['1.00', '3 days, 3h, 49m, 0s', '465', '29.50M', '11 days, 22h, 56m, 0s', '1.79K', '116.21M'],
  6: ['1.20', '3 days, 15h, 6m, 0s', '530', '41.79M', '15 days, 14h, 2m, 0s', '2.32K', '158.00M'],
  7: ['1.40', '4 days, 4h, 17m, 0s', '607', '66.33M', '19 days, 18h, 19m, 0s', '2.93K', '224.33M'],
  8: ['1.60', '4 days, 19h, 58m, 0s', '698', '110.66M', '24 days, 14h, 17m, 0s', '3.62K', '334.99M'],
  9: ['1.80', '5 days, 14h, 49m, 0s', '808', '184.66M', '30 days, 5h, 6m, 0s', '4.43K', '519.65M'],
  10: ['2.00', '6 days, 13h, 31m, 0s', '940', '300.87M', '36 days, 18h, 37m, 0s', '5.37K', '820.52M'],
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
  name: 'Black Hole Damage',
  maxLevel: 10,
  levels,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
console.log('Wrote', outPath, `(${levels.length} levels, screenshot data only)`)
