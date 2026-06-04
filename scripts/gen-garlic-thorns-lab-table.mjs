/**
 * Builds tables/labs/defense/garlic-thorns.json from Garlic Thorns calculator screenshots only.
 * Sources: Garlic Thorns screenshot (L1–10).
 * Value +0.50/level (0.50 … 5.00).
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outPath = path.join(__dirname, '..', 'tables', 'labs', 'defense', 'garlic-thorns.json')

/** [value, time, gems, coins, totalTime, totalGems, totalCoins] — screenshot L1–10 */
const BY_LEVEL = {
  1: ['0.50', '1 day, 3h, 13m, 19s', '182', '4.50K', '1 day, 3h, 13m, 19s', '182', '4.50K'],
  2: ['1.00', '1 day, 6h, 5m, 0s', '199', '7.10K', '2 days, 9h, 18m, 19s', '381', '11.60K'],
  3: ['1.50', '1 day, 9h, 49m, 8s', '221', '13.30K', '3 days, 19h, 7m, 27s', '602', '24.90K'],
  4: ['2.00', '1 day, 14h, 59m, 53s', '251', '26.70K', '5 days, 10h, 7m, 20s', '853', '51.60K'],
  5: ['2.50', '1 day, 22h, 5m, 56s', '292', '50.90K', '7 days, 8h, 13m, 16s', '1.15K', '102.50K'],
  6: ['3.00', '2 days, 7h, 33m, 10s', '347', '89.50K', '9 days, 15h, 46m, 26s', '1.49K', '192.00K'],
  7: ['3.50', '2 days, 19h, 45m, 29s', '418', '146.10K', '12 days, 11h, 31m, 55s', '1.91K', '338.10K'],
  8: ['4.00', '3 days, 11h, 5m, 25s', '507', '224.30K', '15 days, 22h, 37m, 20s', '2.42K', '562.40K'],
  9: ['4.50', '4 days, 5h, 54m, 21s', '616', '327.70K', '20 days, 4h, 31m, 41s', '3.03K', '890.10K'],
  10: ['5.00', '5 days, 4h, 32m, 48s', '748', '459.90K', '25 days, 9h, 4m, 29s', '3.78K', '1.35M'],
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
  name: 'Garlic Thorns',
  maxLevel: 10,
  levels,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
console.log('Wrote', outPath, `(${levels.length} levels, screenshot data only)`)
