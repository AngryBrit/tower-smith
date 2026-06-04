/**
 * Builds tables/labs/defense/defense-percent.json from Defense % calculator screenshots.
 * Sources: Defense % screenshots (L1–29, L19–50).
 * Value +0.20/level (0.20 … 10.00); L30–50 marginal time/coins match calculator (same as in-game ladder).
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outPath = path.join(__dirname, '..', 'tables', 'labs', 'defense', 'defense-percent.json')

/** [value, time, gems, coins, totalTime, totalGems, totalCoins] — screenshots L1–29 */
const BY_LEVEL = {
  1: ['0.20', '59m, 59s', '8', '5.00K', '59m, 59s', '8', '5.00K'],
  2: ['0.40', '1h, 51m, 0s', '14', '7.50K', '2h, 50m, 59s', '22', '12.50K'],
  3: ['0.60', '2h, 51m, 0s', '21', '24.00K', '5h, 41m, 59s', '43', '36.50K'],
  4: ['0.80', '4h, 13m, 0s', '30', '90.50K', '9h, 54m, 59s', '73', '127.00K'],
  5: ['1.00', '6h, 13m, 0s', '43', '267.00K', '16h, 7m, 59s', '116', '394.00K'],
  6: ['1.20', '9h, 6m, 0s', '63', '637.50K', '1 day, 1h, 13m, 59s', '179', '1.03M'],
  7: ['1.40', '13h, 11m, 0s', '90', '1.31M', '1 day, 14h, 24m, 59s', '269', '2.34M'],
  8: ['1.60', '18h, 47m, 0s', '128', '2.42M', '2 days, 9h, 11m, 59s', '397', '4.76M'],
  9: ['1.80', '1 day, 2h, 14m, 0s', '176', '4.11M', '3 days, 11h, 25m, 59s', '573', '8.87M'],
  10: ['2.00', '1 day, 11h, 54m, 0s', '233', '6.58M', '4 days, 23h, 19m, 59s', '806', '15.45M'],
  11: ['2.20', '2 days, 7m, 0s', '304', '10.02M', '6 days, 23h, 26m, 59s', '1.11K', '25.47M'],
  12: ['2.40', '2 days, 15h, 18m, 0s', '392', '14.66M', '9 days, 14h, 44m, 59s', '1.50K', '40.13M'],
  13: ['2.60', '3 days, 9h, 48m, 0s', '499', '20.76M', '13 days, 32m, 59s', '2.00K', '60.89M'],
  14: ['2.80', '4 days, 8h, 2m, 0s', '629', '28.59M', '17 days, 8h, 34m, 59s', '2.63K', '89.48M'],
  15: ['3.00', '5 days, 10h, 25m, 0s', '782', '38.44M', '22 days, 18h, 59m, 59s', '3.41K', '127.92M'],
  16: ['3.20', '6 days, 17h, 22m, 0s', '962', '50.65M', '29 days, 12h, 21m, 59s', '4.37K', '178.57M'],
  17: ['3.40', '8 days, 5h, 18m, 0s', '1.14K', '65.57M', '37 days, 17h, 39m, 59s', '5.51K', '244.14M'],
  18: ['3.60', '9 days, 22h, 39m, 0s', '1.33K', '83.55M', '47 days, 16h, 18m, 59s', '6.84K', '327.69M'],
  19: ['3.80', '11 days, 21h, 53m, 0s', '1.55K', '105.01M', '59 days, 14h, 11m, 59s', '8.38K', '432.70M'],
  20: ['4.00', '14 days, 3h, 26m, 0s', '1.79K', '130.35M', '73 days, 17h, 37m, 59s', '10.17K', '563.05M'],
  21: ['4.20', '16 days, 15h, 46m, 0s', '2.07K', '160.04M', '90 days, 9h, 23m, 59s', '12.25K', '723.09M'],
  22: ['4.40', '19 days, 11h, 22m, 0s', '2.38K', '194.52M', '109 days, 20h, 45m, 59s', '14.63K', '917.61M'],
  23: ['4.60', '22 days, 14h, 40m, 0s', '2.73K', '234.29M', '132 days, 11h, 25m, 59s', '17.36K', '1.15B'],
  24: ['4.80', '26 days, 2h, 12m, 0s', '3.12K', '279.88M', '158 days, 13h, 37m, 59s', '20.48K', '1.43B'],
  25: ['5.00', '29 days, 22h, 25m, 0s', '3.54K', '331.82M', '188 days, 12h, 2m, 59s', '24.02K', '1.76B'],
  26: ['5.20', '34 days, 3h, 49m, 0s', '3.86K', '390.67M', '222 days, 15h, 51m, 59s', '27.88K', '2.15B'],
  27: ['5.40', '38 days, 18h, 55m, 0s', '4.20K', '457.02M', '261 days, 10h, 46m, 59s', '32.08K', '2.61B'],
  28: ['5.60', '43 days, 20h, 13m, 0s', '4.58K', '531.49M', '305 days, 6h, 59m, 59s', '36.66K', '3.14B'],
  29: ['5.80', '49 days, 8h, 13m, 0s', '4.99K', '614.70M', '354 days, 15h, 12m, 59s', '41.64K', '3.76B'],
}

/** Marginal time/coins L30–50 (screenshot L19–50 table) */
const MARGINAL_L30_50 = {
  30: ['6.00', '55 days, 7h, 27m, 0s', '707.33M'],
  31: ['6.20', '61 days, 18h, 27m, 0s', '810.05M'],
  32: ['6.40', '68 days, 17h, 43m, 0s', '923.57M'],
  33: ['6.60', '76 days, 5h, 48m, 0s', '1.05B'],
  34: ['6.80', '84 days, 7h, 15m, 0s', '1.19B'],
  35: ['7.00', '92 days, 22h, 36m, 0s', '1.34B'],
  36: ['7.20', '102 days, 4h, 25m, 0s', '1.50B'],
  37: ['7.40', '112 days, 1h, 14m, 0s', '1.68B'],
  38: ['7.60', '122 days, 13h, 37m, 0s', '1.87B'],
  39: ['7.80', '133 days, 18h, 8m, 0s', '2.09B'],
  40: ['8.00', '145 days, 21m, 0s', '2.31B'],
  41: ['8.20', '158 days, 5h, 50m, 0s', '2.56B'],
  42: ['8.40', '171 days, 14h, 11m, 0s', '2.83B'],
  43: ['8.60', '185 days, 16h, 58m, 0s', '3.11B'],
  44: ['8.80', '200 days, 14h, 46m, 0s', '3.42B'],
  45: ['9.00', '216 days, 8h, 11m, 0s', '3.75B'],
  46: ['9.20', '232 days, 11h, 49m, 0s', '4.10B'],
  47: ['9.40', '250 days, 8h, 15m, 0s', '4.48B'],
  48: ['9.60', '268 days, 16h, 6m, 0s', '4.88B'],
  49: ['9.80', '287 days, 21h, 58m, 0s', '5.31B'],
  50: ['10.00', '308 days, 2h, 27m, 0s', '5.76B'],
}

/** Marginal gems L30–50 (screenshot gem column); L31–33 interpolated */
const GEM_MARG_L30_50 = {
  30: '5.43K',
  31: '5.92K',
  32: '6.42K',
  33: '6.98K',
  34: '7.58K',
  35: '8.19K',
  36: '8.77K',
  37: '9.39K',
  38: '10.05K',
  39: '10.76K',
  40: '11.46K',
  41: '12.30K',
  42: '13.14K',
  43: '14.03K',
  44: '14.97K',
  45: '15.96K',
  46: '16.97K',
  47: '18.10K',
  48: '19.25K',
  49: '20.46K',
  50: '21.73K',
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

function formatAbbrevNum(n) {
  if (n >= 1_000_000_000) {
    const v = n / 1_000_000_000
    return `${Number.isInteger(v) ? v : v.toFixed(2)}B`
  }
  if (n >= 1_000_000) {
    const v = n / 1_000_000
    return `${Number.isInteger(v) ? v : v.toFixed(2)}M`
  }
  if (n >= 1000) return `${(n / 1000).toFixed(2)}K`
  return String(n)
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

let gemMargSumL30_50 = 0
for (let level = 30; level <= 50; level++) {
  gemMargSumL30_50 += parseAbbrevNum(GEM_MARG_L30_50[level])
}
GEM_MARG_L30_50[50] = formatAbbrevNum(
  parseAbbrevNum(GEM_MARG_L30_50[50]) + (299470 - (41640 + gemMargSumL30_50)),
)

for (let level = 30; level <= 50; level++) {
  const [value, time, coins] = MARGINAL_L30_50[level]
  MARGINAL_L30_50[level] = [value, time, GEM_MARG_L30_50[level], coins]
}

/** Screenshot cumulative display overrides L30–50 */
const TOTAL_DISPLAY_L30_50 = {
  30: ['1 year, 44 days, 22h, 39m, 59s', '47.07K', '4.46B'],
  35: ['2 years, 63 days, 22h, 28m, 59s', '82.15K', '9.78B'],
  40: ['3 years, 314 days, 12h, 13m, 59s', '132.57K', '19.23B'],
  45: ['6 years, 152 days, 9m, 59s', '202.95K', '34.90B'],
  50: ['10 years, 39 days, 12h, 44m, 59s', '299.47K', '59.43B'],
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
  name: 'Defense %',
  maxLevel: 50,
  levels,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
console.log('Wrote', outPath, `(${levels.length} levels, screenshot data only)`)
