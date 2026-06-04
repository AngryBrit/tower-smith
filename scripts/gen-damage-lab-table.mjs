/**
 * Builds tables/labs/attack/damage.json from lab calculator screenshots only.
 * Sources: lab calculator screenshots (L1–100).
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outPath = path.join(__dirname, '..', 'tables', 'labs', 'attack', 'damage.json')

/** [value, time, gems, coins, totalTime, totalGems, totalCoins] — display strings from screenshots */
const BY_LEVEL = {
  1: ['1.02', '14s', '1', '30', '14s', '1', '30'],
  2: ['1.04', '6m, 24s', '1', '71', '6m, 38s', '2', '101'],
  3: ['1.06', '16m, 24s', '3', '178', '23m, 2s', '5', '279'],
  4: ['1.08', '31m, 32s', '4', '398', '54m, 34s', '9', '677'],
  5: ['1.10', '52m, 45s', '7', '772', '1h, 47m, 19s', '16', '1.45K'],
  6: ['1.12', '1h, 20m, 0s', '10', '1.34K', '3h, 7m, 19s', '26', '2.79K'],
  7: ['1.14', '1h, 56m, 0s', '14', '2.12K', '5h, 3m, 19s', '40', '4.91K'],
  8: ['1.16', '2h, 39m, 0s', '19', '3.17K', '7h, 42m, 19s', '59', '8.08K'],
  9: ['1.18', '3h, 31m, 0s', '25', '4.51K', '11h, 13m, 19s', '84', '12.59K'],
  10: ['1.20', '4h, 32m, 0s', '32', '6.17K', '15h, 45m, 19s', '116', '18.76K'],
  11: ['1.22', '5h, 43m, 0s', '40', '8.17K', '21h, 28m, 19s', '156', '26.93K'],
  12: ['1.24', '7h, 3m, 0s', '49', '10.56K', '1 day, 4h, 31m, 19s', '205', '37.49K'],
  13: ['1.26', '8h, 34m, 0s', '59', '13.35K', '1 day, 13h, 5m, 19s', '264', '50.84K'],
  14: ['1.28', '10h, 15m, 0s', '71', '16.58K', '1 day, 23h, 20m, 19s', '335', '67.42K'],
  15: ['1.30', '12h, 7m, 0s', '83', '20.27K', '2 days, 11h, 27m, 19s', '418', '87.69K'],
  16: ['1.32', '14h, 10m, 0s', '97', '24.44K', '3 days, 1h, 37m, 19s', '515', '112.13K'],
  17: ['1.34', '16h, 25m, 0s', '112', '29.13K', '3 days, 18h, 2m, 19s', '627', '141.26K'],
  18: ['1.36', '18h, 52m, 0s', '129', '34.36K', '4 days, 12h, 54m, 19s', '756', '175.62K'],
  19: ['1.38', '21h, 31m, 0s', '147', '40.16K', '5 days, 10h, 25m, 19s', '903', '215.78K'],
  20: ['1.40', '1 day, 22m, 0s', '166', '46.54K', '6 days, 10h, 47m, 19s', '1.07K', '262.32K'],
  21: ['1.42', '1 day, 3h, 26m, 0s', '183', '53.53K', '7 days, 14h, 13m, 19s', '1.25K', '315.85K'],
  22: ['1.44', '1 day, 6h, 44m, 0s', '203', '61.16K', '8 days, 20h, 57m, 19s', '1.46K', '377.01K'],
  23: ['1.46', '1 day, 10h, 14m, 0s', '223', '69.46K', '10 days, 7h, 11m, 19s', '1.68K', '446.47K'],
  24: ['1.48', '1 day, 13h, 58m, 0s', '245', '78.43K', '11 days, 21h, 9m, 19s', '1.92K', '524.90K'],
  25: ['1.50', '1 day, 17h, 56m, 0s', '268', '88.12K', '13 days, 15h, 5m, 19s', '2.19K', '613.02K'],
  26: ['1.52', '1 day, 22h, 7m, 0s', '292', '98.53K', '15 days, 13h, 12m, 19s', '2.48K', '711.55K'],
  27: ['1.54', '2 days, 2h, 33m, 0s', '318', '109.70K', '17 days, 15h, 45m, 19s', '2.80K', '821.25K'],
  28: ['1.56', '2 days, 7h, 13m, 0s', '345', '121.65K', '19 days, 22h, 58m, 19s', '3.15K', '942.90K'],
  29: ['1.58', '2 days, 12h, 8m, 0s', '374', '134.39K', '22 days, 11h, 6m, 19s', '3.52K', '1.08M'],
  30: ['1.60', '2 days, 17h, 18m, 0s', '404', '147.95K', '25 days, 4h, 24m, 19s', '3.92K', '1.23M'],
  31: ['1.62', '2 days, 22h, 43m, 0s', '435', '162.35K', '28 days, 3h, 7m, 19s', '4.36K', '1.39M'],
  32: ['1.64', '3 days, 4h, 23m, 0s', '468', '177.62K', '31 days, 7h, 30m, 19s', '4.83K', '1.57M'],
  33: ['1.66', '3 days, 10h, 18m, 0s', '502', '193.78K', '34 days, 17h, 48m, 19s', '5.33K', '1.76M'],
  34: ['1.68', '3 days, 16h, 30m, 0s', '538', '210.83K', '38 days, 10h, 18m, 19s', '5.87K', '1.97M'],
  35: ['1.70', '3 days, 22h, 57m, 0s', '576', '228.82K', '42 days, 9h, 15m, 19s', '6.44K', '2.20M'],
  36: ['1.72', '4 days, 5h, 40m, 0s', '615', '247.76K', '46 days, 14h, 55m, 19s', '7.06K', '2.45M'],
  37: ['1.74', '4 days, 12h, 40m, 0s', '656', '267.66K', '51 days, 3h, 35m, 19s', '7.71K', '2.71M'],
  38: ['1.76', '4 days, 19h, 55m, 0s', '698', '288.56K', '55 days, 23h, 30m, 19s', '8.41K', '3.00M'],
  39: ['1.78', '5 days, 3h, 28m, 0s', '742', '310.47K', '61 days, 2h, 58m, 19s', '9.15K', '3.31M'],
  40: ['1.80', '5 days, 11h, 17m, 0s', '787', '333.40K', '66 days, 14h, 15m, 19s', '9.94K', '3.65M'],
  41: ['1.82', '5 days, 19h, 24m, 0s', '834', '357.39K', '72 days, 9h, 39m, 19s', '10.78K', '4.00M'],
  42: ['1.84', '6 days, 3h, 47m, 0s', '883', '382.45K', '78 days, 13h, 26m, 19s', '11.66K', '4.39M'],
  43: ['1.86', '6 days, 12h, 28m, 0s', '933', '408.60K', '85 days, 1h, 54m, 19s', '12.59K', '4.79M'],
  44: ['1.88', '6 days, 21h, 26m, 0s', '986', '435.87K', '91 days, 23h, 20m, 19s', '13.58K', '5.23M'],
  45: ['1.90', '7 days, 6h, 42m, 0s', '1.03K', '464.26K', '99 days, 6h, 2m, 19s', '14.61K', '5.70M'],
  46: ['1.92', '7 days, 16h, 15m, 0s', '1.08K', '493.81K', '106 days, 22h, 17m, 19s', '15.68K', '6.19M'],
  47: ['1.94', '8 days, 2h, 7m, 0s', '1.12K', '524.53K', '115 days, 24m, 19s', '16.81K', '6.71M'],
  48: ['1.96', '8 days, 12h, 17m, 0s', '1.17K', '556.43K', '123 days, 12h, 41m, 19s', '17.97K', '7.27M'],
  49: ['1.98', '8 days, 22h, 45m, 0s', '1.22K', '589.55K', '132 days, 11h, 26m, 19s', '19.19K', '7.86M'],
  50: ['2.00', '9 days, 9h, 31m, 0s', '1.27K', '623.89K', '141 days, 20h, 57m, 19s', '20.45K', '8.48M'],
  51: ['2.02', '9 days, 20h, 37m, 0s', '1.32K', '659.49K', '151 days, 17h, 34m, 19s', '21.77K', '9.14M'],
  52: ['2.04', '10 days, 8h, 0m, 0s', '1.37K', '696.34K', '162 days, 1h, 34m, 19s', '23.14K', '9.84M'],
  53: ['2.06', '10 days, 19h, 43m, 0s', '1.42K', '734.49K', '172 days, 21h, 17m, 19s', '24.57K', '10.57M'],
  54: ['2.08', '11 days, 7h, 45m, 0s', '1.48K', '773.94K', '184 days, 5h, 2m, 19s', '26.05K', '11.35M'],
  55: ['2.10', '11 days, 20h, 6m, 0s', '1.54K', '814.71K', '196 days, 1h, 8m, 19s', '27.58K', '12.16M'],
  56: ['2.12', '12 days, 8h, 46m, 0s', '1.60K', '856.83K', '208 days, 9h, 54m, 19s', '29.18K', '13.02M'],
  57: ['2.14', '12 days, 21h, 46m, 0s', '1.66K', '900.30K', '221 days, 7h, 40m, 19s', '30.83K', '13.92M'],
  58: ['2.16', '13 days, 11h, 5m, 0s', '1.72K', '945.16K', '234 days, 18h, 45m, 19s', '32.55K', '14.86M'],
  59: ['2.18', '14 days, 44m, 0s', '1.78K', '991.41K', '248 days, 19h, 29m, 19s', '34.33K', '15.86M'],
  60: ['2.20', '14 days, 14h, 43m, 0s', '1.85K', '1.04M', '263 days, 10h, 12m, 19s', '36.17K', '16.90M'],
  61: ['2.22', '15 days, 5h, 3m, 0s', '1.91K', '1.09M', '278 days, 15h, 15m, 19s', '38.09K', '17.99M'],
  62: ['2.24', '15 days, 19h, 42m, 0s', '1.98K', '1.14M', '294 days, 10h, 57m, 19s', '40.06K', '19.13M'],
  63: ['2.26', '16 days, 10h, 41m, 0s', '2.05K', '1.19M', '310 days, 21h, 38m, 19s', '42.11K', '20.32M'],
  64: ['2.28', '17 days, 2h, 1m, 0s', '2.12K', '1.24M', '327 days, 23h, 39m, 19s', '44.23K', '21.56M'],
  65: ['2.30', '17 days, 17h, 42m, 0s', '2.19K', '1.30M', '345 days, 17h, 21m, 19s', '46.42K', '22.86M'],
  66: ['2.32', '18 days, 9h, 43m, 0s', '2.27K', '1.36M', '364 days, 3h, 4m, 19s', '48.69K', '24.22M'],
  67: ['2.34', '19 days, 2h, 5m, 0s', '2.34K', '1.41M', '1 year, 18 days, 5h, 9m, 19s', '51.03K', '25.63M'],
  68: ['2.36', '19 days, 18h, 48m, 0s', '2.42K', '1.47M', '1 year, 37 days, 23h, 57m, 19s', '53.45K', '27.10M'],
  69: ['2.38', '20 days, 11h, 52m, 0s', '2.50K', '1.53M', '1 year, 58 days, 11h, 49m, 19s', '55.94K', '28.63M'],
  70: ['2.40', '21 days, 5h, 17m, 0s', '2.58K', '1.60M', '1 year, 79 days, 17h, 6m, 19s', '58.52K', '30.23M'],
  71: ['2.42', '21 days, 23h, 4m, 0s', '2.66K', '1.66M', '1 year, 101 days, 16h, 10m, 19s', '61.18K', '31.89M'],
  72: ['2.44', '22 days, 17h, 12m, 0s', '2.74K', '1.73M', '1 year, 124 days, 9h, 22m, 19s', '63.92K', '33.62M'],
  73: ['2.46', '23 days, 11h, 41m, 0s', '2.83K', '1.80M', '1 year, 147 days, 21h, 3m, 19s', '66.75K', '35.42M'],
  74: ['2.48', '24 days, 6h, 32m, 0s', '2.92K', '1.87M', '1 year, 172 days, 3h, 35m, 19s', '69.67K', '37.29M'],
  75: ['2.50', '25 days, 1h, 46m, 0s', '3.00K', '1.94M', '1 year, 197 days, 5h, 21m, 19s', '72.67K', '39.23M'],
  76: ['2.52', '25 days, 21h, 20m, 0s', '3.10K', '2.01M', '1 year, 223 days, 2h, 41m, 19s', '75.76K', '41.24M'],
  77: ['2.54', '26 days, 17h, 18m, 0s', '3.19K', '2.08M', '1 year, 249 days, 19h, 59m, 19s', '78.95K', '43.32M'],
  78: ['2.56', '27 days, 13h, 37m, 0s', '3.28K', '2.16M', '1 year, 277 days, 9h, 36m, 19s', '82.23K', '45.48M'],
  79: ['2.58', '28 days, 10h, 18m, 0s', '3.38K', '2.24M', '1 year, 305 days, 19h, 54m, 19s', '85.61K', '47.72M'],
  80: ['2.60', '29 days, 7h, 22m, 0s', '3.47K', '2.32M', '1 year, 335 days, 3h, 16m, 19s', '89.08K', '50.04M'],
  81: ['2.62', '30 days, 4h, 48m, 0s', '3.57K', '2.40M', '2 years, 0 days, 8h, 4m, 19s', '92.65K', '52.44M'],
  82: ['2.64', '31 days, 2h, 37m, 0s', '3.63K', '2.48M', '2 years, 31 days, 10h, 41m, 19s', '96.28K', '54.92M'],
  83: ['2.66', '32 days, 49m, 0s', '3.70K', '2.57M', '2 years, 63 days, 11h, 30m, 19s', '99.98K', '57.49M'],
  84: ['2.68', '32 days, 23h, 24m, 0s', '3.77K', '2.65M', '2 years, 96 days, 10h, 54m, 19s', '103.75K', '60.14M'],
  85: ['2.70', '33 days, 22h, 21m, 0s', '3.84K', '2.74M', '2 years, 130 days, 9h, 15m, 19s', '107.59K', '62.88M'],
  86: ['2.72', '34 days, 21h, 42m, 0s', '3.91K', '2.83M', '2 years, 165 days, 6h, 57m, 19s', '111.51K', '65.71M'],
  87: ['2.74', '35 days, 21h, 26m, 0s', '3.99K', '2.93M', '2 years, 201 days, 4h, 23m, 19s', '115.50K', '68.64M'],
  88: ['2.76', '36 days, 21h, 33m, 0s', '4.06K', '3.02M', '2 years, 238 days, 1h, 56m, 19s', '119.56K', '71.66M'],
  89: ['2.78', '37 days, 22h, 3m, 0s', '4.14K', '3.12M', '2 years, 275 days, 23h, 59m, 19s', '123.70K', '74.78M'],
  90: ['2.80', '38 days, 22h, 57m, 0s', '4.22K', '3.22M', '2 years, 314 days, 22h, 56m, 19s', '127.91K', '78.00M'],
  91: ['2.82', '40 days, 15m, 0s', '4.29K', '3.32M', '2 years, 354 days, 23h, 11m, 19s', '132.20K', '81.32M'],
  92: ['2.84', '41 days, 1h, 56m, 0s', '4.37K', '3.42M', '3 years, 31 days, 1h, 7m, 19s', '136.58K', '84.74M'],
  93: ['2.86', '42 days, 4h, 1m, 0s', '4.45K', '3.52M', '3 years, 73 days, 5h, 8m, 19s', '141.03K', '88.26M'],
  94: ['2.88', '43 days, 6h, 30m, 0s', '4.54K', '3.63M', '3 years, 116 days, 11h, 38m, 19s', '145.56K', '91.89M'],
  95: ['2.90', '44 days, 9h, 23m, 0s', '4.62K', '3.74M', '3 years, 160 days, 21h, 1m, 19s', '150.18K', '95.63M'],
  96: ['2.92', '45 days, 12h, 40m, 0s', '4.70K', '3.85M', '3 years, 206 days, 9h, 41m, 19s', '154.88K', '99.48M'],
  97: ['2.94', '46 days, 16h, 22m, 0s', '4.79K', '3.96M', '3 years, 253 days, 2h, 3m, 19s', '159.67K', '103.44M'],
  98: ['2.96', '47 days, 20h, 27m, 0s', '4.88K', '4.07M', '3 years, 300 days, 22h, 30m, 19s', '164.55K', '107.51M'],
  99: ['2.98', '49 days, 57m, 0s', '4.96K', '4.19M', '3 years, 349 days, 23h, 27m, 19s', '169.51K', '111.70M'],
  100: ['3.00', '50 days, 5h, 52m, 0s', '5.05K', '4.31M', '4 years, 35 days, 5h, 19m, 19s', '174.56K', '116.01M'],
}

function parseAbbrevNum(raw) {
  const s = String(raw).trim().replace(/,/g, '')
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
for (let level = 1; level <= 100; level++) {
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
  name: 'Damage',
  maxLevel: 100,
  levels,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
console.log('Wrote', outPath, `(${levels.length} levels, screenshot data only)`)
