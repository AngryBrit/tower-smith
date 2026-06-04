/**
 * Builds tables/labs/ultimate-weapon/shock-multiplier.json from Shock Multiplier screenshot only.
 * Value x1.10 + 0.04/level in UI (1.14 … 1.66 at L1–14); same cost ladder as Shock Chance L1–14.
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
  'shock-multiplier.json',
)

/** [value, time, gems, coins, totalTime, totalGems, totalCoins] — screenshot L1–14 */
const BY_LEVEL = {
  1: ['1.14', '20h, 0m, 0s', '136', '250.00K', '20h, 0m, 0s', '136', '250.00K'],
  2: ['1.18', '1 day, 4h, 21m, 0s', '189', '560.00K', '2 days, 21m, 0s', '325', '810.00K'],
  3: ['1.22', '1 day, 12h, 53m, 0s', '238', '1.10M', '3 days, 13h, 14m, 0s', '563', '1.91M'],
  4: ['1.26', '1 day, 21h, 54m, 0s', '291', '2.80M', '5 days, 11h, 8m, 0s', '854', '4.71M'],
  5: ['1.30', '2 days, 7h, 49m, 0s', '348', '7.75M', '7 days, 18h, 57m, 0s', '1.20K', '12.46M'],
  6: ['1.34', '2 days, 19h, 6m, 0s', '414', '19.54M', '10 days, 14h, 3m, 0s', '1.62K', '32.00M'],
  7: ['1.38', '3 days, 8h, 17m, 0s', '491', '43.58M', '13 days, 22h, 20m, 0s', '2.11K', '75.58M'],
  8: ['1.42', '3 days, 23h, 58m, 0s', '582', '87.41M', '17 days, 22h, 18m, 0s', '2.69K', '162.99M'],
  9: ['1.46', '4 days, 18h, 49m, 0s', '691', '160.91M', '22 days, 17h, 7m, 0s', '3.38K', '323.90M'],
  10: ['1.50', '5 days, 17h, 31m, 0s', '823', '276.62M', '28 days, 10h, 38m, 0s', '4.20K', '600.52M'],
  11: ['1.54', '6 days, 20h, 49m, 0s', '982', '449.93M', '35 days, 7h, 27m, 0s', '5.19K', '1.05B'],
  12: ['1.58', '8 days, 5h, 30m, 0s', '1.14K', '699.34M', '43 days, 12h, 57m, 0s', '6.32K', '1.75B'],
  13: ['1.62', '9 days, 20h, 23m, 0s', '1.32K', '1.05B', '53 days, 9h, 20m, 0s', '7.64K', '2.80B'],
  14: ['1.66', '11 days, 18h, 21m, 0s', '1.53K', '1.52B', '65 days, 3h, 41m, 0s', '9.17K', '4.32B'],
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
for (let level = 1; level <= 14; level++) {
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
  name: 'Shock Multiplier',
  maxLevel: 14,
  levels,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
console.log('Wrote', outPath, `(${levels.length} levels, screenshot data only)`)
