/**
 * Builds tables/labs/utility/cash-bonus.json from Cash Bonus calculator screenshots only.
 * Sources: Cash Bonus screenshots (L1–29, L28–59, L58–89, L68–99).
 * Value x1 + 0.02/level (1.02 … 2.98).
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outPath = path.join(__dirname, '..', 'tables', 'labs', 'utility', 'cash-bonus.json')

/** [value, time, gems, coins, totalTime, totalGems, totalCoins] — screenshot L1–99 */
const BY_LEVEL = {
  1: ['1.02', '14s', '1', '30', '14s', '1', '30'],
  2: ['1.04', '6m, 24s', '1', '71', '6m, 38s', '2', '101'],
  3: ['1.06', '16m, 24s', '3', '178', '23m, 2s', '5', '279'],
  4: ['1.08', '31m, 32s', '4', '398', '54m, 34s', '9', '677'],
  5: ['1.10', '52m, 50s', '7', '782', '1h, 47m, 24s', '16', '1.46K'],
  6: ['1.12', '1h, 20m, 0s', '10', '1.35K', '3h, 7m, 24s', '26', '2.81K'],
  7: ['1.14', '1h, 56m, 0s', '14', '2.13K', '5h, 3m, 24s', '40', '4.94K'],
  8: ['1.16', '2h, 39m, 0s', '19', '3.18K', '7h, 42m, 24s', '59', '8.12K'],
  9: ['1.18', '3h, 31m, 0s', '25', '4.52K', '11h, 13m, 24s', '84', '12.64K'],
  10: ['1.20', '4h, 32m, 0s', '32', '6.18K', '15h, 45m, 24s', '116', '18.82K'],
  11: ['1.22', '5h, 43m, 0s', '40', '8.18K', '21h, 28m, 24s', '156', '27.00K'],
  12: ['1.24', '7h, 3m, 0s', '49', '10.57K', '1 day, 4h, 31m, 24s', '205', '37.57K'],
  13: ['1.26', '8h, 34m, 0s', '59', '13.36K', '1 day, 13h, 5m, 24s', '264', '50.93K'],
  14: ['1.28', '10h, 15m, 0s', '71', '16.59K', '1 day, 23h, 20m, 24s', '335', '67.52K'],
  15: ['1.30', '12h, 7m, 0s', '83', '20.28K', '2 days, 11h, 27m, 24s', '418', '87.80K'],
  16: ['1.32', '14h, 10m, 0s', '97', '24.45K', '3 days, 1h, 37m, 24s', '515', '112.25K'],
  17: ['1.34', '16h, 25m, 0s', '112', '29.14K', '3 days, 18h, 2m, 24s', '627', '141.39K'],
  18: ['1.36', '18h, 52m, 0s', '129', '34.37K', '4 days, 12h, 54m, 24s', '756', '175.76K'],
  19: ['1.38', '21h, 31m, 0s', '147', '40.17K', '5 days, 10h, 25m, 24s', '903', '215.93K'],
  20: ['1.40', '1 day, 22m, 0s', '166', '46.55K', '6 days, 10h, 47m, 24s', '1.07K', '262.48K'],
  21: ['1.42', '1 day, 3h, 27m, 0s', '184', '53.54K', '7 days, 14h, 14m, 24s', '1.25K', '316.02K'],
  22: ['1.44', '1 day, 6h, 44m, 0s', '203', '61.17K', '8 days, 20h, 58m, 24s', '1.46K', '377.19K'],
  23: ['1.46', '1 day, 10h, 14m, 0s', '223', '69.47K', '10 days, 7h, 12m, 24s', '1.68K', '446.66K'],
  24: ['1.48', '1 day, 13h, 58m, 0s', '245', '78.44K', '11 days, 21h, 10m, 24s', '1.92K', '525.10K'],
  25: ['1.50', '1 day, 17h, 56m, 0s', '268', '88.13K', '13 days, 15h, 6m, 24s', '2.19K', '613.23K'],
  26: ['1.52', '1 day, 22h, 7m, 0s', '292', '98.54K', '15 days, 13h, 13m, 24s', '2.48K', '711.77K'],
  27: ['1.54', '2 days, 2h, 33m, 0s', '318', '109.71K', '17 days, 15h, 46m, 24s', '2.80K', '821.48K'],
  28: ['1.56', '2 days, 7h, 13m, 0s', '345', '121.66K', '19 days, 22h, 59m, 24s', '3.15K', '943.14K'],
  29: ['1.58', '2 days, 12h, 8m, 0s', '374', '134.40K', '22 days, 11h, 7m, 24s', '3.52K', '1.08M'],
  30: ['1.60', '2 days, 17h, 18m, 0s', '404', '147.96K', '25 days, 4h, 25m, 24s', '3.93K', '1.23M'],
  31: ['1.62', '2 days, 22h, 43m, 0s', '435', '162.36K', '28 days, 3h, 8m, 24s', '4.36K', '1.39M'],
  32: ['1.64', '3 days, 4h, 23m, 0s', '468', '177.63K', '31 days, 7h, 31m, 24s', '4.83K', '1.57M'],
  33: ['1.66', '3 days, 10h, 19m, 0s', '502', '193.79K', '34 days, 17h, 50m, 24s', '5.33K', '1.76M'],
  34: ['1.68', '3 days, 16h, 30m, 0s', '538', '210.84K', '38 days, 10h, 20m, 24s', '5.87K', '1.97M'],
  35: ['1.70', '3 days, 22h, 57m, 0s', '576', '228.83K', '42 days, 9h, 17m, 24s', '6.44K', '2.20M'],
  36: ['1.72', '4 days, 5h, 40m, 0s', '615', '247.77K', '46 days, 14h, 57m, 24s', '7.06K', '2.45M'],
  37: ['1.74', '4 days, 12h, 40m, 0s', '656', '267.67K', '51 days, 3h, 37m, 24s', '7.72K', '2.71M'],
  38: ['1.76', '4 days, 19h, 55m, 0s', '698', '288.57K', '55 days, 23h, 32m, 24s', '8.41K', '3.00M'],
  39: ['1.78', '5 days, 3h, 28m, 0s', '742', '310.48K', '61 days, 3h, 0m, 24s', '9.15K', '3.31M'],
  40: ['1.80', '5 days, 11h, 17m, 0s', '787', '333.41K', '66 days, 14h, 17m, 24s', '9.94K', '3.65M'],
  41: ['1.82', '5 days, 19h, 24m, 0s', '834', '357.40K', '72 days, 9h, 41m, 24s', '10.78K', '4.00M'],
  42: ['1.84', '6 days, 3h, 47m, 0s', '883', '382.46K', '78 days, 13h, 28m, 24s', '11.66K', '4.39M'],
  43: ['1.86', '6 days, 12h, 28m, 0s', '933', '408.61K', '85 days, 1h, 56m, 24s', '12.59K', '4.80M'],
  44: ['1.88', '6 days, 21h, 26m, 0s', '986', '435.88K', '91 days, 23h, 22m, 24s', '13.58K', '5.23M'],
  45: ['1.90', '7 days, 6h, 42m, 0s', '1.03K', '464.27K', '99 days, 6h, 4m, 24s', '14.61K', '5.70M'],
  46: ['1.92', '7 days, 16h, 16m, 0s', '1.08K', '493.82K', '106 days, 22h, 20m, 24s', '15.69K', '6.19M'],
  47: ['1.94', '8 days, 2h, 7m, 0s', '1.12K', '524.54K', '115 days, 27m, 24s', '16.81K', '6.71M'],
  48: ['1.96', '8 days, 12h, 17m, 0s', '1.17K', '556.44K', '123 days, 12h, 44m, 24s', '17.97K', '7.27M'],
  49: ['1.98', '8 days, 22h, 45m, 0s', '1.22K', '589.56K', '132 days, 11h, 29m, 24s', '19.19K', '7.86M'],
  50: ['2.00', '9 days, 9h, 32m, 0s', '1.27K', '623.89K', '141 days, 21h, 1m, 24s', '20.46K', '8.48M'],
  51: ['2.02', '9 days, 20h, 37m, 0s', '1.32K', '659.50K', '151 days, 17h, 38m, 24s', '21.77K', '9.14M'],
  52: ['2.04', '10 days, 8h, 0m, 0s', '1.37K', '696.35K', '162 days, 1h, 38m, 24s', '23.14K', '9.84M'],
  53: ['2.06', '10 days, 19h, 43m, 0s', '1.42K', '734.50K', '172 days, 21h, 21m, 24s', '24.57K', '10.57M'],
  54: ['2.08', '11 days, 7h, 45m, 0s', '1.48K', '773.95K', '184 days, 5h, 6m, 24s', '26.05K', '11.35M'],
  55: ['2.10', '11 days, 20h, 6m, 0s', '1.54K', '814.72K', '196 days, 1h, 12m, 24s', '27.58K', '12.16M'],
  56: ['2.12', '12 days, 8h, 46m, 0s', '1.60K', '856.84K', '208 days, 9h, 58m, 24s', '29.18K', '13.02M'],
  57: ['2.14', '12 days, 21h, 46m, 0s', '1.66K', '900.31K', '221 days, 7h, 44m, 24s', '30.83K', '13.92M'],
  58: ['2.16', '13 days, 11h, 5m, 0s', '1.72K', '945.16K', '234 days, 18h, 49m, 24s', '32.55K', '14.87M'],
  59: ['2.18', '14 days, 45m, 0s', '1.78K', '991.42K', '248 days, 19h, 34m, 24s', '34.33K', '15.86M'],
  60: ['2.20', '14 days, 14h, 44m, 0s', '1.85K', '1.04M', '263 days, 10h, 18m, 24s', '36.18K', '16.90M'],
  61: ['2.22', '15 days, 5h, 3m, 0s', '1.91K', '1.09M', '278 days, 15h, 21m, 24s', '38.09K', '17.99M'],
  62: ['2.24', '15 days, 19h, 42m, 0s', '1.98K', '1.14M', '294 days, 11h, 3m, 24s', '40.07K', '19.13M'],
  63: ['2.26', '16 days, 10h, 41m, 0s', '2.05K', '1.19M', '310 days, 21h, 44m, 24s', '42.11K', '20.32M'],
  64: ['2.28', '17 days, 2h, 1m, 0s', '2.12K', '1.24M', '327 days, 23h, 45m, 24s', '44.23K', '21.56M'],
  65: ['2.30', '17 days, 17h, 42m, 0s', '2.19K', '1.30M', '345 days, 17h, 27m, 24s', '46.42K', '22.86M'],
  66: ['2.32', '18 days, 9h, 43m, 0s', '2.27K', '1.36M', '364 days, 3h, 10m, 24s', '48.69K', '24.22M'],
  67: ['2.34', '19 days, 2h, 5m, 0s', '2.34K', '1.41M', '1 year, 18 days, 5h, 15m, 24s', '51.03K', '25.63M'],
  68: ['2.36', '19 days, 18h, 48m, 0s', '2.42K', '1.47M', '1 year, 38 days, 3m, 24s', '53.45K', '27.10M'],
  69: ['2.38', '20 days, 11h, 52m, 0s', '2.50K', '1.53M', '1 year, 58 days, 11h, 55m, 24s', '55.94K', '28.63M'],
  70: ['2.40', '21 days, 5h, 17m, 0s', '2.58K', '1.60M', '1 year, 79 days, 17h, 12m, 24s', '58.52K', '30.23M'],
  71: ['2.42', '21 days, 23h, 4m, 0s', '2.66K', '1.66M', '1 year, 101 days, 16h, 16m, 24s', '61.18K', '31.89M'],
  72: ['2.44', '22 days, 17h, 12m, 0s', '2.74K', '1.73M', '1 year, 124 days, 9h, 28m, 24s', '63.92K', '33.62M'],
  73: ['2.46', '23 days, 11h, 41m, 0s', '2.83K', '1.80M', '1 year, 147 days, 21h, 9m, 24s', '66.75K', '35.42M'],
  74: ['2.48', '24 days, 6h, 33m, 0s', '2.92K', '1.87M', '1 year, 172 days, 3h, 42m, 24s', '69.67K', '37.29M'],
  75: ['2.50', '25 days, 1h, 46m, 0s', '3.00K', '1.94M', '1 year, 197 days, 5h, 28m, 24s', '72.67K', '39.23M'],
  76: ['2.52', '25 days, 21h, 21m, 0s', '3.10K', '2.01M', '1 year, 223 days, 2h, 49m, 24s', '75.77K', '41.24M'],
  77: ['2.54', '26 days, 17h, 18m, 0s', '3.19K', '2.08M', '1 year, 249 days, 20h, 7m, 24s', '78.95K', '43.32M'],
  78: ['2.56', '27 days, 13h, 37m, 0s', '3.28K', '2.16M', '1 year, 277 days, 9h, 44m, 24s', '82.23K', '45.48M'],
  79: ['2.58', '28 days, 10h, 18m, 0s', '3.38K', '2.24M', '1 year, 305 days, 20h, 2m, 24s', '85.61K', '47.72M'],
  80: ['2.60', '29 days, 7h, 22m, 0s', '3.47K', '2.32M', '1 year, 335 days, 3h, 24m, 24s', '89.08K', '50.04M'],
  81: ['2.62', '30 days, 4h, 48m, 0s', '3.57K', '2.40M', '2 years, 0 days, 8h, 12m, 24s', '92.65K', '52.44M'],
  82: ['2.64', '31 days, 2h, 37m, 0s', '3.63K', '2.48M', '2 years, 31 days, 10h, 49m, 24s', '96.28K', '54.92M'],
  83: ['2.66', '32 days, 49m, 0s', '3.70K', '2.57M', '2 years, 63 days, 11h, 38m, 24s', '99.98K', '57.49M'],
  84: ['2.68', '32 days, 23h, 24m, 0s', '3.77K', '2.65M', '2 years, 96 days, 11h, 2m, 24s', '103.75K', '60.14M'],
  85: ['2.70', '33 days, 22h, 21m, 0s', '3.84K', '2.74M', '2 years, 130 days, 9h, 23m, 24s', '107.60K', '62.88M'],
  86: ['2.72', '34 days, 21h, 42m, 0s', '3.91K', '2.83M', '2 years, 165 days, 7h, 5m, 24s', '111.51K', '65.71M'],
  87: ['2.74', '35 days, 21h, 26m, 0s', '3.99K', '2.93M', '2 years, 201 days, 4h, 31m, 24s', '115.50K', '68.64M'],
  88: ['2.76', '36 days, 21h, 33m, 0s', '4.06K', '3.02M', '2 years, 238 days, 2h, 4m, 24s', '119.56K', '71.66M'],
  89: ['2.78', '37 days, 22h, 3m, 0s', '4.14K', '3.12M', '2 years, 276 days, 7m, 24s', '123.70K', '74.78M'],
  90: ['2.80', '38 days, 22h, 57m, 0s', '4.22K', '3.22M', '2 years, 314 days, 23h, 4m, 24s', '127.91K', '78.00M'],
  91: ['2.82', '40 days, 15m, 0s', '4.29K', '3.32M', '2 years, 354 days, 23h, 19m, 24s', '132.21K', '81.32M'],
  92: ['2.84', '41 days, 1h, 56m, 0s', '4.37K', '3.42M', '3 years, 31 days, 1h, 15m, 24s', '136.58K', '84.74M'],
  93: ['2.86', '42 days, 4h, 1m, 0s', '4.45K', '3.52M', '3 years, 73 days, 5h, 16m, 24s', '141.03K', '88.26M'],
  94: ['2.88', '43 days, 6h, 30m, 0s', '4.54K', '3.63M', '3 years, 116 days, 11h, 46m, 24s', '145.57K', '91.89M'],
  95: ['2.90', '44 days, 9h, 23m, 0s', '4.62K', '3.74M', '3 years, 160 days, 21h, 9m, 24s', '150.18K', '95.63M'],
  96: ['2.92', '45 days, 12h, 40m, 0s', '4.70K', '3.85M', '3 years, 206 days, 9h, 49m, 24s', '154.89K', '99.48M'],
  97: ['2.94', '46 days, 16h, 22m, 0s', '4.79K', '3.96M', '3 years, 253 days, 2h, 11m, 24s', '159.67K', '103.44M'],
  98: ['2.96', '47 days, 20h, 27m, 0s', '4.88K', '4.07M', '3 years, 300 days, 22h, 38m, 24s', '164.55K', '107.51M'],
  99: ['2.98', '49 days, 58m, 0s', '4.96K', '4.19M', '3 years, 349 days, 23h, 36m, 24s', '169.51K', '111.70M'],
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
for (let level = 1; level <= 99; level++) {
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
  name: 'Cash Bonus',
  maxLevel: 99,
  levels,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
console.log('Wrote', outPath, `(${levels.length} levels, screenshot data only)`)
