/**
 * Builds tables/labs/ultimate-weapon/death-wave-health.json from Death Wave Health screenshot only.
 * Value 500% + 25%/level in UI (525 … 1250 at L1–30); Include % off.
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
  'death-wave-health.json',
)

/** [value, time, gems, coins, totalTime, totalGems, totalCoins] — screenshot L1–30 */
const BY_LEVEL = {
  1: ['525.00', '19h, 59m, 59s', '136', '250.00K', '19h, 59m, 59s', '136', '250.00K'],
  2: ['550.00', '1 day, 4h, 21m, 9s', '189', '560.00K', '2 days, 21m, 8s', '325', '810.00K'],
  3: ['575.00', '1 day, 12h, 53m, 11s', '238', '1.10M', '3 days, 13h, 14m, 19s', '563', '1.91M'],
  4: ['600.00', '1 day, 21h, 54m, 33s', '291', '2.80M', '5 days, 11h, 8m, 52s', '854', '4.71M'],
  5: ['625.00', '2 days, 7h, 49m, 19s', '348', '7.75M', '7 days, 18h, 58m, 11s', '1.20K', '12.46M'],
  6: ['650.00', '2 days, 19h, 6m, 5s', '414', '19.54M', '10 days, 14h, 4m, 16s', '1.62K', '32.00M'],
  7: ['675.00', '3 days, 8h, 17m, 16s', '491', '43.58M', '13 days, 22h, 21m, 32s', '2.11K', '75.58M'],
  8: ['700.00', '3 days, 23h, 58m, 44s', '582', '87.41M', '17 days, 22h, 20m, 16s', '2.69K', '162.99M'],
  9: ['725.00', '4 days, 18h, 49m, 30s', '691', '160.91M', '22 days, 17h, 9m, 46s', '3.38K', '323.90M'],
  10: ['750.00', '5 days, 17h, 31m, 29s', '823', '276.62M', '28 days, 10h, 41m, 15s', '4.20K', '600.52M'],
  11: ['775.00', '7 days, 4h, 48m, 55s', '1.02K', '334.62M', '35 days, 15h, 30m, 10s', '5.23K', '935.14M'],
  12: ['800.00', '7 days, 14h, 48m, 11s', '1.07K', '347.44M', '43 days, 6h, 18m, 21s', '6.30K', '1.28B'],
  13: ['825.00', '8 days, 1h, 1m, 58s', '1.12K', '363.46M', '51 days, 7h, 20m, 19s', '7.41K', '1.65B'],
  14: ['850.00', '8 days, 11h, 30m, 53s', '1.17K', '383.11M', '59 days, 18h, 51m, 12s', '8.58K', '2.03B'],
  15: ['875.00', '8 days, 22h, 15m, 35s', '1.21K', '406.87M', '68 days, 17h, 6m, 47s', '9.79K', '2.44B'],
  16: ['900.00', '9 days, 9h, 16m, 39s', '1.26K', '435.21M', '78 days, 2h, 23m, 26s', '11.06K', '2.87B'],
  17: ['925.00', '9 days, 20h, 34m, 39s', '1.32K', '468.64M', '87 days, 22h, 58m, 5s', '12.37K', '3.34B'],
  18: ['950.00', '10 days, 8h, 10m, 10s', '1.37K', '507.67M', '98 days, 7h, 8m, 15s', '13.74K', '3.85B'],
  19: ['975.00', '10 days, 20h, 3m, 42s', '1.43K', '552.83M', '109 days, 3h, 11m, 57s', '15.17K', '4.40B'],
  20: ['1000.00', '11 days, 8h, 15m, 49s', '1.48K', '604.68M', '120 days, 11h, 27m, 46s', '16.65K', '5.01B'],
  21: ['1025.00', '11 days, 20h, 46m, 59s', '1.54K', '663.77M', '132 days, 8h, 14m, 45s', '18.19K', '5.67B'],
  22: ['1050.00', '12 days, 9h, 37m, 43s', '1.60K', '730.69M', '144 days, 17h, 52m, 28s', '19.79K', '6.40B'],
  23: ['1075.00', '12 days, 22h, 48m, 31s', '1.66K', '806.04M', '157 days, 16h, 40m, 59s', '21.45K', '7.21B'],
  24: ['1100.00', '13 days, 12h, 19m, 49s', '1.72K', '890.41M', '171 days, 5h, 0m, 48s', '23.17K', '8.10B'],
  25: ['1125.00', '14 days, 2h, 12m, 6s', '1.79K', '984.43M', '185 days, 7h, 12m, 54s', '24.96K', '9.08B'],
  26: ['1150.00', '14 days, 16h, 25m, 49s', '1.85K', '1.09B', '199 days, 23h, 38m, 43s', '26.81K', '10.17B'],
  27: ['1175.00', '15 days, 7h, 1m, 25s', '1.92K', '1.20B', '215 days, 6h, 40m, 8s', '28.73K', '11.37B'],
  28: ['1200.00', '15 days, 21h, 59m, 19s', '1.99K', '1.33B', '231 days, 4h, 39m, 27s', '30.72K', '12.70B'],
  29: ['1225.00', '16 days, 13h, 19m, 57s', '2.06K', '1.47B', '247 days, 17h, 59m, 24s', '32.78K', '14.17B'],
  30: ['1250.00', '17 days, 5h, 3m, 44s', '2.13K', '1.62B', '264 days, 23h, 3m, 8s', '34.91K', '15.79B'],
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
  name: 'Death Wave Health',
  maxLevel: 30,
  levels,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
console.log('Wrote', outPath, `(${levels.length} levels, screenshot data only)`)
