/**
 * Builds tables/labs/defense/land-mine-damage.json from Land Mine Damage calculator screenshots only.
 * Sources: Land Mine Damage screenshot (L1–20).
 * Value +10.00/level (10.00 … 200.00).
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outPath = path.join(__dirname, '..', 'tables', 'labs', 'defense', 'land-mine-damage.json')

/** [value, time, gems, coins, totalTime, totalGems, totalCoins] — screenshot L1–20 */
const BY_LEVEL = {
  1: ['10.00', '1h, 39m, 0s', '12', '25.00K', '1h, 39m, 0s', '12', '25.00K'],
  2: ['20.00', '5h, 1m, 0s', '35', '40.00K', '6h, 40m, 0s', '47', '65.00K'],
  3: ['30.00', '8h, 33m, 0s', '59', '231.98K', '15h, 13m, 0s', '106', '296.98K'],
  4: ['40.00', '12h, 34m, 0s', '86', '1.17M', '1 day, 3h, 47m, 0s', '192', '1.47M'],
  5: ['50.00', '17h, 29m, 0s', '119', '3.93M', '1 day, 21h, 16m, 0s', '311', '5.40M'],
  6: ['60.00', '23h, 46m, 0s', '162', '10.18M', '2 days, 21h, 2m, 0s', '473', '15.58M'],
  7: ['70.00', '1 day, 7h, 57m, 0s', '210', '22.24M', '4 days, 4h, 59m, 0s', '683', '37.82M'],
  8: ['80.00', '1 day, 18h, 38m, 0s', '272', '43.10M', '5 days, 23h, 37m, 0s', '955', '80.92M'],
  9: ['90.00', '2 days, 8h, 29m, 0s', '352', '76.50M', '8 days, 8h, 6m, 0s', '1.31K', '157.42M'],
  10: ['100.00', '3 days, 2h, 11m, 0s', '455', '126.91M', '11 days, 10h, 17m, 0s', '1.76K', '284.33M'],
  11: ['110.00', '4 days, 29m, 0s', '585', '199.60M', '15 days, 10h, 46m, 0s', '2.35K', '483.93M'],
  12: ['120.00', '5 days, 4h, 10m, 0s', '746', '300.68M', '20 days, 14h, 56m, 0s', '3.09K', '784.61M'],
  13: ['130.00', '6 days, 14h, 3m, 0s', '943', '437.08M', '27 days, 4h, 59m, 0s', '4.04K', '1.22B'],
  14: ['140.00', '8 days, 7h, 1m, 0s', '1.14K', '616.62M', '35 days, 12h, 0m, 0s', '5.18K', '1.84B'],
  15: ['150.00', '10 days, 7h, 58m, 0s', '1.37K', '848.01M', '45 days, 19h, 58m, 0s', '6.55K', '2.69B'],
  16: ['160.00', '12 days, 17h, 49m, 0s', '1.64K', '1.14B', '58 days, 13h, 47m, 0s', '8.19K', '3.83B'],
  17: ['170.00', '15 days, 13h, 34m, 0s', '1.95K', '1.51B', '74 days, 3h, 21m, 0s', '10.14K', '5.34B'],
  18: ['180.00', '18 days, 20h, 12m, 0s', '2.31K', '1.95B', '92 days, 23h, 33m, 0s', '12.45K', '7.29B'],
  19: ['190.00', '22 days, 14h, 46m, 0s', '2.73K', '2.50B', '115 days, 14h, 19m, 0s', '15.18K', '9.79B'],
  20: ['200.00', '26 days, 22h, 20m, 0s', '3.21K', '3.15B', '142 days, 12h, 39m, 0s', '18.39K', '12.94B'],
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
  name: 'Land Mine Damage',
  maxLevel: 20,
  levels,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
console.log('Wrote', outPath, `(${levels.length} levels, screenshot data only)`)
