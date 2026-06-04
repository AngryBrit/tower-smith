/**
 * Builds tables/labs/attack/super-crit-mult.json from lab calculator screenshots only.
 * Sources: Super Crit Mult screenshots (L1–29, L9–40).
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
  'super-crit-mult.json',
)

/** [value, time, gems, coins] — marginal columns, screenshots L1–8 */
const MARGINAL_L1_8 = {
  1: ['1.02', '1 day, 3h, 46m, 0s', '185', '200.00K'],
  2: ['1.04', '1 day, 17h, 41m, 0s', '266', '401.00K'],
  3: ['1.06', '2 days, 7h, 51m, 0s', '349', '625.99K'],
  4: ['1.08', '2 days, 23h, 1m, 0s', '439', '974.77K'],
  5: ['1.10', '3 days, 16h, 18m, 0s', '537', '1.68M'],
  6: ['1.12', '4 days, 13h, 22m, 0s', '687', '3.13M'],
  7: ['1.14', '5 days, 16h, 18m, 0s', '879', '5.94M'],
  8: ['1.16', '7 days, 3h, 41m, 0s', '1.12K', '10.97M'],
}

/** [value, time, gems, coins] — marginal columns, screenshot L9–40 */
const MARGINAL_L9_40 = {
  9: ['1.18', '9 days, 2h, 31m, 0s', '1.23K', '19.36M'],
  10: ['1.20', '11 days, 16h, 21m, 0s', '1.52K', '32.54M'],
  11: ['1.22', '15 days, 1h, 6m, 0s', '1.89K', '52.32M'],
  12: ['1.24', '19 days, 9h, 14m, 0s', '2.37K', '80.84M'],
  13: ['1.26', '24 days, 21h, 38m, 0s', '2.99K', '120.67M'],
  14: ['1.28', '31 days, 19h, 41m, 0s', '3.69K', '174.80M'],
  15: ['1.30', '40 days, 9h, 11m, 0s', '4.32K', '246.67M'],
  16: ['1.32', '50 days, 20h, 29m, 0s', '5.10K', '340.20M'],
  17: ['1.34', '63 days, 12h, 18m, 0s', '6.04K', '459.82M'],
  18: ['1.36', '78 days, 15h, 54m, 0s', '7.16K', '610.49M'],
  19: ['1.38', '96 days, 14h, 58m, 0s', '8.42K', '797.73M'],
  20: ['1.40', '117 days, 17h, 41m, 0s', '9.75K', '1.03B'],
  21: ['1.42', '142 days, 8h, 39m, 0s', '11.30K', '1.31B'],
  22: ['1.44', '170 days, 21h, 1m, 0s', '13.09K', '1.64B'],
  23: ['1.46', '203 days, 16h, 18m, 0s', '15.16K', '2.04B'],
  24: ['1.48', '241 days, 4h, 34m, 0s', '17.52K', '2.52B'],
  25: ['1.50', '283 days, 20h, 18m, 0s', '20.21K', '3.07B'],
  26: ['1.52', '332 days, 2h, 29m, 0s', '23.24K', '3.72B'],
  27: ['1.54', '1 year, 21 days, 10h, 31m, 0s', '25.00K', '4.48B'],
  28: ['1.56', '1 year, 82 days, 8h, 21m, 0s', '25.00K', '5.34B'],
  29: ['1.58', '1 year, 150 days, 8h, 18m, 0s', '25.00K', '6.34B'],
  30: ['1.60', '1 year, 225 days, 23h, 14m, 0s', '25.00K', '7.48B'],
  31: ['1.62', '1 year, 309 days, 18h, 26m, 0s', '25.00K', '8.77B'],
  32: ['1.64', '2 years, 37 days, 7h, 41m, 0s', '25.00K', '10.23B'],
  33: ['1.66', '2 years, 139 days, 5h, 11m, 0s', '25.00K', '11.87B'],
  34: ['1.68', '2 years, 251 days, 1h, 41m, 0s', '25.00K', '13.72B'],
  35: ['1.70', '3 years, 8 days, 12h, 18m, 0s', '25.00K', '15.78B'],
  36: ['1.72', '3 years, 142 days, 4h, 42m, 0s', '25.00K', '18.08B'],
  37: ['1.74', '3 years, 287 days, 18h, 58m, 0s', '25.00K', '20.64B'],
  38: ['1.76', '4 years, 80 days, 23h, 41m, 0s', '25.00K', '23.48B'],
  39: ['1.78', '4 years, 252 days, 11h, 51m, 0s', '25.00K', '26.61B'],
  40: ['1.80', '5 years, 73 days, 1h, 1m, 0s', '25.00K', '30.07B'],
}

/** [totalTime, totalGems, totalCoins] — calculator totals column from screenshots */
const TOTAL_DISPLAY = {
  1: ['1 day, 3h, 46m, 0s', '185', '200.00K'],
  5: ['11 days, 20h, 37m, 0s', '1.77K', '3.88M'],
  10: ['50 days, 50m, 0s', '7.02K', '75.82M'],
  15: ['181 days, 13h, 40m, 0s', '22.28K', '751.12M'],
  20: ['1 year, 223 days, 23h, 0m, 0s', '58.74K', '3.99B'],
  25: ['4 years, 170 days, 21h, 50m, 0s', '136.01K', '14.57B'],
  29: ['9 years, 27 days, 3h, 29m, 0s', '234.26K', '34.45B'],
  9: ['38 days, 8h, 29m, 0s', '5.50K', '43.28M'],
  10: ['50 days, 50m, 0s', '7.02K', '75.82M'],
  11: ['65 days, 1h, 56m, 0s', '8.91K', '128.14M'],
  12: ['84 days, 11h, 10m, 0s', '11.29K', '208.98M'],
  13: ['109 days, 8h, 48m, 0s', '14.27K', '329.65M'],
  14: ['141 days, 4h, 29m, 0s', '17.96K', '504.45M'],
  15: ['181 days, 13h, 40m, 0s', '22.28K', '751.12M'],
  16: ['232 days, 10h, 9m, 0s', '27.38K', '1.09B'],
  17: ['295 days, 22h, 27m, 0s', '33.41K', '1.55B'],
  18: ['1 year, 9 days, 14h, 21m, 0s', '40.57K', '2.16B'],
  19: ['1 year, 106 days, 5h, 19m, 0s', '48.99K', '2.96B'],
  20: ['1 year, 223 days, 23h, 0m, 0s', '58.74K', '3.99B'],
  21: ['2 years, 1 day, 7h, 39m, 0s', '70.04K', '5.30B'],
  22: ['2 years, 172 days, 4h, 40m, 0s', '83.13K', '6.94B'],
  23: ['3 years, 10 days, 20h, 58m, 0s', '98.29K', '8.98B'],
  24: ['3 years, 252 days, 1h, 32m, 0s', '115.81K', '11.50B'],
  25: ['4 years, 170 days, 21h, 50m, 0s', '136.01K', '14.57B'],
  26: ['5 years, 138 days, 0s', '159.26K', '18.29B'],
  27: ['6 years, 159 days, 10h, 50m, 0s', '184.26K', '22.77B'],
  28: ['7 years, 241 days, 19h, 11m, 0s', '209.26K', '28.11B'],
  29: ['9 years, 27 days, 3h, 29m, 0s', '234.26K', '34.45B'],
  30: ['10 years, 253 days, 2h, 43m, 0s', '259.26K', '41.93B'],
  31: ['12 years, 197 days, 21h, 9m, 0s', '284.26K', '50.70B'],
  32: ['14 years, 235 days, 4h, 50m, 0s', '309.26K', '60.93B'],
  33: ['17 years, 9 days, 10h, 1m, 0s', '334.26K', '72.80B'],
  34: ['19 years, 260 days, 11h, 42m, 0s', '359.26K', '86.52B'],
  35: ['22 years, 269 days, 0s', '384.26K', '102.30B'],
  36: ['26 years, 46 days, 4h, 42m, 0s', '409.26K', '120.38B'],
  37: ['29 years, 333 days, 23h, 40m, 0s', '434.26K', '141.02B'],
  38: ['34 years, 49 days, 23h, 21m, 0s', '459.26K', '164.50B'],
  39: ['38 years, 302 days, 11h, 12m, 0s', '484.26K', '191.11B'],
  40: ['44 years, 10 days, 12h, 13m, 0s', '509.26K', '221.18B'],
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

const towerLabs = JSON.parse(fs.readFileSync(towerLabsPath, 'utf8'))['Super Crit Mult']

/** @type {Record<number, [string, string, string, string]>} */
const marginal = { ...MARGINAL_L1_8, ...MARGINAL_L9_40 }

let totalTimeSec = 0
const levels = []

for (let level = 1; level <= 40; level++) {
  const row = marginal[level]
  if (!row) throw new Error(`Missing row for level ${level}`)
  const [value, time, gems, coins] = row
  const tower = towerLabs[String(level)]
  const timeSec = tower.DURATION
  const coinNum = tower.COST
  const gemNum = parseAbbrevNum(gems)
  totalTimeSec += timeSec
  const entry = {
    level,
    value: parseFloat(value),
    time: { display: time, seconds: timeSec },
    gems: gemNum,
    coins: coinNum,
    totalTime: { display: formatTime(totalTimeSec), seconds: totalTimeSec },
    totalGems: 0,
    totalCoins: 0,
  }
  levels.push(entry)
}

let runGems = 0
let runCoins = 0
for (const entry of levels) {
  runGems += entry.gems
  runCoins += entry.coins
  entry.totalGems = runGems
  entry.totalCoins = runCoins
  const totals = TOTAL_DISPLAY[entry.level]
  if (totals) {
    const [totalTime, totalGems, totalCoins] = totals
    entry.totalTime.display = totalTime
    entry.totalTime.seconds = parseTimeToSeconds(totalTime)
    entry.totalGems = parseAbbrevNum(totalGems)
    entry.totalCoins = parseAbbrevNum(totalCoins)
  }
}

const doc = {
  name: 'Super Crit Mult',
  maxLevel: 40,
  levels,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
console.log('Wrote', outPath, `(${levels.length} levels, screenshot data only)`)
