/**
 * Builds tables/labs/defense/land-mine-decay.json from Land Mine Decay calculator screenshots.
 * Sources: Land Mine Decay screenshots (L1–29, L4–35).
 * Value +0.50/level (0.50 … 17.50).
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outPath = path.join(__dirname, '..', 'tables', 'labs', 'defense', 'land-mine-decay.json')

/** [value, time, gems, coins, totalTime, totalGems, totalCoins] — screenshots L1–29 */
const BY_LEVEL = {
  1: ['0.50', '1h, 39m, 0s', '12', '25.00K', '1h, 39m, 0s', '12', '25.00K'],
  2: ['1.00', '5h, 1m, 0s', '35', '40.00K', '6h, 40m, 0s', '47', '65.00K'],
  3: ['1.50', '8h, 33m, 0s', '59', '231.98K', '15h, 13m, 0s', '106', '296.98K'],
  4: ['2.00', '12h, 34m, 0s', '86', '1.17M', '1 day, 3h, 47m, 0s', '192', '1.47M'],
  5: ['2.50', '17h, 29m, 0s', '119', '3.93M', '1 day, 21h, 16m, 0s', '311', '5.40M'],
  6: ['3.00', '23h, 46m, 0s', '162', '10.18M', '2 days, 21h, 2m, 0s', '473', '15.58M'],
  7: ['3.50', '1 day, 7h, 57m, 0s', '210', '22.24M', '4 days, 4h, 59m, 0s', '683', '37.82M'],
  8: ['4.00', '1 day, 18h, 38m, 0s', '272', '43.10M', '5 days, 23h, 37m, 0s', '955', '80.92M'],
  9: ['4.50', '2 days, 8h, 29m, 0s', '352', '76.50M', '8 days, 8h, 6m, 0s', '1.31K', '157.42M'],
  10: ['5.00', '3 days, 2h, 11m, 0s', '455', '126.91M', '11 days, 10h, 17m, 0s', '1.76K', '284.33M'],
  11: ['5.50', '4 days, 29m, 0s', '585', '199.60M', '15 days, 10h, 46m, 0s', '2.35K', '483.93M'],
  12: ['6.00', '5 days, 4h, 10m, 0s', '746', '300.68M', '20 days, 14h, 56m, 0s', '3.09K', '784.61M'],
  13: ['6.50', '6 days, 14h, 3m, 0s', '943', '437.08M', '27 days, 4h, 59m, 0s', '4.04K', '1.22B'],
  14: ['7.00', '8 days, 7h, 1m, 0s', '1.14K', '616.62M', '35 days, 12h, 0m, 0s', '5.18K', '1.84B'],
  15: ['7.50', '10 days, 7h, 58m, 0s', '1.37K', '848.01M', '45 days, 19h, 58m, 0s', '6.55K', '2.69B'],
  16: ['8.00', '12 days, 17h, 49m, 0s', '1.64K', '1.14B', '58 days, 13h, 47m, 0s', '8.19K', '3.83B'],
  17: ['8.50', '15 days, 13h, 34m, 0s', '1.95K', '1.51B', '74 days, 3h, 21m, 0s', '10.14K', '5.34B'],
  18: ['9.00', '18 days, 20h, 12m, 0s', '2.31K', '1.95B', '92 days, 23h, 33m, 0s', '12.45K', '7.29B'],
  19: ['9.50', '22 days, 14h, 46m, 0s', '2.73K', '2.50B', '115 days, 14h, 19m, 0s', '15.18K', '9.79B'],
  20: ['10.00', '26 days, 22h, 20m, 0s', '3.21K', '3.15B', '142 days, 12h, 39m, 0s', '18.39K', '12.94B'],
  21: ['10.50', '31 days, 19h, 59m, 0s', '3.69K', '3.93B', '174 days, 8h, 38m, 0s', '22.08K', '16.87B'],
  22: ['11.00', '37 days, 8h, 52m, 0s', '4.10K', '4.85B', '211 days, 17h, 30m, 0s', '26.18K', '21.72B'],
  23: ['11.50', '43 days, 14h, 7m, 0s', '4.56K', '5.92B', '255 days, 7h, 37m, 0s', '30.73K', '27.64B'],
  24: ['12.00', '50 days, 12h, 56m, 0s', '5.07K', '7.17B', '305 days, 20h, 33m, 0s', '35.81K', '34.81B'],
  25: ['12.50', '58 days, 6h, 30m, 0s', '5.65K', '8.61B', '364 days, 3h, 3m, 0s', '41.45K', '43.42B'],
  26: ['13.00', '66 days, 20h, 5m, 0s', '6.28K', '10.26B', '1 year, 65 days, 23h, 8m, 0s', '47.74K', '53.68B'],
  27: ['13.50', '76 days, 6h, 57m, 0s', '6.98K', '12.14B', '1 year, 142 days, 6h, 5m, 0s', '54.72K', '65.82B'],
  28: ['14.00', '86 days, 16h, 21m, 0s', '7.75K', '14.28B', '1 year, 228 days, 22h, 26m, 0s', '62.48K', '80.10B'],
  29: ['14.50', '98 days, 1h, 38m, 0s', '8.51K', '16.70B', '1 year, 327 days, 4m, 0s', '70.98K', '96.80B'],
}

/** Marginal rows L30–35 (screenshot L4–35); gems from screenshot gem column */
const MARGINAL_L30_35 = {
  30: ['15.00', '110 days, 12h, 8m, 0s', '9.29K', '19.42B'],
  31: ['15.50', '124 days, 1h, 12m, 0s', '10.14K', '22.47B'],
  32: ['16.00', '138 days, 18h, 14m, 0s', '11.07K', '25.87B'],
  33: ['16.50', '154 days, 16h, 37m, 0s', '12.07K', '29.66B'],
  34: ['17.00', '171 days, 21h, 49m, 0s', '13.16K', '33.85B'],
  35: ['17.50', '190 days, 11h, 16m, 0s', '14.33K', '38.49B'],
}

/** Screenshot cumulative display overrides L30, L35 */
const TOTAL_DISPLAY_L30_35 = {
  30: ['2 years, 72 days, 12h, 12m, 0s', '80.28K', '116.22B'],
  35: ['4 years, 122 days, 9h, 20m, 0s', '141.05K', '266.56B'],
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

for (let level = 30; level <= 35; level++) {
  const [value, time, gems, coins] = MARGINAL_L30_35[level]
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
  const totals = TOTAL_DISPLAY_L30_35[entry.level]
  if (totals) {
    const [totalTime, totalGemsDisp, totalCoins] = totals
    entry.totalTime.display = totalTime
    entry.totalTime.seconds = parseTimeToSeconds(totalTime)
    entry.totalGems = parseAbbrevNum(totalGemsDisp)
    entry.totalCoins = parseAbbrevNum(totalCoins)
  }
}

const doc = {
  name: 'Land Mine Decay',
  maxLevel: 35,
  levels,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
console.log('Wrote', outPath, `(${levels.length} levels, screenshot data only)`)
