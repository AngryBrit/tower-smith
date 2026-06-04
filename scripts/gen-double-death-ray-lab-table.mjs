/**
 * Builds tables/labs/cards/double-death-ray.json from screenshot only.
 * Calculator Value 1.00 × level (1 … 30 at L1–30); Include % off.
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
  'cards',
  'double-death-ray.json',
)

/** [value, time, gems, coins, totalTime, totalGems, totalCoins] — screenshot L1–30 */
const BY_LEVEL = {
  1: ['1.00', '59m, 59s', '8', '2.50M', '59m, 59s', '8', '2.50M'],
  2: ['2.00', '9h, 21m, 0s', '64', '2.81M', '10h, 20m, 59s', '72', '5.31M'],
  3: ['3.00', '17h, 53m, 0s', '122', '3.42M', '1 day, 4h, 13m, 59s', '194', '8.73M'],
  4: ['4.00', '1 day, 2h, 54m, 0s', '180', '5.83M', '2 days, 7h, 7m, 59s', '374', '14.56M'],
  5: ['5.00', '1 day, 12h, 49m, 0s', '238', '13.94M', '3 days, 19h, 56m, 59s', '612', '28.50M'],
  6: ['6.00', '2 days, 6m, 0s', '304', '35.25M', '5 days, 20h, 2m, 59s', '916', '63.75M'],
  7: ['7.00', '2 days, 13h, 17m, 0s', '380', '82.06M', '8 days, 9h, 19m, 59s', '1.30K', '145.81M'],
  8: ['8.00', '3 days, 4h, 58m, 0s', '471', '172.67M', '11 days, 14h, 17m, 59s', '1.77K', '318.48M'],
  9: ['9.00', '3 days, 23h, 49m, 0s', '581', '332.58M', '15 days, 14h, 6m, 59s', '2.35K', '651.06M'],
  10: ['10.00', '4 days, 22h, 31m, 0s', '713', '595.69M', '20 days, 12h, 37m, 59s', '3.06K', '1.25B'],
  11: ['11.00', '6 days, 1h, 49m, 0s', '872', '1.01B', '26 days, 14h, 26m, 59s', '3.93K', '2.26B'],
  12: ['12.00', '7 days, 10h, 30m, 0s', '1.05K', '1.62B', '34 days, 56m, 59s', '4.98K', '3.88B'],
  13: ['13.00', '9 days, 1h, 23m, 0s', '1.23K', '2.49B', '43 days, 2h, 19m, 59s', '6.21K', '6.37B'],
  14: ['14.00', '10 days, 23h, 21m, 0s', '1.44K', '3.72B', '54 days, 1h, 40m, 59s', '7.65K', '10.09B'],
  15: ['15.00', '13 days, 5h, 18m, 0s', '1.69K', '5.38B', '67 days, 6h, 58m, 59s', '9.34K', '15.47B'],
  16: ['16.00', '15 days, 20h, 9m, 0s', '1.98K', '7.60B', '83 days, 3h, 7m, 59s', '11.32K', '23.07B'],
  17: ['17.00', '18 days, 20h, 54m, 0s', '2.32K', '10.49B', '102 days, 1m, 59s', '13.64K', '33.56B'],
  18: ['18.00', '22 days, 8h, 32m, 0s', '2.70K', '14.21B', '124 days, 8h, 33m, 59s', '16.34K', '47.77B'],
  19: ['19.00', '26 days, 8h, 6m, 0s', '3.14K', '18.90B', '150 days, 16h, 39m, 59s', '19.49K', '66.67B'],
  20: ['20.00', '30 days, 20h, 40m, 0s', '3.61K', '24.77B', '181 days, 13h, 19m, 59s', '23.10K', '91.44B'],
  21: ['21.00', '35 days, 23h, 19m, 0s', '3.99K', '32.01B', '217 days, 12h, 38m, 59s', '27.09K', '123.45B'],
  22: ['22.00', '41 days, 17h, 12m, 0s', '4.42K', '40.85B', '259 days, 5h, 50m, 59s', '31.51K', '164.30B'],
  23: ['23.00', '48 days, 3h, 27m, 0s', '4.90K', '51.55B', '307 days, 9h, 17m, 59s', '36.41K', '215.85B'],
  24: ['24.00', '55 days, 7h, 16m, 0s', '5.43K', '64.37B', '362 days, 16h, 33m, 59s', '41.84K', '280.22B'],
  25: ['25.00', '63 days, 5h, 50m, 0s', '6.02K', '79.64B', '1 year, 60 days, 22h, 23m, 59s', '47.85K', '359.86B'],
  26: ['26.00', '72 days, 25m, 0s', '6.67K', '97.67B', '1 year, 132 days, 22h, 48m, 59s', '54.52K', '457.53B'],
  27: ['27.00', '81 days, 16h, 17m, 0s', '7.38K', '118.82B', '1 year, 214 days, 15h, 5m, 59s', '61.90K', '576.35B'],
  28: ['28.00', '92 days, 6h, 41m, 0s', '8.14K', '143.50B', '1 year, 306 days, 21h, 46m, 59s', '70.05K', '719.85B'],
  29: ['29.00', '103 days, 20h, 58m, 0s', '8.87K', '172.11B', '2 years, 45 days, 18h, 44m, 59s', '78.92K', '891.96B'],
  30: ['30.00', '116 days, 12h, 28m, 0s', '9.67K', '205.12B', '2 years, 162 days, 7h, 12m, 59s', '88.59K', '1.10T'],
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
  name: 'Double Death Ray',
  maxLevel: 30,
  levels,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
console.log('Wrote', outPath, `(${levels.length} levels, screenshot data only)`)
