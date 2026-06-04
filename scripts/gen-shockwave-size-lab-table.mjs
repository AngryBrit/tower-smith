/**
 * Builds tables/labs/defense/shockwave-size.json from Shockwave Size calculator screenshots only.
 * Sources: Shockwave Size screenshot (L1–20).
 * Value +0.05/level (0.05 … 1.00).
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outPath = path.join(__dirname, '..', 'tables', 'labs', 'defense', 'shockwave-size.json')

/** [value, time, gems, coins, totalTime, totalGems, totalCoins] — screenshot L1–20 */
const BY_LEVEL = {
  1: ['0.05', '2h, 46m, 0s', '20', '100.00K', '2h, 46m, 0s', '20', '100.00K'],
  2: ['0.10', '6h, 41m, 0s', '46', '119.00K', '9h, 27m, 0s', '66', '219.00K'],
  3: ['0.15', '10h, 47m, 0s', '74', '314.98K', '20h, 14m, 0s', '140', '533.98K'],
  4: ['0.20', '15h, 31m, 0s', '106', '1.25M', '1 day, 11h, 45m, 0s', '246', '1.78M'],
  5: ['0.25', '21h, 23m, 0s', '146', '4.02M', '2 days, 9h, 8m, 0s', '392', '5.80M'],
  6: ['0.30', '1 day, 5h, 8m, 0s', '193', '10.27M', '3 days, 14h, 16m, 0s', '585', '16.07M'],
  7: ['0.35', '1 day, 15h, 34m, 0s', '254', '22.34M', '5 days, 5h, 50m, 0s', '839', '38.41M'],
  8: ['0.40', '2 days, 5h, 37m, 0s', '336', '43.21M', '7 days, 11h, 27m, 0s', '1.18K', '81.62M'],
  9: ['0.45', '3 days, 21m, 0s', '445', '76.61M', '10 days, 11h, 48m, 0s', '1.62K', '158.23M'],
  10: ['0.50', '4 days, 54m, 0s', '587', '127.02M', '14 days, 12h, 42m, 0s', '2.21K', '285.25M'],
  11: ['0.55', '5 days, 8h, 31m, 0s', '771', '199.72M', '19 days, 21h, 13m, 0s', '2.98K', '484.97M'],
  12: ['0.60', '7 days, 32m, 0s', '1.00K', '300.80M', '26 days, 21h, 45m, 0s', '3.98K', '785.77M'],
  13: ['0.65', '9 days, 2h, 24m, 0s', '1.23K', '437.21M', '36 days, 9m, 0s', '5.21K', '1.22B'],
  14: ['0.70', '11 days, 15h, 38m, 0s', '1.52K', '616.75M', '47 days, 15h, 47m, 0s', '6.73K', '1.84B'],
  15: ['0.75', '14 days, 17h, 48m, 0s', '1.86K', '848.14M', '62 days, 9h, 35m, 0s', '8.59K', '2.69B'],
  16: ['0.80', '18 days, 10h, 38m, 0s', '2.27K', '1.14B', '80 days, 20h, 13m, 0s', '10.86K', '3.83B'],
  17: ['0.85', '22 days, 19h, 52m, 0s', '2.76K', '1.51B', '103 days, 16h, 5m, 0s', '13.61K', '5.34B'],
  18: ['0.90', '27 days, 23h, 21m, 0s', '3.33K', '1.95B', '131 days, 15h, 26m, 0s', '16.94K', '7.29B'],
  19: ['0.95', '33 days, 23h, 0m, 0s', '3.84K', '2.50B', '165 days, 14h, 26m, 0s', '20.78K', '9.79B'],
  20: ['1.00', '40 days, 20h, 49m, 0s', '4.36K', '3.15B', '206 days, 11h, 15m, 0s', '25.14K', '12.94B'],
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
  name: 'Shockwave Size',
  maxLevel: 20,
  levels,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
console.log('Wrote', outPath, `(${levels.length} levels, screenshot data only)`)
