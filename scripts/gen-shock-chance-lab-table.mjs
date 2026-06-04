/**
 * Builds tables/labs/ultimate-weapon/shock-chance.json from Shock Chance screenshot only.
 * Value 2.50% + 0.50%/level in UI (3.00 … 17.50 at L1–30); Include % off.
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
  'shock-chance.json',
)

/** [value, time, gems, coins, totalTime, totalGems, totalCoins] — screenshot L1–30 */
const BY_LEVEL = {
  1: ['3.00', '20h, 0m, 0s', '136', '250.00K', '20h, 0m, 0s', '136', '250.00K'],
  2: ['3.50', '1 day, 4h, 21m, 0s', '189', '560.00K', '2 days, 21m, 0s', '325', '810.00K'],
  3: ['4.00', '1 day, 12h, 53m, 0s', '238', '1.10M', '3 days, 13h, 14m, 0s', '563', '1.91M'],
  4: ['4.50', '1 day, 21h, 54m, 0s', '291', '2.80M', '5 days, 11h, 8m, 0s', '854', '4.71M'],
  5: ['5.00', '2 days, 7h, 49m, 0s', '348', '7.75M', '7 days, 18h, 57m, 0s', '1.20K', '12.46M'],
  6: ['5.50', '2 days, 19h, 6m, 0s', '414', '19.54M', '10 days, 14h, 3m, 0s', '1.62K', '32.00M'],
  7: ['6.00', '3 days, 8h, 17m, 0s', '491', '43.58M', '13 days, 22h, 20m, 0s', '2.11K', '75.58M'],
  8: ['6.50', '3 days, 23h, 58m, 0s', '582', '87.41M', '17 days, 22h, 18m, 0s', '2.69K', '162.99M'],
  9: ['7.00', '4 days, 18h, 49m, 0s', '691', '160.91M', '22 days, 17h, 7m, 0s', '3.38K', '323.90M'],
  10: ['7.50', '5 days, 17h, 31m, 0s', '823', '276.62M', '28 days, 10h, 38m, 0s', '4.20K', '600.52M'],
  11: ['8.00', '6 days, 20h, 49m, 0s', '982', '449.93M', '35 days, 7h, 27m, 0s', '5.19K', '1.05B'],
  12: ['8.50', '8 days, 5h, 30m, 0s', '1.14K', '699.34M', '43 days, 12h, 57m, 0s', '6.32K', '1.75B'],
  13: ['9.00', '9 days, 20h, 23m, 0s', '1.32K', '1.05B', '53 days, 9h, 20m, 0s', '7.64K', '2.80B'],
  14: ['9.50', '11 days, 18h, 21m, 0s', '1.53K', '1.52B', '65 days, 3h, 41m, 0s', '9.17K', '4.32B'],
  15: ['10.00', '14 days, 18m, 0s', '1.78K', '2.14B', '79 days, 3h, 59m, 0s', '10.95K', '6.46B'],
  16: ['10.50', '16 days, 15h, 9m, 0s', '2.07K', '2.95B', '95 days, 19h, 8m, 0s', '13.01K', '9.41B'],
  17: ['11.00', '19 days, 15h, 54m, 0s', '2.40K', '3.98B', '115 days, 11h, 2m, 0s', '15.42K', '13.39B'],
  18: ['11.50', '23 days, 3h, 32m, 0s', '2.79K', '5.27B', '138 days, 14h, 34m, 0s', '18.21K', '18.66B'],
  19: ['12.00', '27 days, 3h, 6m, 0s', '3.23K', '6.88B', '165 days, 17h, 40m, 0s', '21.44K', '25.54B'],
  20: ['12.50', '31 days, 15h, 40m, 0s', '3.67K', '8.84B', '197 days, 9h, 20m, 0s', '25.11K', '34.38B'],
  21: ['13.00', '36 days, 18h, 19m, 0s', '4.05K', '11.22B', '234 days, 3h, 39m, 0s', '29.17K', '45.60B'],
  22: ['13.50', '42 days, 12h, 12m, 0s', '4.48K', '14.08B', '276 days, 15h, 51m, 0s', '33.64K', '59.68B'],
  23: ['14.00', '48 days, 22h, 27m, 0s', '4.96K', '17.48B', '325 days, 14h, 18m, 0s', '38.60K', '77.16B'],
  24: ['14.50', '56 days, 2h, 16m, 0s', '5.49K', '21.49B', '1 year, 16 days, 16h, 34m, 0s', '44.08K', '98.65B'],
  25: ['15.00', '64 days, 50m, 0s', '6.08K', '26.19B', '1 year, 80 days, 17h, 24m, 0s', '50.16K', '124.84B'],
  26: ['15.50', '72 days, 19h, 25m, 0s', '6.73K', '31.66B', '1 year, 153 days, 12h, 49m, 0s', '56.89K', '156.50B'],
  27: ['16.00', '82 days, 11h, 17m, 0s', '7.44K', '37.99B', '1 year, 236 days, 6m, 0s', '64.33K', '194.49B'],
  28: ['16.50', '93 days, 1h, 41m, 0s', '8.19K', '45.28B', '1 year, 329 days, 1h, 47m, 0s', '72.52K', '239.77B'],
  29: ['17.00', '104 days, 15h, 58m, 0s', '8.92K', '53.62B', '2 years, 68 days, 17h, 45m, 0s', '81.44K', '293.39B'],
  30: ['17.50', '117 days, 7h, 28m, 0s', '9.72K', '63.13B', '2 years, 186 days, 1h, 13m, 0s', '91.17K', '356.52B'],
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
for (let level = 1; level <= 30; level++) {
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
  name: 'Shock Chance',
  maxLevel: 30,
  levels,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
console.log('Wrote', outPath, `(${levels.length} levels, screenshot data only)`)
