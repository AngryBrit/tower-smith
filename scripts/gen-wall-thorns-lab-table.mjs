/**
 * Builds tables/labs/defense/wall-thorns.json from Wall Thorns calculator screenshots only.
 * Sources: Wall Thorns screenshot (L1–20).
 * Value +1.00/level (1.00 … 20.00).
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outPath = path.join(__dirname, '..', 'tables', 'labs', 'defense', 'wall-thorns.json')

/** [value, time, gems, coins, totalTime, totalGems, totalCoins] — screenshot L1–20 */
const BY_LEVEL = {
  1: ['1.00', '1 day, 3h, 46m, 0s', '185', '30.00B', '1 day, 3h, 46m, 0s', '185', '30.00B'],
  2: ['2.00', '1 day, 12h, 7m, 0s', '234', '38.10B', '2 days, 15h, 53m, 0s', '419', '68.10B'],
  3: ['3.00', '1 day, 20h, 49m, 0s', '284', '46.35B', '4 days, 12h, 42m, 0s', '703', '114.45B'],
  4: ['4.00', '2 days, 6h, 58m, 0s', '343', '54.72B', '6 days, 19h, 40m, 0s', '1.05K', '169.17B'],
  5: ['5.00', '2 days, 20h, 39m, 0s', '423', '63.21B', '9 days, 16h, 19m, 0s', '1.47K', '232.38B'],
  6: ['6.00', '3 days, 17h, 8m, 0s', '542', '71.81B', '13 days, 9h, 27m, 0s', '2.01K', '304.19B'],
  7: ['7.00', '5 days, 54m, 0s', '727', '80.52B', '18 days, 10h, 21m, 0s', '2.74K', '384.71B'],
  8: ['8.00', '7 days, 1h, 48m, 0s', '1.01K', '89.32B', '25 days, 12h, 9m, 0s', '3.75K', '474.03B'],
  9: ['9.00', '10 days, 3h, 3m, 0s', '1.35K', '98.22B', '35 days, 15h, 12m, 0s', '5.09K', '572.25B'],
  10: ['10.00', '14 days, 13h, 24m, 0s', '1.84K', '107.22B', '50 days, 4h, 36m, 0s', '6.93K', '679.47B'],
  11: ['11.00', '20 days, 19h, 4m, 0s', '2.53K', '116.31B', '70 days, 23h, 40m, 0s', '9.46K', '795.78B'],
  12: ['12.00', '29 days, 7h, 56m, 0s', '3.48K', '125.49B', '100 days, 7h, 36m, 0s', '12.94K', '921.27B'],
  13: ['13.00', '40 days, 17h, 29m, 0s', '4.35K', '134.76B', '141 days, 1h, 5m, 0s', '17.28K', '1.06T'],
  14: ['14.00', '55 days, 14h, 55m, 0s', '5.45K', '144.12B', '196 days, 16h, 0m, 0s', '22.74K', '1.20T'],
  15: ['15.00', '74 days, 17h, 9m, 0s', '6.87K', '153.56B', '271 days, 9h, 9m, 0s', '29.60K', '1.35T'],
  16: ['16.00', '98 days, 18h, 54m, 0s', '8.55K', '163.09B', '1 year, 5 days, 4h, 3m, 0s', '38.16K', '1.52T'],
  17: ['17.00', '128 days, 16h, 42m, 0s', '10.44K', '172.70B', '1 year, 133 days, 20h, 45m, 0s', '48.59K', '1.69T'],
  18: ['18.00', '165 days, 8h, 56m, 0s', '12.75K', '182.40B', '1 year, 299 days, 5h, 41m, 0s', '61.34K', '1.87T'],
  19: ['19.00', '209 days, 19h, 53m, 0s', '15.55K', '192.18B', '2 years, 144 days, 1h, 34m, 0s', '76.88K', '2.06T'],
  20: ['20.00', '263 days, 3h, 46m, 0s', '18.90K', '202.03B', '3 years, 42 days, 5h, 20m, 0s', '95.79K', '2.27T'],
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
  name: 'Wall Thorns',
  maxLevel: 20,
  levels,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
console.log('Wrote', outPath, `(${levels.length} levels, screenshot data only)`)
