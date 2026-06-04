/**
 * Builds tables/labs/defense/wall-health.json from Wall Health calculator screenshots.
 * Sources: Wall Health screenshots (L1–29, L19–50).
 * Value +2.00/level (2.00 … 100.00).
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outPath = path.join(__dirname, '..', 'tables', 'labs', 'defense', 'wall-health.json')

/** [value, time, gems, coins, totalTime, totalGems, totalCoins] — screenshots L1–29 */
const BY_LEVEL = {
  1: ['2.00', '5h, 33m, 0s', '39', '1.00B', '5h, 33m, 0s', '39', '1.00B'],
  2: ['4.00', '5h, 37m, 0s', '39', '1.20B', '11h, 10m, 0s', '78', '2.20B'],
  3: ['6.00', '5h, 46m, 0s', '40', '1.40B', '16h, 56m, 0s', '118', '3.60B'],
  4: ['8.00', '5h, 59m, 0s', '42', '1.60B', '22h, 55m, 0s', '160', '5.20B'],
  5: ['10.00', '6h, 19m, 0s', '44', '1.81B', '1 day, 5h, 14m, 0s', '204', '7.01B'],
  6: ['12.00', '6h, 45m, 0s', '47', '2.02B', '1 day, 11h, 59m, 0s', '251', '9.03B'],
  7: ['14.00', '7h, 19m, 0s', '51', '2.24B', '1 day, 19h, 18m, 0s', '302', '11.27B'],
  8: ['16.00', '8h, 1m, 0s', '55', '2.46B', '2 days, 3h, 19m, 0s', '357', '13.73B'],
  9: ['18.00', '8h, 51m, 0s', '61', '2.70B', '2 days, 12h, 10m, 0s', '418', '16.43B'],
  10: ['20.00', '9h, 50m, 0s', '68', '2.94B', '2 days, 22h, 0m, 0s', '486', '19.37B'],
  11: ['22.00', '10h, 59m, 0s', '75', '3.20B', '3 days, 8h, 59m, 0s', '561', '22.57B'],
  12: ['24.00', '12h, 18m, 0s', '84', '3.47B', '3 days, 21h, 17m, 0s', '645', '26.04B'],
  13: ['26.00', '13h, 47m, 0s', '94', '3.76B', '4 days, 11h, 4m, 0s', '739', '29.80B'],
  14: ['28.00', '15h, 26m, 0s', '106', '4.07B', '5 days, 2h, 30m, 0s', '845', '33.87B'],
  15: ['30.00', '17h, 17m, 0s', '118', '4.41B', '5 days, 19h, 47m, 0s', '963', '38.28B'],
  16: ['32.00', '19h, 18m, 0s', '132', '4.76B', '6 days, 15h, 5m, 0s', '1.10K', '43.04B'],
  17: ['34.00', '21h, 32m, 0s', '147', '5.14B', '7 days, 12h, 37m, 0s', '1.24K', '48.18B'],
  18: ['36.00', '23h, 57m, 0s', '163', '5.55B', '8 days, 12h, 34m, 0s', '1.41K', '53.73B'],
  19: ['38.00', '1 day, 2h, 34m, 0s', '178', '5.99B', '9 days, 15h, 8m, 0s', '1.58K', '59.72B'],
  20: ['40.00', '1 day, 5h, 24m, 0s', '195', '6.46B', '10 days, 20h, 32m, 0s', '1.78K', '66.18B'],
  21: ['42.00', '1 day, 8h, 26m, 0s', '213', '6.97B', '12 days, 4h, 58m, 0s', '1.99K', '73.15B'],
  22: ['44.00', '1 day, 11h, 42m, 0s', '232', '7.51B', '13 days, 16h, 40m, 0s', '2.22K', '80.66B'],
  23: ['46.00', '1 day, 15h, 10m, 0s', '252', '8.09B', '15 days, 7h, 50m, 0s', '2.48K', '88.75B'],
  24: ['48.00', '1 day, 18h, 53m, 0s', '273', '8.72B', '17 days, 2h, 43m, 0s', '2.75K', '97.47B'],
  25: ['50.00', '1 day, 22h, 49m, 0s', '296', '9.39B', '19 days, 1h, 32m, 0s', '3.04K', '106.86B'],
  26: ['52.00', '2 days, 2h, 59m, 0s', '320', '10.10B', '21 days, 4h, 31m, 0s', '3.36K', '116.96B'],
  27: ['54.00', '2 days, 7h, 23m, 0s', '346', '10.87B', '23 days, 11h, 54m, 0s', '3.71K', '127.83B'],
  28: ['56.00', '2 days, 12h, 1m, 0s', '373', '11.69B', '25 days, 23h, 55m, 0s', '4.08K', '139.52B'],
  29: ['58.00', '2 days, 16h, 55m, 0s', '401', '12.57B', '28 days, 16h, 50m, 0s', '4.48K', '152.09B'],
}

/** Marginal L30–50 (screenshot L19–50); time/coins match calculator */
const MARGINAL_L30_50 = {
  30: ['60.00', '2 days, 22h, 3m, 0s', '13.50B'],
  31: ['62.00', '3 days, 3h, 26m, 0s', '14.49B'],
  32: ['64.00', '3 days, 9h, 4m, 0s', '15.55B'],
  33: ['66.00', '3 days, 14h, 58m, 0s', '16.67B'],
  34: ['68.00', '3 days, 21h, 8m, 0s', '17.86B'],
  35: ['70.00', '4 days, 3h, 33m, 0s', '19.12B'],
  36: ['72.00', '4 days, 10h, 15m, 0s', '20.46B'],
  37: ['74.00', '4 days, 17h, 13m, 0s', '21.87B'],
  38: ['76.00', '5 days, 27m, 0s', '23.36B'],
  39: ['78.00', '5 days, 7h, 58m, 0s', '24.94B'],
  40: ['80.00', '5 days, 15h, 45m, 0s', '26.60B'],
  41: ['82.00', '5 days, 23h, 50m, 0s', '28.36B'],
  42: ['84.00', '6 days, 8h, 12m, 0s', '30.20B'],
  43: ['86.00', '6 days, 16h, 51m, 0s', '32.14B'],
  44: ['88.00', '7 days, 1h, 47m, 0s', '34.17B'],
  45: ['90.00', '7 days, 11h, 2m, 0s', '36.31B'],
  46: ['92.00', '7 days, 20h, 34m, 0s', '38.55B'],
  47: ['94.00', '8 days, 6h, 24m, 0s', '40.90B'],
  48: ['96.00', '8 days, 16h, 32m, 0s', '43.36B'],
  49: ['98.00', '9 days, 2h, 58m, 0s', '45.93B'],
  50: ['100.00', '9 days, 13h, 43m, 0s', '48.61B'],
}

/** Marginal gems L30–50 (screenshot gem column) */
const GEM_MARG_L30_50 = {
  30: '431',
  31: '462',
  32: '495',
  33: '530',
  34: '565',
  35: '603',
  36: '642',
  37: '682',
  38: '724',
  39: '768',
  40: '813',
  41: '860',
  42: '909',
  43: '959',
  44: '1010',
  45: '1055',
  46: '1100',
  47: '1145',
  48: '1195',
  49: '1245',
  50: '1.29K',
}

/** Screenshot cumulative display overrides L30, L50 */
const TOTAL_DISPLAY_L30_50 = {
  30: ['31 days, 14h, 53m, 0s', '4.92K', '165.59B'],
  50: ['152 days, 33m, 0s', '21.93K', '745.04B'],
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

function formatTime(seconds) {
  let s = seconds
  const y = Math.floor(s / (365 * 86400))
  s -= y * 365 * 86400
  const d = Math.floor(s / 86400)
  s -= d * 86400
  const h = Math.floor(s / 3600)
  s -= h * 3600
  const m = Math.floor(s / 60)
  const sec = seconds - y * 365 * 86400 - d * 86400 - h * 3600 - m * 60
  const parts = []
  if (y) parts.push(`${y} year${y === 1 ? '' : 's'}`)
  if (d) parts.push(`${d} day${d === 1 ? '' : 's'}`)
  if (h) parts.push(`${h}h`)
  if (m) parts.push(`${m}m`)
  parts.push(`${sec}s`)
  return parts.join(', ')
}

for (let level = 30; level <= 50; level++) {
  const [value, time, coins] = MARGINAL_L30_50[level]
  MARGINAL_L30_50[level] = [value, time, GEM_MARG_L30_50[level], coins]
}

const levels = []

for (let level = 1; level <= 29; level++) {
  const row = BY_LEVEL[level]
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

let totalTimeSec = levels[28].totalTime.seconds
let totalGems = levels[28].totalGems
let totalCoins = levels[28].totalCoins

for (let level = 30; level <= 50; level++) {
  const [value, time, gems, coins] = MARGINAL_L30_50[level]
  const timeSec = parseTimeToSeconds(time)
  const gemNum = parseAbbrevNum(gems)
  const coinNum = parseAbbrevNum(coins)
  totalTimeSec += timeSec
  totalGems += gemNum
  totalCoins += coinNum
  levels.push({
    level,
    value: parseFloat(value),
    time: { display: time, seconds: timeSec },
    gems: gemNum,
    coins: coinNum,
    totalTime: { display: formatTime(totalTimeSec), seconds: totalTimeSec },
    totalGems,
    totalCoins,
  })
}

for (const entry of levels) {
  const totals = TOTAL_DISPLAY_L30_50[entry.level]
  if (totals) {
    const [totalTime, totalGemsDisp, totalCoins] = totals
    entry.totalTime.display = totalTime
    entry.totalTime.seconds = parseTimeToSeconds(totalTime)
    entry.totalGems = parseAbbrevNum(totalGemsDisp)
    entry.totalCoins = parseAbbrevNum(totalCoins)
  }
}

const doc = {
  name: 'Wall Health',
  maxLevel: 50,
  levels,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
console.log('Wrote', outPath, `(${levels.length} levels, screenshot data only)`)
