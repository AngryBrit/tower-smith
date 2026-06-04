/**
 * Builds tables/labs/ultimate-weapon/missile-barrage-quantity.json from screenshot only.
 * Calculator Value 20 + 5/level (25 … 50 at L1–6); Include % off.
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
  'missile-barrage-quantity.json',
)

/** [value, time, gems, coins, totalTime, totalGems, totalCoins] — screenshot L1–6 */
const BY_LEVEL = {
  1: ['25.00', '20h, 0m, 0s', '136', '750.00K', '20h, 0m, 0s', '136', '750.00K'],
  2: ['30.00', '1 day, 18h, 14m, 0s', '269', '1.66M', '2 days, 14h, 14m, 0s', '405', '2.41M'],
  3: ['35.00', '2 days, 16h, 46m, 0s', '400', '2.86M', '5 days, 7h, 0m, 0s', '805', '5.27M'],
  4: ['40.00', '3 days, 16h, 25m, 0s', '538', '5.75M', '8 days, 23h, 25m, 0s', '1.34K', '11.02M'],
  5: ['45.00', '4 days, 18h, 36m, 0s', '690', '13.90M', '13 days, 18h, 1m, 0s', '2.03K', '24.92M'],
  6: ['50.00', '6 days, 1h, 23m, 0s', '869', '34.08M', '19 days, 19h, 24m, 0s', '2.90K', '59.00M'],
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
for (let level = 1; level <= 6; level++) {
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
  name: 'Missile Barrage Quantity',
  maxLevel: 6,
  levels,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
console.log('Wrote', outPath, `(${levels.length} levels, screenshot data only)`)
