/**
 * Builds tables/labs/utility/interest.json from Interest calculator screenshots only.
 * Sources: Interest screenshots (L1–29, L28–59, L58–89, L68–99).
 * Value x1 + 0.02/level (1.02 … 2.98).
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outPath = path.join(__dirname, '..', 'tables', 'labs', 'utility', 'interest.json')

/** [value, time, gems, coins, totalTime, totalGems, totalCoins] — screenshot L1–99 */
const BY_LEVEL = {
  1: ['1.02', '24s', '1', '50', '24s', '1', '50'],
  2: ['1.04', '9m, 54s', '2', '93', '10m, 18s', '3', '143'],
  3: ['1.06', '24m, 9s', '4', '221', '34m, 27s', '7', '364'],
  4: ['1.08', '45m, 42s', '6', '532', '1h, 20m, 9s', '13', '896'],
  5: ['1.10', '1h, 16m, 0s', '10', '1.13K', '2h, 36m, 9s', '23', '2.03K'],
  6: ['1.12', '1h, 58m, 0s', '15', '2.11K', '4h, 34m, 9s', '38', '4.14K'],
  7: ['1.14', '2h, 53m, 0s', '21', '3.59K', '7h, 27m, 9s', '59', '7.73K'],
  8: ['1.16', '4h, 2m, 0s', '29', '5.68K', '11h, 29m, 9s', '88', '13.41K'],
  9: ['1.18', '5h, 27m, 0s', '38', '8.48K', '16h, 56m, 9s', '126', '21.89K'],
  10: ['1.20', '7h, 8m, 0s', '49', '12.13K', '1 day, 4m, 9s', '175', '34.02K'],
  11: ['1.22', '9h, 8m, 0s', '63', '16.72K', '1 day, 9h, 12m, 9s', '238', '50.74K'],
  12: ['1.24', '11h, 27m, 0s', '79', '22.37K', '1 day, 20h, 39m, 9s', '317', '73.11K'],
  13: ['1.26', '14h, 6m, 0s', '97', '29.21K', '2 days, 10h, 45m, 9s', '414', '102.32K'],
  14: ['1.28', '17h, 7m, 0s', '117', '37.35K', '3 days, 3h, 52m, 9s', '531', '139.67K'],
  15: ['1.30', '20h, 31m, 0s', '140', '46.92K', '4 days, 23m, 9s', '671', '186.59K'],
  16: ['1.32', '1 day, 18m, 0s', '165', '58.02K', '5 days, 41m, 9s', '836', '244.61K'],
  17: ['1.34', '1 day, 4h, 30m, 0s', '190', '70.79K', '6 days, 5h, 11m, 9s', '1.03K', '315.40K'],
  18: ['1.36', '1 day, 9h, 7m, 0s', '216', '85.35K', '7 days, 14h, 18m, 9s', '1.24K', '400.75K'],
  19: ['1.38', '1 day, 14h, 11m, 0s', '246', '101.82K', '9 days, 4h, 29m, 9s', '1.49K', '502.57K'],
  20: ['1.40', '1 day, 19h, 43m, 0s', '278', '120.32K', '11 days, 12m, 9s', '1.77K', '622.89K'],
  21: ['1.42', '2 days, 1h, 43m, 0s', '313', '140.98K', '13 days, 1h, 55m, 9s', '2.08K', '763.87K'],
  22: ['1.44', '2 days, 8h, 12m, 0s', '351', '163.92K', '15 days, 10h, 7m, 9s', '2.43K', '927.79K'],
  23: ['1.46', '2 days, 15h, 11m, 0s', '391', '189.27K', '18 days, 1h, 18m, 9s', '2.82K', '1.12M'],
  24: ['1.48', '2 days, 22h, 41m, 0s', '435', '217.16K', '20 days, 23h, 59m, 9s', '3.26K', '1.33M'],
  25: ['1.50', '3 days, 6h, 44m, 0s', '482', '247.71K', '24 days, 6h, 43m, 9s', '3.74K', '1.58M'],
  26: ['1.52', '3 days, 15h, 19m, 0s', '532', '281.06K', '27 days, 22h, 2m, 9s', '4.27K', '1.86M'],
  27: ['1.54', '4 days, 27m, 0s', '585', '317.32K', '31 days, 22h, 29m, 9s', '4.86K', '2.18M'],
  28: ['1.56', '4 days, 10h, 9m, 0s', '641', '356.63K', '36 days, 8h, 38m, 9s', '5.50K', '2.54M'],
  29: ['1.58', '4 days, 20h, 27m, 0s', '701', '399.12K', '41 days, 5h, 5m, 9s', '6.20K', '2.94M'],
  30: ['1.60', '5 days, 7h, 21m, 0s', '764', '444.91K', '46 days, 12h, 26m, 9s', '6.96K', '3.38M'],
  31: ['1.62', '5 days, 18h, 51m, 0s', '831', '494.15K', '52 days, 7h, 17m, 9s', '7.79K', '3.88M'],
  32: ['1.64', '6 days, 6h, 58m, 0s', '901', '546.94K', '58 days, 14h, 15m, 9s', '8.69K', '4.42M'],
  33: ['1.66', '6 days, 19h, 44m, 0s', '976', '603.44K', '65 days, 9h, 59m, 9s', '9.67K', '5.03M'],
  34: ['1.68', '7 days, 9h, 8m, 0s', '1.04K', '663.77K', '72 days, 19h, 7m, 9s', '10.71K', '5.69M'],
  35: ['1.70', '7 days, 23h, 12m, 0s', '1.11K', '728.06K', '80 days, 18h, 19m, 9s', '11.82K', '6.42M'],
  36: ['1.72', '8 days, 13h, 56m, 0s', '1.18K', '796.44K', '89 days, 8h, 15m, 9s', '13.00K', '7.21M'],
  37: ['1.74', '9 days, 5h, 22m, 0s', '1.25K', '869.05K', '98 days, 13h, 37m, 9s', '14.24K', '8.08M'],
  38: ['1.76', '9 days, 21h, 29m, 0s', '1.32K', '946.02K', '108 days, 11h, 6m, 9s', '15.56K', '9.03M'],
  39: ['1.78', '10 days, 14h, 18m, 0s', '1.40K', '1.03M', '119 days, 1h, 24m, 9s', '16.96K', '10.06M'],
  40: ['1.80', '11 days, 7h, 50m, 0s', '1.48K', '1.11M', '130 days, 9h, 14m, 9s', '18.44K', '11.17M'],
  41: ['1.82', '12 days, 2h, 6m, 0s', '1.57K', '1.20M', '142 days, 11h, 20m, 9s', '20.01K', '12.37M'],
  42: ['1.84', '12 days, 21h, 6m, 0s', '1.65K', '1.30M', '155 days, 8h, 26m, 9s', '21.66K', '13.67M'],
  43: ['1.86', '13 days, 16h, 52m, 0s', '1.74K', '1.40M', '169 days, 1h, 18m, 9s', '23.40K', '15.07M'],
  44: ['1.88', '14 days, 13h, 23m, 0s', '1.84K', '1.51M', '183 days, 14h, 41m, 9s', '25.24K', '16.58M'],
  45: ['1.90', '15 days, 10h, 40m, 0s', '1.94K', '1.62M', '199 days, 1h, 21m, 9s', '27.18K', '18.20M'],
  46: ['1.92', '16 days, 8h, 45m, 0s', '2.04K', '1.73M', '215 days, 10h, 6m, 9s', '29.22K', '19.93M'],
  47: ['1.94', '17 days, 7h, 37m, 0s', '2.14K', '1.86M', '232 days, 17h, 43m, 9s', '31.36K', '21.79M'],
  48: ['1.96', '18 days, 7h, 17m, 0s', '2.25K', '1.99M', '251 days, 1h, 0m, 9s', '33.62K', '23.78M'],
  49: ['1.98', '19 days, 7h, 47m, 0s', '2.37K', '2.12M', '270 days, 8h, 47m, 9s', '35.98K', '25.90M'],
  50: ['2.00', '20 days, 9h, 5m, 0s', '2.48K', '2.26M', '290 days, 17h, 52m, 9s', '38.47K', '28.16M'],
  51: ['2.02', '21 days, 11h, 14m, 0s', '2.61K', '2.40M', '312 days, 5h, 6m, 9s', '41.07K', '30.56M'],
  52: ['2.04', '22 days, 14h, 14m, 0s', '2.73K', '2.56M', '334 days, 19h, 20m, 9s', '43.80K', '33.12M'],
  53: ['2.06', '23 days, 18h, 5m, 0s', '2.86K', '2.72M', '358 days, 13h, 25m, 9s', '46.66K', '35.84M'],
  54: ['2.08', '24 days, 22h, 48m, 0s', '2.99K', '2.88M', '1 year, 18 days, 12h, 13m, 9s', '49.65K', '38.72M'],
  55: ['2.10', '26 days, 4h, 24m, 0s', '3.13K', '3.05M', '1 year, 44 days, 16h, 37m, 9s', '52.78K', '41.77M'],
  56: ['2.12', '27 days, 10h, 52m, 0s', '3.27K', '3.23M', '1 year, 72 days, 3h, 29m, 9s', '56.05K', '45.00M'],
  57: ['2.14', '28 days, 18h, 15m, 0s', '3.41K', '3.42M', '1 year, 100 days, 21h, 44m, 9s', '59.46K', '48.42M'],
  58: ['2.16', '30 days, 2h, 32m, 0s', '3.56K', '3.61M', '1 year, 131 days, 16m, 9s', '63.02K', '52.03M'],
  59: ['2.18', '31 days, 11h, 43m, 0s', '3.66K', '3.81M', '1 year, 162 days, 11h, 59m, 9s', '66.68K', '55.84M'],
  60: ['2.20', '32 days, 21h, 50m, 0s', '3.77K', '4.02M', '1 year, 195 days, 9h, 49m, 9s', '70.44K', '59.86M'],
  61: ['2.22', '34 days, 8h, 54m, 0s', '3.88K', '4.23M', '1 year, 229 days, 18h, 43m, 9s', '74.32K', '64.09M'],
  62: ['2.24', '35 days, 20h, 53m, 0s', '3.99K', '4.45M', '1 year, 265 days, 15h, 36m, 9s', '78.30K', '68.54M'],
  63: ['2.26', '37 days, 9h, 50m, 0s', '4.10K', '4.68M', '1 year, 303 days, 1h, 26m, 9s', '82.40K', '73.22M'],
  64: ['2.28', '38 days, 23h, 45m, 0s', '4.22K', '4.92M', '1 year, 342 days, 1h, 11m, 9s', '86.62K', '78.14M'],
  65: ['2.30', '40 days, 14h, 38m, 0s', '4.34K', '5.17M', '2 years, 17 days, 15h, 49m, 9s', '90.96K', '83.31M'],
  66: ['2.32', '42 days, 6h, 30m, 0s', '4.46K', '5.42M', '2 years, 59 days, 22h, 19m, 9s', '95.42K', '88.73M'],
  67: ['2.34', '43 days, 23h, 21m, 0s', '4.59K', '5.68M', '2 years, 103 days, 21h, 40m, 9s', '100.01K', '94.41M'],
  68: ['2.36', '45 days, 17h, 12m, 0s', '4.72K', '5.96M', '2 years, 149 days, 14h, 52m, 9s', '104.72K', '100.37M'],
  69: ['2.38', '47 days, 12h, 4m, 0s', '4.85K', '6.24M', '2 years, 197 days, 2h, 56m, 9s', '109.57K', '106.61M'],
  70: ['2.40', '49 days, 7h, 57m, 0s', '4.98K', '6.52M', '2 years, 246 days, 10h, 53m, 9s', '114.56K', '113.13M'],
  71: ['2.42', '51 days, 4h, 51m, 0s', '5.12K', '6.82M', '2 years, 297 days, 15h, 44m, 9s', '119.68K', '119.95M'],
  72: ['2.44', '53 days, 2h, 47m, 0s', '5.27K', '7.13M', '2 years, 350 days, 18h, 31m, 9s', '124.94K', '127.08M'],
  73: ['2.46', '55 days, 1h, 46m, 0s', '5.41K', '7.44M', '3 years, 40 days, 20h, 17m, 9s', '130.35K', '134.52M'],
  74: ['2.48', '57 days, 1h, 49m, 0s', '5.56K', '7.77M', '3 years, 97 days, 22h, 6m, 9s', '135.91K', '142.29M'],
  75: ['2.50', '59 days, 2h, 55m, 0s', '5.71K', '8.10M', '3 years, 157 days, 1h, 1m, 9s', '141.62K', '150.39M'],
  76: ['2.52', '61 days, 5h, 5m, 0s', '5.87K', '8.45M', '3 years, 218 days, 6h, 6m, 9s', '147.49K', '158.84M'],
  77: ['2.54', '63 days, 8h, 19m, 0s', '6.02K', '8.80M', '3 years, 281 days, 14h, 25m, 9s', '153.51K', '167.64M'],
  78: ['2.56', '65 days, 12h, 39m, 0s', '6.19K', '9.17M', '3 years, 347 days, 3h, 4m, 9s', '159.70K', '176.81M'],
  79: ['2.58', '67 days, 18h, 5m, 0s', '6.35K', '9.54M', '4 years, 49 days, 21h, 9m, 9s', '166.05K', '186.35M'],
  80: ['2.60', '70 days, 37m, 0s', '6.52K', '9.92M', '4 years, 119 days, 21h, 46m, 9s', '172.57K', '196.27M'],
  81: ['2.62', '72 days, 8h, 16m, 0s', '6.69K', '10.32M', '4 years, 192 days, 6h, 2m, 9s', '179.26K', '206.59M'],
  82: ['2.64', '74 days, 17h, 2m, 0s', '6.87K', '10.72M', '4 years, 266 days, 23h, 4m, 9s', '186.12K', '217.31M'],
  83: ['2.66', '77 days, 2h, 56m, 0s', '7.05K', '11.14M', '4 years, 344 days, 2h, 0m, 9s', '193.17K', '228.45M'],
  84: ['2.68', '79 days, 13h, 58m, 0s', '7.23K', '11.57M', '5 years, 58 days, 15h, 58m, 9s', '200.40K', '240.02M'],
  85: ['2.70', '82 days, 2h, 9m, 0s', '7.41K', '12.00M', '5 years, 140 days, 18h, 7m, 9s', '207.81K', '252.02M'],
  86: ['2.72', '84 days, 15h, 30m, 0s', '7.60K', '12.45M', '5 years, 225 days, 9h, 37m, 9s', '215.41K', '264.47M'],
  87: ['2.74', '87 days, 6h, 0m, 0s', '7.80K', '12.91M', '5 years, 312 days, 15h, 37m, 9s', '223.21K', '277.38M'],
  88: ['2.76', '89 days, 21h, 40m, 0s', '7.99K', '13.38M', '6 years, 37 days, 13h, 17m, 9s', '231.20K', '290.76M'],
  89: ['2.78', '92 days, 14h, 31m, 0s', '8.16K', '13.87M', '6 years, 130 days, 3h, 48m, 9s', '239.37K', '304.63M'],
  90: ['2.80', '95 days, 8h, 33m, 0s', '8.34K', '14.36M', '6 years, 225 days, 12h, 21m, 9s', '247.71K', '318.99M'],
  91: ['2.82', '98 days, 3h, 47m, 0s', '8.51K', '14.87M', '6 years, 323 days, 16h, 8m, 9s', '256.22K', '333.86M'],
  92: ['2.84', '101 days, 13m, 0s', '8.69K', '15.38M', '7 years, 59 days, 16h, 21m, 9s', '264.91K', '349.24M'],
  93: ['2.86', '103 days, 21h, 52m, 0s', '8.88K', '15.91M', '7 years, 163 days, 14h, 13m, 9s', '273.79K', '365.15M'],
  94: ['2.88', '106 days, 20h, 44m, 0s', '9.06K', '16.46M', '7 years, 270 days, 10h, 57m, 9s', '282.85K', '381.61M'],
  95: ['2.90', '109 days, 20h, 50m, 0s', '9.25K', '17.01M', '8 years, 15 days, 7h, 47m, 9s', '292.10K', '398.62M'],
  96: ['2.92', '112 days, 22h, 10m, 0s', '9.44K', '17.58M', '8 years, 128 days, 5h, 57m, 9s', '301.55K', '416.20M'],
  97: ['2.94', '116 days, 44m, 0s', '9.64K', '18.16M', '8 years, 244 days, 6h, 41m, 9s', '311.19K', '434.36M'],
  98: ['2.96', '119 days, 4h, 34m, 0s', '9.84K', '18.75M', '8 years, 363 days, 11h, 15m, 9s', '321.02K', '453.11M'],
  99: ['2.98', '122 days, 9h, 39m, 0s', '10.04K', '19.36M', '9 years, 120 days, 20h, 54m, 9s', '331.07K', '472.47M'],
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
  name: 'Interest',
  maxLevel: 99,
  levels,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
console.log('Wrote', outPath, `(${levels.length} levels, screenshot data only)`)
