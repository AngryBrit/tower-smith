/**
 * Builds tables/labs/defense/orb-boss-hit.json from Orb Boss Hit calculator screenshots only.
 * Sources: Orb Boss Hit screenshot (L1–10).
 * Value +0.20/level (0.20 … 2.00).
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outPath = path.join(__dirname, '..', 'tables', 'labs', 'defense', 'orb-boss-hit.json')

/** [value, time, gems, coins, totalTime, totalGems, totalCoins] — screenshot L1–10 */
const BY_LEVEL = {
  1: ['0.20', '1 day, 3h, 46m, 0s', '185', '800.00M', '1 day, 3h, 46m, 0s', '185', '800.00M'],
  2: ['0.40', '1 day, 12h, 7m, 0s', '234', '1.21B', '2 days, 15h, 53m, 0s', '419', '2.01B'],
  3: ['0.60', '1 day, 20h, 40m, 0s', '284', '1.67B', '4 days, 12h, 33m, 0s', '703', '3.68B'],
  4: ['0.80', '2 days, 5h, 47m, 0s', '337', '2.33B', '6 days, 18h, 20m, 0s', '1.04K', '6.01B'],
  5: ['1.00', '2 days, 15h, 58m, 0s', '396', '3.37B', '9 days, 10h, 18m, 0s', '1.44K', '9.38B'],
  6: ['1.20', '3 days, 3h, 49m, 0s', '465', '5.06B', '12 days, 14h, 7m, 0s', '1.90K', '14.44B'],
  7: ['1.40', '3 days, 18h, 5m, 0s', '548', '7.73B', '16 days, 8h, 12m, 0s', '2.45K', '22.17B'],
  8: ['1.60', '4 days, 11h, 32m, 0s', '649', '11.73B', '20 days, 19h, 44m, 0s', '3.10K', '33.90B'],
  9: ['1.80', '5 days, 9h, 6m, 0s', '774', '17.51B', '26 days, 4h, 50m, 0s', '3.87K', '51.41B'],
  10: ['2.00', '6 days, 11h, 45m, 0s', '929', '25.54B', '32 days, 16h, 35m, 0s', '4.80K', '76.95B'],
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
  name: 'Orb Boss Hit',
  maxLevel: 10,
  levels,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
console.log('Wrote', outPath, `(${levels.length} levels, screenshot data only)`)
