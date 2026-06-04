/**
 * Builds tables/labs/attack/super-crit-chance.json from lab calculator screenshots only.
 * Sources: Super Crit Chance screenshots (L1–29, L19–50).
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const towerLabsPath = path.join(__dirname, '..', 'src', 'data', 'tower-labs.json')
const outPath = path.join(
  __dirname,
  '..',
  'tables',
  'labs',
  'attack',
  'super-crit-chance.json',
)

/** [value, time, gems, coins] — marginal columns from screenshots L1–29 */
const MARGINAL_L1_29 = {
  1: ['0.10', '1 day, 3h, 46m, 0s', '185', '200.00K'],
  2: ['0.20', '1 day, 17h, 41m, 0s', '266', '401.00K'],
  3: ['0.30', '2 days, 7h, 54m, 0s', '349', '625.99K'],
  4: ['0.40', '2 days, 23h, 24m, 0s', '439', '974.77K'],
  5: ['0.50', '3 days, 17h, 54m, 0s', '547', '1.68M'],
  6: ['0.60', '4 days, 17h, 59m, 0s', '687', '3.13M'],
  7: ['0.70', '6 days, 3h, 10m, 0s', '879', '5.94M'],
  8: ['0.80', '8 days, 1h, 53m, 0s', '1.12K', '10.97M'],
  9: ['0.90', '10 days, 19h, 36m, 0s', '1.42K', '19.36M'],
  10: ['1.00', '14 days, 14h, 45m, 0s', '1.85K', '32.54M'],
  11: ['1.10', '19 days, 18h, 50m, 0s', '2.42K', '52.32M'],
  12: ['1.20', '26 days, 16h, 26m, 0s', '3.18K', '80.84M'],
  13: ['1.30', '35 days, 17h, 12m, 0s', '3.97K', '120.67M'],
  14: ['1.40', '47 days, 7h, 55m, 0s', '4.84K', '174.80M'],
  15: ['1.50', '62 days, 30m, 0s', '5.93K', '246.67M'],
  16: ['1.60', '80 days, 8h, 1m, 0s', '7.28K', '340.20M'],
  17: ['1.70', '102 days, 20h, 42m, 0s', '8.81K', '459.82M'],
  18: ['1.80', '130 days, 5h, 57m, 0s', '10.54K', '610.49M'],
  19: ['1.90', '163 days, 4h, 25m, 0s', '12.61K', '797.73M'],
  20: ['2.00', '202 days, 9h, 55m, 0s', '15.08K', '1.03B'],
  21: ['2.10', '248 days, 17h, 31m, 0s', '18.00K', '1.31B'],
  22: ['2.20', '302 days, 23h, 32m, 0s', '21.41K', '1.64B'],
  23: ['2.30', '1 year, 1 day, 1h, 32m, 0s', '25.00K', '2.04B'],
  24: ['2.40', '1 year, 73 days, 22h, 21m, 0s', '25.00K', '2.52B'],
  25: ['2.50', '1 year, 157 days, 14h, 5m, 0s', '25.00K', '3.07B'],
  26: ['2.60', '1 year, 253 days, 2h, 10m, 0s', '25.00K', '3.72B'],
  27: ['2.70', '1 year, 361 days, 13h, 16m, 0s', '25.00K', '4.48B'],
  28: ['2.80', '2 years, 119 days, 3h, 26m, 0s', '25.00K', '5.34B'],
  29: ['2.90', '2 years, 257 days, 2h, 1m, 0s', '25.00K', '6.34B'],
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

function formatCoin(n) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  return `${(n / 1_000).toFixed(2)}K`
}

function formatGems(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(2)}K`
  return String(n)
}

const towerLabs = JSON.parse(fs.readFileSync(towerLabsPath, 'utf8'))['Super Crit Chance']

/** @type {Record<number, [string, string, string, string]>} */
const marginal = { ...MARGINAL_L1_29 }

for (let level = 30; level <= 50; level++) {
  const row = towerLabs[String(level)]
  marginal[level] = [
    (level * 0.1).toFixed(2),
    formatTime(row.DURATION),
    '25.00K',
    formatCoin(row.COST),
  ]
}

let totalTimeSec = 0
let totalGems = 0
let totalCoins = 0
const levels = []

for (let level = 1; level <= 50; level++) {
  const row = marginal[level]
  if (!row) throw new Error(`Missing row for level ${level}`)
  const [value, time, gems, coins] = row
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
    totalGems: totalGems,
    totalCoins: totalCoins,
  })
}

// Screenshot cumulative display strings L1–29 (calculator totals column)
const TOTAL_DISPLAY_L1_29 = {
  1: ['1 day, 3h, 46m, 0s', '185', '200.00K'],
  2: ['2 days, 21h, 27m, 0s', '451', '601.00K'],
  3: ['5 days, 5h, 21m, 0s', '800', '1.23M'],
  4: ['8 days, 4h, 45m, 0s', '1.24K', '2.20M'],
  5: ['11 days, 22h, 39m, 0s', '1.79K', '3.88M'],
  6: ['16 days, 16h, 38m, 0s', '2.47K', '7.01M'],
  7: ['22 days, 19h, 48m, 0s', '3.35K', '12.95M'],
  8: ['30 days, 21h, 41m, 0s', '4.47K', '23.92M'],
  9: ['41 days, 17h, 17m, 0s', '5.90K', '43.28M'],
  10: ['56 days, 8h, 2m, 0s', '7.74K', '75.82M'],
  11: ['76 days, 2h, 52m, 0s', '10.16K', '128.14M'],
  12: ['102 days, 19h, 18m, 0s', '13.34K', '208.98M'],
  13: ['138 days, 12h, 30m, 0s', '17.32K', '329.65M'],
  14: ['185 days, 20h, 25m, 0s', '22.15K', '504.45M'],
  15: ['247 days, 20h, 55m, 0s', '28.08K', '751.12M'],
  16: ['328 days, 4h, 56m, 0s', '35.36K', '1.09B'],
  17: ['1 year, 66 days, 1h, 38m, 0s', '44.17K', '1.55B'],
  18: ['1 year, 196 days, 7h, 35m, 0s', '54.71K', '2.16B'],
  19: ['1 year, 359 days, 12h, 0m, 0s', '67.31K', '2.96B'],
  20: ['2 years, 196 days, 21h, 55m, 0s', '82.39K', '3.99B'],
  21: ['3 years, 80 days, 15h, 26m, 0s', '100.39K', '5.30B'],
  22: ['4 years, 18 days, 14h, 58m, 0s', '121.80K', '6.94B'],
  23: ['5 years, 19 days, 16h, 30m, 0s', '146.80K', '8.98B'],
  24: ['6 years, 93 days, 14h, 51m, 0s', '171.80K', '11.50B'],
  25: ['7 years, 251 days, 4h, 56m, 0s', '196.80K', '14.57B'],
  26: ['9 years, 139 days, 7h, 6m, 0s', '221.80K', '18.29B'],
  27: ['11 years, 135 days, 20h, 22m, 0s', '246.80K', '22.77B'],
  28: ['13 years, 254 days, 23h, 48m, 0s', '271.80K', '28.11B'],
  29: ['16 years, 147 days, 1h, 49m, 0s', '296.80K', '34.45B'],
}

for (const entry of levels) {
  const totals = TOTAL_DISPLAY_L1_29[entry.level]
  if (totals) {
    const [totalTime, totalGems, totalCoins] = totals
    entry.totalTime.display = totalTime
    entry.totalGems = parseAbbrevNum(totalGems)
    entry.totalCoins = parseAbbrevNum(totalCoins)
  }
}

// L50 screenshot cumulative column
const l50 = levels[49]
l50.totalTime.display = '278 years, 307 days, 5h, 29m, 0s'
l50.totalGems = parseAbbrevNum('821.80K')
l50.totalCoins = parseAbbrevNum('800.36B')

const doc = {
  name: 'Super Crit Chance',
  maxLevel: 50,
  levels,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
console.log('Wrote', outPath, `(${levels.length} levels, screenshot data only)`)
