/**
 * Builds tables/labs/cards/second-wind-blast.json from screenshot only.
 * Calculator Value 0.25 × level (0.25 … 1.00 at L1–4); Include % off.
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
  'cards',
  'second-wind-blast.json',
)

/** [value, time, gems, coins, totalTime, totalGems, totalCoins] — screenshot L1–4 */
const BY_LEVEL = {
  1: [
    '0.25',
    '1 day, 3h, 46m, 0s',
    '185',
    '1.80M',
    '1 day, 3h, 46m, 0s',
    '185',
    '1.80M',
  ],
  2: [
    '0.50',
    '1 day, 17h, 39m, 0s',
    '266',
    '3.00M',
    '2 days, 21h, 25m, 0s',
    '451',
    '4.80M',
  ],
  3: [
    '0.75',
    '2 days, 7h, 33m, 0s',
    '347',
    '4.50M',
    '5 days, 4h, 58m, 0s',
    '798',
    '9.30M',
  ],
  4: [
    '1.00',
    '3 days, 11h, 19m, 0s',
    '508',
    '75.00M',
    '8 days, 16h, 17m, 0s',
    '1.31K',
    '84.30M',
  ],
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
for (let level = 1; level <= 4; level++) {
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
  name: 'Second Wind Blast',
  maxLevel: 4,
  levels,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
console.log('Wrote', outPath, `(${levels.length} levels, screenshot data only)`)
