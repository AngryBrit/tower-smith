/**
 * Builds tables/labs/main/labs-speed.json from lab calculator screenshots only.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outPath = path.join(__dirname, '..', 'tables', 'labs', 'main', 'labs-speed.json')

/** [value, time, gems, coins, totalTime, totalGems, totalCoins] */
const BY_LEVEL = {
  1: ['0.0', '24s', '1', '40', '24s', '1', '40'],
  2: ['0.0', '9m, 43s', '2', '83', '10m, 7s', '3', '123'],
  3: ['0.1', '22m, 59s', '3', '211', '33m, 6s', '6', '334'],
  4: ['0.1', '42m, 6s', '6', '522', '1h, 15m, 12s', '12', '856'],
  5: ['0.1', '1h, 8m, 0s', '9', '1.12K', '2h, 23m, 12s', '21', '1.98K'],
  6: ['0.1', '1h, 42m, 0s', '13', '2.10K', '4h, 5m, 12s', '34', '4.08K'],
  7: ['0.1', '2h, 25m, 0s', '18', '3.58K', '6h, 30m, 12s', '52', '7.66K'],
  8: ['0.2', '3h, 17m, 0s', '23', '5.67K', '9h, 47m, 12s', '75', '13.33K'],
  9: ['0.2', '4h, 19m, 0s', '30', '8.47K', '14h, 6m, 12s', '105', '21.80K'],
  10: ['0.2', '5h, 32m, 0s', '39', '12.12K', '19h, 38m, 12s', '144', '33.92K'],
  11: ['0.2', '6h, 54m, 0s', '48', '16.71K', '1 day, 2h, 32m, 12s', '192', '50.63K'],
  12: ['0.2', '8h, 28m, 0s', '58', '22.36K', '1 day, 11h, 0m, 12s', '250', '72.99K'],
  13: ['0.3', '10h, 12m, 0s', '70', '29.20K', '1 day, 21h, 12m, 12s', '320', '102.19K'],
  14: ['0.3', '12h, 7m, 0s', '83', '37.34K', '2 days, 9h, 19m, 12s', '403', '139.53K'],
  15: ['0.3', '14h, 14m, 0s', '97', '46.91K', '2 days, 23h, 33m, 12s', '500', '186.44K'],
  16: ['0.3', '16h, 31m, 0s', '113', '58.01K', '3 days, 16h, 4m, 12s', '613', '244.45K'],
  17: ['0.3', '19h, 0m, 0s', '130', '70.78K', '4 days, 11h, 4m, 12s', '743', '315.23K'],
  18: ['0.4', '21h, 41m, 0s', '148', '85.34K', '5 days, 8h, 45m, 12s', '891', '400.57K'],
  19: ['0.4', '1 day, 33m, 0s', '167', '101.81K', '6 days, 9h, 18m, 12s', '1.06K', '502.38K'],
  20: ['0.4', '1 day, 3h, 36m, 0s', '184', '120.31K', '7 days, 12h, 54m, 12s', '1.24K', '622.69K'],
  21: ['0.4', '1 day, 6h, 50m, 0s', '203', '140.97K', '8 days, 19h, 44m, 12s', '1.45K', '763.66K'],
  22: ['0.4', '1 day, 10h, 16m, 0s', '223', '163.91K', '10 days, 6h, 0m, 12s', '1.67K', '927.57K'],
  23: ['0.5', '1 day, 13h, 54m, 0s', '244', '189.26K', '11 days, 19h, 54m, 12s', '1.91K', '1.12M'],
  24: ['0.5', '1 day, 17h, 42m, 0s', '266', '217.15K', '13 days, 13h, 36m, 12s', '2.18K', '1.33M'],
  25: ['0.5', '1 day, 21h, 42m, 0s', '290', '247.70K', '15 days, 11h, 18m, 12s', '2.47K', '1.58M'],
  26: ['0.5', '2 days, 1h, 54m, 0s', '314', '281.05K', '17 days, 13h, 12m, 12s', '2.78K', '1.86M'],
  27: ['0.5', '2 days, 6h, 16m, 0s', '339', '317.31K', '19 days, 19h, 28m, 12s', '3.12K', '2.18M'],
  28: ['0.6', '2 days, 10h, 50m, 0s', '366', '356.62K', '22 days, 6h, 18m, 12s', '3.49K', '2.54M'],
  29: ['0.6', '2 days, 15h, 34m, 0s', '393', '399.11K', '24 days, 21h, 52m, 12s', '3.88K', '2.94M'],
  30: ['0.6', '2 days, 20h, 30m, 0s', '422', '444.90K', '27 days, 18h, 22m, 12s', '4.30K', '3.38M'],
  31: ['0.6', '3 days, 1h, 37m, 0s', '452', '494.14K', '30 days, 19h, 59m, 12s', '4.75K', '3.87M'],
  32: ['0.6', '3 days, 6h, 54m, 0s', '483', '546.93K', '34 days, 2h, 53m, 12s', '5.24K', '4.42M'],
  33: ['0.7', '3 days, 12h, 23m, 0s', '514', '603.43K', '37 days, 15h, 16m, 12s', '5.75K', '5.03M'],
  34: ['0.7', '3 days, 18h, 2m, 0s', '547', '663.76K', '41 days, 9h, 18m, 12s', '6.30K', '5.69M'],
  35: ['0.7', '3 days, 23h, 52m, 0s', '581', '728.05K', '45 days, 9h, 10m, 12s', '6.88K', '6.42M'],
  36: ['0.7', '4 days, 5h, 52m, 0s', '616', '796.43K', '49 days, 15h, 2m, 12s', '7.50K', '7.21M'],
  37: ['0.7', '4 days, 12h, 4m, 0s', '652', '869.04K', '54 days, 3h, 6m, 12s', '8.15K', '8.08M'],
  38: ['0.8', '4 days, 18h, 25m, 0s', '689', '946.01K', '58 days, 21h, 31m, 12s', '8.84K', '9.03M'],
  39: ['0.8', '5 days, 57m, 0s', '727', '1.03M', '63 days, 22h, 28m, 12s', '9.56K', '10.06M'],
  40: ['0.8', '5 days, 7h, 40m, 0s', '766', '1.11M', '69 days, 6h, 8m, 12s', '10.33K', '11.17M'],
  41: ['0.8', '5 days, 14h, 32m, 0s', '806', '1.20M', '74 days, 20h, 40m, 12s', '11.14K', '12.37M'],
  42: ['0.8', '5 days, 21h, 35m, 0s', '847', '1.30M', '80 days, 18h, 15m, 12s', '11.98K', '13.67M'],
  43: ['0.9', '6 days, 4h, 48m, 0s', '889', '1.40M', '86 days, 23h, 3m, 12s', '12.87K', '15.07M'],
  44: ['0.9', '6 days, 12h, 11m, 0s', '932', '1.51M', '93 days, 11h, 14m, 12s', '13.80K', '16.58M'],
  45: ['0.9', '6 days, 19h, 44m, 0s', '976', '1.62M', '100 days, 6h, 58m, 12s', '14.78K', '18.20M'],
  46: ['0.9', '7 days, 3h, 27m, 0s', '1.02K', '1.73M', '107 days, 10h, 25m, 12s', '15.80K', '19.93M'],
  47: ['0.9', '7 days, 11h, 20m, 0s', '1.05K', '1.86M', '114 days, 21h, 45m, 12s', '16.85K', '21.79M'],
  48: ['1.0', '7 days, 19h, 22m, 0s', '1.09K', '1.99M', '122 days, 17h, 7m, 12s', '17.94K', '23.78M'],
  49: ['1.0', '8 days, 3h, 34m, 0s', '1.13K', '2.12M', '130 days, 20h, 41m, 12s', '19.07K', '25.90M'],
  50: ['1.0', '8 days, 11h, 56m, 0s', '1.17K', '2.26M', '139 days, 8h, 37m, 12s', '20.23K', '28.16M'],
  51: ['1.0', '8 days, 20h, 28m, 0s', '1.21K', '2.40M', '148 days, 5h, 5m, 12s', '21.44K', '30.56M'],
  52: ['1.0', '9 days, 5h, 9m, 0s', '1.25K', '2.56M', '157 days, 10h, 14m, 12s', '22.68K', '33.12M'],
  53: ['1.1', '9 days, 13h, 59m, 0s', '1.29K', '2.72M', '167 days, 13m, 12s', '23.97K', '35.84M'],
  54: ['1.1', '9 days, 22h, 59m, 0s', '1.33K', '2.88M', '176 days, 23h, 12m, 12s', '25.30K', '38.72M'],
  55: ['1.1', '10 days, 8h, 8m, 0s', '1.37K', '3.05M', '187 days, 7h, 20m, 12s', '26.67K', '41.77M'],
  56: ['1.1', '10 days, 17h, 26m, 0s', '1.41K', '3.23M', '198 days, 46m, 12s', '28.08K', '45.00M'],
  57: ['1.1', '11 days, 2h, 54m, 0s', '1.46K', '3.42M', '209 days, 3h, 40m, 12s', '29.54K', '48.42M'],
  58: ['1.2', '11 days, 12h, 30m, 0s', '1.50K', '3.61M', '220 days, 16h, 10m, 12s', '31.04K', '52.03M'],
  59: ['1.2', '11 days, 22h, 16m, 0s', '1.55K', '3.81M', '232 days, 14h, 26m, 12s', '32.59K', '55.84M'],
  60: ['1.2', '12 days, 8h, 11m, 0s', '1.59K', '4.02M', '244 days, 22h, 37m, 12s', '34.18K', '59.86M'],
  61: ['1.2', '12 days, 18h, 14m, 0s', '1.64K', '4.23M', '257 days, 16h, 51m, 12s', '35.82K', '64.09M'],
  62: ['1.2', '13 days, 4h, 27m, 0s', '1.69K', '4.45M', '270 days, 21h, 18m, 12s', '37.51K', '68.54M'],
  63: ['1.3', '13 days, 14h, 48m, 0s', '1.73K', '4.68M', '284 days, 12h, 6m, 12s', '39.24K', '73.22M'],
  64: ['1.3', '14 days, 1h, 18m, 0s', '1.78K', '4.92M', '298 days, 13h, 24m, 12s', '41.03K', '78.14M'],
  65: ['1.3', '14 days, 11h, 57m, 0s', '1.83K', '5.17M', '313 days, 1h, 21m, 12s', '42.86K', '83.31M'],
  66: ['1.3', '14 days, 22h, 44m, 0s', '1.88K', '5.42M', '328 days, 5m, 12s', '44.74K', '88.73M'],
  67: ['1.3', '15 days, 9h, 40m, 0s', '1.93K', '5.68M', '343 days, 9h, 45m, 12s', '46.67K', '94.41M'],
  68: ['1.4', '15 days, 20h, 44m, 0s', '1.98K', '5.96M', '359 days, 6h, 29m, 12s', '48.65K', '100.37M'],
  69: ['1.4', '16 days, 7h, 57m, 0s', '2.04K', '6.24M', '1 year, 10 days, 14h, 26m, 12s', '50.69K', '106.61M'],
  70: ['1.4', '16 days, 19h, 18m, 0s', '2.09K', '6.52M', '1 year, 27 days, 9h, 44m, 12s', '52.78K', '113.13M'],
  71: ['1.4', '17 days, 6h, 48m, 0s', '2.14K', '6.82M', '1 year, 44 days, 16h, 32m, 12s', '54.92K', '119.95M'],
  72: ['1.4', '17 days, 18h, 26m, 0s', '2.19K', '7.13M', '1 year, 62 days, 10h, 58m, 12s', '57.11K', '127.08M'],
  73: ['1.5', '18 days, 6h, 12m, 0s', '2.25K', '7.44M', '1 year, 80 days, 17h, 10m, 12s', '59.36K', '134.52M'],
  74: ['1.5', '18 days, 18h, 7m, 0s', '2.30K', '7.77M', '1 year, 99 days, 11h, 17m, 12s', '61.66K', '142.29M'],
  75: ['1.5', '19 days, 6h, 10m, 0s', '2.36K', '8.10M', '1 year, 118 days, 17h, 27m, 12s', '64.02K', '150.39M'],
  76: ['1.5', '19 days, 18h, 20m, 0s', '2.42K', '8.45M', '1 year, 138 days, 11h, 47m, 12s', '66.44K', '158.84M'],
  77: ['1.5', '20 days, 6h, 39m, 0s', '2.47K', '8.80M', '1 year, 158 days, 18h, 26m, 12s', '68.91K', '167.64M'],
  78: ['1.6', '20 days, 19h, 6m, 0s', '2.53K', '9.17M', '1 year, 179 days, 13h, 32m, 12s', '71.44K', '176.81M'],
  79: ['1.6', '21 days, 7h, 41m, 0s', '2.59K', '9.54M', '1 year, 200 days, 21h, 13m, 12s', '74.03K', '186.35M'],
  80: ['1.6', '21 days, 20h, 24m, 0s', '2.65K', '9.92M', '1 year, 222 days, 17h, 37m, 12s', '76.68K', '196.27M'],
  81: ['1.6', '22 days, 9h, 14m, 0s', '2.71K', '10.32M', '1 year, 245 days, 2h, 51m, 12s', '79.38K', '206.59M'],
  82: ['1.6', '22 days, 22h, 13m, 0s', '2.77K', '10.72M', '1 year, 268 days, 1h, 4m, 12s', '82.15K', '217.31M'],
  83: ['1.7', '23 days, 11h, 19m, 0s', '2.83K', '11.14M', '1 year, 291 days, 12h, 23m, 12s', '84.98K', '228.45M'],
  84: ['1.7', '24 days, 33m, 0s', '2.89K', '11.57M', '1 year, 315 days, 12h, 56m, 12s', '87.86K', '240.02M'],
  85: ['1.7', '24 days, 13h, 55m, 0s', '2.95K', '12.00M', '1 year, 340 days, 2h, 51m, 12s', '90.81K', '252.02M'],
  86: ['1.7', '25 days, 3h, 24m, 0s', '3.01K', '12.45M', '2 years, 0 days, 6h, 15m, 12s', '93.83K', '264.47M'],
  87: ['1.7', '25 days, 17h, 1m, 0s', '3.08K', '12.91M', '2 years, 25 days, 23h, 16m, 12s', '96.90K', '277.38M'],
  88: ['1.8', '26 days, 6h, 45m, 0s', '3.14K', '13.38M', '2 years, 52 days, 6h, 1m, 12s', '100.04K', '290.76M'],
  89: ['1.8', '26 days, 20h, 37m, 0s', '3.20K', '13.87M', '2 years, 79 days, 2h, 38m, 12s', '103.24K', '304.63M'],
  90: ['1.8', '27 days, 10h, 37m, 0s', '3.27K', '14.36M', '2 years, 106 days, 13h, 15m, 12s', '106.51K', '318.99M'],
  91: ['1.8', '28 days, 44m, 0s', '3.33K', '14.87M', '2 years, 134 days, 13h, 59m, 12s', '109.84K', '333.86M'],
  92: ['1.8', '28 days, 14h, 58m, 0s', '3.40K', '15.38M', '2 years, 163 days, 4h, 57m, 12s', '113.24K', '349.24M'],
  93: ['1.9', '29 days, 5h, 20m, 0s', '3.46K', '15.91M', '2 years, 192 days, 10h, 17m, 12s', '116.70K', '365.15M'],
  94: ['1.9', '29 days, 19h, 49m, 0s', '3.53K', '16.46M', '2 years, 222 days, 6h, 6m, 12s', '120.23K', '381.61M'],
  95: ['1.9', '30 days, 10h, 26m, 0s', '3.58K', '17.01M', '2 years, 252 days, 16h, 32m, 12s', '123.82K', '398.62M'],
  96: ['1.9', '31 days, 1h, 10m, 0s', '3.63K', '17.58M', '2 years, 283 days, 17h, 42m, 12s', '127.44K', '416.20M'],
  97: ['1.9', '31 days, 16h, 0m, 0s', '3.67K', '18.16M', '2 years, 315 days, 9h, 42m, 12s', '131.12K', '434.36M'],
  98: ['2.0', '32 days, 6h, 59m, 0s', '3.72K', '18.75M', '2 years, 347 days, 16h, 41m, 12s', '134.84K', '453.11M'],
  99: ['2.0', '32 days, 22h, 4m, 0s', '3.77K', '19.36M', '3 years, 15 days, 14h, 45m, 12s', '138.60K', '472.47M'],
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
for (let level = 1; level <= 99; level++) {
  const row = BY_LEVEL[level]
  if (!row) throw new Error(`Missing screenshot row for level ${level}`)
  const [value, time, gems, coins, totalTime, totalGems, totalCoins] = row
  levels.push({
    level,
    value: Number(value),
    time: { display: time, seconds: parseTimeToSeconds(time) },
    gems: parseAbbrevNum(gems),
    coins: parseAbbrevNum(coins),
    totalTime: { display: totalTime, seconds: parseTimeToSeconds(totalTime) },
    totalGems: parseAbbrevNum(totalGems),
    totalCoins: parseAbbrevNum(totalCoins),
  })
}

const doc = {
  name: 'Labs Speed',
  maxLevel: 99,
  levels,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
console.log('Wrote', outPath, `(${levels.length} levels)`)
