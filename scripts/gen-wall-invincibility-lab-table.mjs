/**
 * Builds tables/labs/defense/wall-invincibility.json from Wall Invincibility calculator screenshots only.
 * Sources: Wall Invincibility screenshot (L1–10).
 * Value +1.00/level (1.00 … 10.00).
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outPath = path.join(__dirname, '..', 'tables', 'labs', 'defense', 'wall-invincibility.json')

/** [value, time, gems, coins, totalTime, totalGems, totalCoins] — screenshot L1–10 */
const BY_LEVEL = {
  1: ['1.00', '3d, 11h, 19m, 0s', '508', '300.00B', '3d, 11h, 19m, 0s', '508', '300.00B'],
  2: ['2.00', '4d, 1h, 14m, 0s', '589', '351.00B', '7d, 12h, 33m, 0s', '1.10K', '651.00B'],
  3: ['3.00', '4d, 15h, 29m, 0s', '672', '403.03B', '12d, 4h, 2m, 0s', '1.77K', '1.05T'],
  4: ['4.00', '5d, 7h, 11m, 0s', '763', '455.80B', '17d, 11h, 13m, 0s', '2.53K', '1.51T'],
  5: ['5.00', '6d, 2h, 26m, 0s', '875', '509.19B', '23d, 13h, 39m, 0s', '3.41K', '2.02T'],
  6: ['6.00', '7d, 4h, 28m, 0s', '1.02K', '563.13B', '30d, 18h, 7m, 0s', '4.43K', '2.58T'],
  7: ['7.00', '8d, 17h, 48m, 0s', '1.19K', '617.58B', '39d, 11h, 55m, 0s', '5.62K', '3.20T'],
  8: ['8.00', '11d, 15m, 0s', '1.45K', '672.50B', '50d, 12h, 10m, 0s', '7.07K', '3.87T'],
  9: ['9.00', '14d, 7h, 3m, 0s', '1.81K', '727.86B', '64d, 19h, 13m, 0s', '8.88K', '4.60T'],
  10: ['10.00', '18d, 22h, 57m, 0s', '2.33K', '783.63B', '83d, 18h, 10m, 0s', '11.20K', '5.38T'],
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

/** Calculator uses `3d` as well as `3 days` for day units. */
function parseTimeToSeconds(display) {
  let sec = 0
  const year = display.match(/(\d+)\s*years?/i)
  const day = display.match(/(\d+)\s*(?:days?|d)(?=[,\s]|$)/i)
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
  name: 'Wall Invincibility',
  maxLevel: 10,
  levels,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
console.log('Wrote', outPath, `(${levels.length} levels, screenshot data only)`)
