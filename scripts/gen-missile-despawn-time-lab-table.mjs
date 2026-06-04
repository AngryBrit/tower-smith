/**
 * Builds tables/labs/ultimate-weapon/missile-despawn-time.json from Missile Despawn Time screenshot only.
 * Value 1…20 (= lab level; Lv.0 benefit display is 0).
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
  'missile-despawn-time.json',
)

/** [value, time, gems, coins, totalTime, totalGems, totalCoins] — screenshot L1–20 */
const BY_LEVEL = {
  1: ['1.00', '19h, 59m, 0s', '136', '250.00K', '19h, 59m, 0s', '136', '250.00K'],
  2: ['2.00', '23h, 21m, 0s', '159', '285.00K', '1 day, 19h, 20m, 0s', '295', '535.00K'],
  3: ['3.00', '1 day, 2h, 53m, 0s', '180', '496.98K', '2 days, 22h, 13m, 0s', '475', '1.03M'],
  4: ['4.00', '1 day, 6h, 54m, 0s', '204', '1.45M', '4 days, 5h, 7m, 0s', '679', '2.48M'],
  5: ['5.00', '1 day, 11h, 49m, 0s', '232', '4.23M', '5 days, 16h, 56m, 0s', '911', '6.71M'],
  6: ['6.00', '1 day, 18h, 6m, 0s', '269', '10.50M', '7 days, 11h, 2m, 0s', '1.18K', '17.21M'],
  7: ['7.00', '2 days, 2h, 17m, 0s', '316', '22.58M', '9 days, 13h, 19m, 0s', '1.50K', '39.79M'],
  8: ['8.00', '2 days, 12h, 58m, 0s', '378', '43.47M', '12 days, 2h, 17m, 0s', '1.87K', '83.26M'],
  9: ['9.00', '3 days, 2h, 49m, 0s', '459', '76.88M', '15 days, 5h, 6m, 0s', '2.33K', '160.14M'],
  10: ['10.00', '3 days, 20h, 31m, 0s', '562', '127.31M', '19 days, 1h, 37m, 0s', '2.90K', '287.45M'],
  11: ['11.00', '4 days, 18h, 49m, 0s', '691', '200.03M', '23 days, 20h, 26m, 0s', '3.59K', '487.48M'],
  12: ['12.00', '5 days, 22h, 30m, 0s', '852', '301.12M', '29 days, 18h, 56m, 0s', '4.44K', '788.60M'],
  13: ['13.00', '7 days, 8h, 23m, 0s', '1.04K', '437.55M', '37 days, 3h, 19m, 0s', '5.48K', '1.23B'],
  14: ['14.00', '9 days, 1h, 21m, 0s', '1.23K', '617.11M', '46 days, 4h, 40m, 0s', '6.71K', '1.84B'],
  15: ['15.00', '11 days, 2h, 18m, 0s', '1.46K', '848.51M', '57 days, 6h, 58m, 0s', '8.16K', '2.69B'],
  16: ['16.00', '13 days, 12h, 9m, 0s', '1.72K', '1.14B', '70 days, 19h, 7m, 0s', '9.88K', '3.83B'],
  17: ['17.00', '16 days, 7h, 54m, 0s', '2.04K', '1.51B', '87 days, 3h, 1m, 0s', '11.92K', '5.34B'],
  18: ['18.00', '19 days, 14h, 32m, 0s', '2.40K', '1.95B', '106 days, 17h, 33m, 0s', '14.32K', '7.29B'],
  19: ['19.00', '23 days, 9h, 6m, 0s', '2.82K', '2.50B', '130 days, 2h, 39m, 0s', '17.13K', '9.79B'],
  20: ['20.00', '27 days, 16h, 40m, 0s', '3.30K', '3.15B', '157 days, 19h, 19m, 0s', '20.43K', '12.94B'],
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
  name: 'Missile Despawn Time',
  maxLevel: 20,
  levels,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
console.log('Wrote', outPath, `(${levels.length} levels, screenshot data only)`)
