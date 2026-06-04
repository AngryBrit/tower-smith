/**
 * Builds tables/labs/ultimate-weapon/missile-amplifier.json from Missile Amplifier screenshot only.
 * Calculator Value 1.00 + 1.50/level in UI (2.50 … 38.50 at L1–25); Include % off.
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
  'missile-amplifier.json',
)

/** [value, time, gems, coins, totalTime, totalGems, totalCoins] — screenshot L1–25 */
const BY_LEVEL = {
  1: ['2.50', '19h, 59m, 0s', '136', '500.00K', '19h, 59m, 0s', '136', '500.00K'],
  2: ['4.00', '1 day, 4h, 21m, 0s', '189', '860.00K', '2 days, 20m, 0s', '325', '1.36M'],
  3: ['5.50', '1 day, 12h, 53m, 0s', '238', '1.45M', '3 days, 13h, 13m, 0s', '563', '2.81M'],
  4: ['7.00', '1 day, 21h, 54m, 0s', '291', '3.20M', '5 days, 11h, 7m, 0s', '854', '6.01M'],
  5: ['8.50', '2 days, 7h, 49m, 0s', '348', '8.20M', '7 days, 18h, 56m, 0s', '1.20K', '14.21M'],
  6: ['10.00', '2 days, 19h, 6m, 0s', '414', '20.04M', '10 days, 14h, 2m, 0s', '1.62K', '34.25M'],
  7: ['11.50', '3 days, 8h, 17m, 0s', '491', '44.13M', '13 days, 22h, 19m, 0s', '2.11K', '78.38M'],
  8: ['13.00', '3 days, 23h, 58m, 0s', '582', '88.01M', '17 days, 22h, 17m, 0s', '2.69K', '166.39M'],
  9: ['14.50', '4 days, 18h, 49m, 0s', '691', '161.56M', '22 days, 17h, 6m, 0s', '3.38K', '327.95M'],
  10: ['16.00', '5 days, 17h, 31m, 0s', '823', '277.32M', '28 days, 10h, 37m, 0s', '4.20K', '605.27M'],
  11: ['17.50', '6 days, 20h, 49m, 0s', '982', '450.68M', '35 days, 7h, 26m, 0s', '5.19K', '1.06B'],
  12: ['19.00', '8 days, 5h, 30m, 0s', '1.14K', '700.14M', '43 days, 12h, 56m, 0s', '6.32K', '1.76B'],
  13: ['20.50', '9 days, 20h, 23m, 0s', '1.32K', '1.05B', '53 days, 9h, 19m, 0s', '7.64K', '2.81B'],
  14: ['22.00', '11 days, 18h, 21m, 0s', '1.53K', '1.52B', '65 days, 3h, 40m, 0s', '9.17K', '4.33B'],
  15: ['23.50', '14 days, 18m, 0s', '1.78K', '2.14B', '79 days, 3h, 58m, 0s', '10.95K', '6.47B'],
  16: ['25.00', '16 days, 15h, 9m, 0s', '2.07K', '2.95B', '95 days, 19h, 7m, 0s', '13.01K', '9.42B'],
  17: ['26.50', '19 days, 15h, 54m, 0s', '2.40K', '3.98B', '115 days, 11h, 1m, 0s', '15.42K', '13.40B'],
  18: ['28.00', '23 days, 3h, 32m, 0s', '2.79K', '5.27B', '138 days, 14h, 33m, 0s', '18.21K', '18.67B'],
  19: ['29.50', '27 days, 3h, 6m, 0s', '3.23K', '6.88B', '165 days, 17h, 39m, 0s', '21.44K', '25.55B'],
  20: ['31.00', '31 days, 15h, 40m, 0s', '3.67K', '8.84B', '197 days, 9h, 19m, 0s', '25.11K', '34.39B'],
  21: ['32.50', '36 days, 18h, 19m, 0s', '4.05K', '11.22B', '234 days, 3h, 38m, 0s', '29.17K', '45.61B'],
  22: ['34.00', '42 days, 12h, 12m, 0s', '4.48K', '14.08B', '276 days, 15h, 50m, 0s', '33.64K', '59.69B'],
  23: ['35.50', '48 days, 22h, 27m, 0s', '4.96K', '17.48B', '325 days, 14h, 17m, 0s', '38.60K', '77.17B'],
  24: ['37.00', '56 days, 2h, 16m, 0s', '5.49K', '21.49B', '1 year, 16 days, 16h, 33m, 0s', '44.08K', '98.66B'],
  25: ['38.50', '64 days, 50m, 0s', '6.08K', '26.19B', '1 year, 80 days, 17h, 23m, 0s', '50.16K', '124.85B'],
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
for (let level = 1; level <= 25; level++) {
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
  name: 'Missile Amplifier',
  maxLevel: 25,
  levels,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
console.log('Wrote', outPath, `(${levels.length} levels, screenshot data only)`)
