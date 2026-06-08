/**
 * Builds tables/labs/main/enhancement-attack-coin-discount.json from lab calculator screenshots.
 * Sources: Enhancement Attack - Coin Discount screenshots (L1–29, L28–59, L58–89, L69–100).
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
  'main',
  'enhancement-attack-coin-discount.json',
)

/** [value, time, gems, coins, totalTime, totalGems, totalCoins] — screenshots L1–100 */
const BY_LEVEL = {
  1: ['0.30', '1 day, 1h, 55m, 0s', '175', '1.00B', '1 day, 1h, 55m, 0s', '175', '1.00B'],
  2: ['0.60', '2 days, 3h, 50m, 0s', '325', '1.30B', '3 days, 5h, 45m, 0s', '500', '2.30B'],
  3: ['0.90', '3 days, 5h, 45m, 0s', '476', '1.69B', '6 days, 11h, 30m, 0s', '976', '3.99B'],
  4: ['1.20', '4 days, 7h, 40m, 0s', '627', '2.20B', '10 days, 19h, 10m, 0s', '1.60K', '6.19B'],
  5: ['1.50', '5 days, 9h, 35m, 0s', '777', '2.86B', '16 days, 4h, 45m, 0s', '2.38K', '9.04B'],
  6: ['1.80', '6 days, 11h, 30m, 0s', '928', '3.71B', '22 days, 16h, 15m, 0s', '3.31K', '12.76B'],
  7: ['2.10', '7 days, 13h, 25m, 0s', '1.06K', '4.83B', '30 days, 5h, 40m, 0s', '4.37K', '17.58B'],
  8: ['2.40', '8 days, 15h, 21m, 0s', '1.18K', '6.27B', '38 days, 21h, 1m, 0s', '5.55K', '23.86B'],
  9: ['2.70', '9 days, 17h, 16m, 0s', '1.30K', '8.16B', '48 days, 14h, 17m, 0s', '6.85K', '32.01B'],
  10: ['3.00', '10 days, 19h, 11m, 0s', '1.42K', '10.60B', '59 days, 9h, 28m, 0s', '8.28K', '42.62B'],
  11: ['3.30', '11 days, 21h, 6m, 0s', '1.54K', '13.79B', '71 days, 6h, 34m, 0s', '9.82K', '56.41B'],
  12: ['3.60', '12 days, 23h, 1m, 0s', '1.66K', '17.92B', '84 days, 5h, 35m, 0s', '11.48K', '74.33B'],
  13: ['3.90', '14 days, 56m, 0s', '1.78K', '23.30B', '98 days, 6h, 31m, 0s', '13.26K', '97.63B'],
  14: ['4.20', '15 days, 2h, 51m, 0s', '1.90K', '30.29B', '113 days, 9h, 22m, 0s', '15.16K', '127.91B'],
  15: ['4.50', '16 days, 4h, 46m, 0s', '2.02K', '39.37B', '129 days, 14h, 8m, 0s', '17.18K', '167.29B'],
  16: ['4.80', '17 days, 6h, 42m, 0s', '2.14K', '51.19B', '146 days, 20h, 50m, 0s', '19.32K', '218.47B'],
  17: ['5.10', '18 days, 8h, 37m, 0s', '2.26K', '66.54B', '165 days, 5h, 27m, 0s', '21.58K', '285.01B'],
  18: ['5.40', '19 days, 10h, 32m, 0s', '2.38K', '86.50B', '184 days, 15h, 59m, 0s', '23.96K', '371.52B'],
  19: ['5.70', '20 days, 12h, 27m, 0s', '2.50K', '112.46B', '205 days, 4h, 26m, 0s', '26.46K', '483.97B'],
  20: ['6.00', '21 days, 14h, 22m, 0s', '2.62K', '146.19B', '226 days, 18h, 48m, 0s', '29.08K', '630.17B'],
  21: ['6.30', '22 days, 16h, 17m, 0s', '2.74K', '190.05B', '249 days, 11h, 5m, 0s', '31.82K', '820.22B'],
  22: ['6.60', '23 days, 18h, 12m, 0s', '2.86K', '247.06B', '273 days, 5h, 17m, 0s', '34.67K', '1.07T'],
  23: ['6.90', '24 days, 20h, 8m, 0s', '2.98K', '321.18B', '298 days, 1h, 25m, 0s', '37.65K', '1.39T'],
  24: ['7.20', '25 days, 22h, 3m, 0s', '3.10K', '417.54B', '323 days, 23h, 28m, 0s', '40.75K', '1.81T'],
  25: ['7.50', '26 days, 23h, 58m, 0s', '3.22K', '542.80B', '350 days, 23h, 26m, 0s', '43.97K', '2.35T'],
  26: ['7.80', '28 days, 1h, 53m, 0s', '3.34K', '705.64B', '1 year, 14 days, 1h, 19m, 0s', '47.31K', '3.05T'],
  27: ['8.10', '29 days, 3h, 48m, 0s', '3.46K', '917.33B', '1 year, 43 days, 5h, 7m, 0s', '50.76K', '3.97T'],
  28: ['8.40', '30 days, 5h, 43m, 0s', '3.57K', '1.19T', '1 year, 73 days, 10h, 50m, 0s', '54.33K', '5.16T'],
  29: ['8.70', '31 days, 7h, 38m, 0s', '3.65K', '1.55T', '1 year, 104 days, 18h, 28m, 0s', '57.98K', '6.71T'],
  30: ['9.00', '32 days, 9h, 33m, 0s', '3.73K', '2.02T', '1 year, 137 days, 4h, 1m, 0s', '61.71K', '8.73T'],
  31: ['9.30', '33 days, 11h, 29m, 0s', '3.81K', '2.62T', '1 year, 170 days, 15h, 30m, 0s', '65.52K', '11.35T'],
  32: ['9.60', '34 days, 13h, 24m, 0s', '3.89K', '3.41T', '1 year, 205 days, 4h, 54m, 0s', '69.40K', '14.76T'],
  33: ['9.90', '35 days, 15h, 19m, 0s', '3.97K', '4.43T', '1 year, 240 days, 20h, 13m, 0s', '73.37K', '19.18T'],
  34: ['10.20', '36 days, 17h, 14m, 0s', '4.05K', '5.76T', '1 year, 277 days, 13h, 27m, 0s', '77.42K', '24.94T'],
  35: ['10.50', '37 days, 19h, 9m, 0s', '4.13K', '7.48T', '1 year, 315 days, 8h, 36m, 0s', '81.55K', '32.42T'],
  36: ['10.80', '38 days, 21h, 4m, 0s', '4.21K', '9.73T', '1 year, 354 days, 5h, 40m, 0s', '85.76K', '42.15T'],
  37: ['11.10', '39 days, 22h, 59m, 0s', '4.29K', '12.65T', '2 years, 29 days, 4h, 39m, 0s', '90.05K', '54.80T'],
  38: ['11.40', '41 days, 54m, 0s', '4.37K', '16.44T', '2 years, 70 days, 5h, 33m, 0s', '94.42K', '71.24T'],
  39: ['11.70', '42 days, 2h, 50m, 0s', '4.45K', '21.37T', '2 years, 112 days, 8h, 23m, 0s', '98.87K', '92.61T'],
  40: ['12.00', '43 days, 4h, 45m, 0s', '4.53K', '27.78T', '2 years, 155 days, 13h, 8m, 0s', '103.40K', '120.39T'],
  41: ['12.30', '44 days, 6h, 40m, 0s', '4.61K', '36.12T', '2 years, 199 days, 19h, 48m, 0s', '108.01K', '156.51T'],
  42: ['12.60', '45 days, 8h, 35m, 0s', '4.69K', '46.95T', '2 years, 245 days, 4h, 23m, 0s', '112.70K', '203.47T'],
  43: ['12.90', '46 days, 10h, 30m, 0s', '4.77K', '61.04T', '2 years, 291 days, 14h, 53m, 0s', '117.47K', '264.51T'],
  44: ['13.20', '47 days, 12h, 25m, 0s', '4.85K', '79.35T', '2 years, 339 days, 3h, 18m, 0s', '122.32K', '343.86T'],
  45: ['13.50', '48 days, 14h, 20m, 0s', '4.93K', '103.16T', '3 years, 22 days, 17h, 38m, 0s', '127.25K', '447.02T'],
  46: ['13.80', '49 days, 16h, 16m, 0s', '5.01K', '134.11T', '3 years, 72 days, 9h, 54m, 0s', '132.26K', '581.13T'],
  47: ['14.10', '50 days, 18h, 11m, 0s', '5.09K', '174.34T', '3 years, 123 days, 4h, 5m, 0s', '137.35K', '755.47T'],
  48: ['14.40', '51 days, 20h, 6m, 0s', '5.17K', '226.64T', '3 years, 175 days, 11m, 0s', '142.51K', '982.11T'],
  49: ['14.70', '52 days, 22h, 1m, 0s', '5.25K', '294.63T', '3 years, 227 days, 22h, 12m, 0s', '147.76K', '1.28q'],
  50: ['15.00', '53 days, 23h, 56m, 0s', '5.33K', '383.02T', '3 years, 281 days, 22h, 8m, 0s', '153.10K', '1.66q'],
  51: ['15.30', '55 days, 1h, 51m, 0s', '5.41K', '497.93T', '3 years, 336 days, 23h, 59m, 0s', '158.51K', '2.16q'],
  52: ['15.60', '56 days, 3h, 46m, 0s', '5.49K', '647.31T', '4 years, 28 days, 3h, 45m, 0s', '164.00K', '2.80q'],
  53: ['15.90', '57 days, 5h, 41m, 0s', '5.57K', '841.50T', '4 years, 85 days, 9h, 26m, 0s', '169.57K', '3.65q'],
  54: ['16.20', '58 days, 7h, 37m, 0s', '5.65K', '1.09q', '4 years, 143 days, 17h, 3m, 0s', '175.22K', '4.74q'],
  55: ['16.50', '59 days, 9h, 32m, 0s', '5.73K', '1.42q', '4 years, 203 days, 2h, 35m, 0s', '180.95K', '6.16q'],
  56: ['16.80', '60 days, 11h, 27m, 0s', '5.81K', '1.85q', '4 years, 263 days, 14h, 2m, 0s', '186.76K', '8.01q'],
  57: ['17.10', '61 days, 13h, 22m, 0s', '5.89K', '2.40q', '4 years, 325 days, 3h, 24m, 0s', '192.65K', '10.41q'],
  58: ['17.40', '62 days, 15h, 17m, 0s', '5.97K', '3.12q', '5 years, 22 days, 18h, 41m, 0s', '198.62K', '13.54q'],
  59: ['17.70', '63 days, 17h, 12m, 0s', '6.05K', '4.06q', '5 years, 86 days, 11h, 53m, 0s', '204.67K', '17.60q'],
  60: ['18.00', '64 days, 19h, 7m, 0s', '6.13K', '5.28q', '5 years, 151 days, 7h, 0m, 0s', '210.80K', '22.88q'],
  61: ['18.30', '65 days, 21h, 2m, 0s', '6.21K', '6.86q', '5 years, 217 days, 4h, 2m, 0s', '217.01K', '29.75q'],
  62: ['18.60', '66 days, 22h, 58m, 0s', '6.29K', '8.92q', '5 years, 284 days, 3h, 0m, 0s', '223.31K', '38.67q'],
  63: ['18.90', '68 days, 53m, 0s', '6.37K', '11.60q', '5 years, 352 days, 3h, 53m, 0s', '229.68K', '50.27q'],
  64: ['19.20', '69 days, 2h, 48m, 0s', '6.45K', '15.08q', '6 years, 56 days, 6h, 41m, 0s', '236.13K', '65.35q'],
  65: ['19.50', '70 days, 4h, 43m, 0s', '6.53K', '19.61q', '6 years, 126 days, 11h, 24m, 0s', '242.66K', '84.96q'],
  66: ['19.80', '71 days, 6h, 38m, 0s', '6.61K', '25.49q', '6 years, 197 days, 18h, 2m, 0s', '249.27K', '110.44q'],
  67: ['20.10', '72 days, 8h, 33m, 0s', '6.69K', '33.13q', '6 years, 270 days, 2h, 35m, 0s', '255.97K', '143.58q'],
  68: ['20.40', '73 days, 10h, 28m, 0s', '6.77K', '43.07q', '6 years, 343 days, 13h, 3m, 0s', '262.74K', '186.65q'],
  69: ['20.70', '74 days, 12h, 24m, 0s', '6.85K', '55.99q', '7 years, 53 days, 1h, 27m, 0s', '269.59K', '242.64q'],
  70: ['21.00', '75 days, 14h, 19m, 0s', '6.93K', '72.79q', '7 years, 128 days, 15h, 46m, 0s', '276.52K', '315.44q'],
  71: ['21.30', '76 days, 16h, 14m, 0s', '7.01K', '94.63q', '7 years, 205 days, 8h, 0m, 0s', '283.53K', '410.07q'],
  72: ['21.60', '77 days, 18h, 9m, 0s', '7.09K', '123.02q', '7 years, 283 days, 2h, 9m, 0s', '290.63K', '533.09q'],
  73: ['21.90', '78 days, 20h, 4m, 0s', '7.17K', '159.93q', '7 years, 361 days, 22h, 13m, 0s', '297.80K', '693.02q'],
  74: ['22.20', '79 days, 21h, 59m, 0s', '7.25K', '207.90q', '8 years, 76 days, 20h, 12m, 0s', '305.05K', '900.92q'],
  75: ['22.50', '80 days, 23h, 54m, 0s', '7.33K', '270.28q', '8 years, 157 days, 20h, 6m, 0s', '312.38K', '1.17Q'],
  76: ['22.80', '82 days, 1h, 49m, 0s', '7.41K', '351.36q', '8 years, 239 days, 21h, 55m, 0s', '319.80K', '1.52Q'],
  77: ['23.10', '83 days, 3h, 45m, 0s', '7.49K', '456.77q', '8 years, 323 days, 1h, 40m, 0s', '327.29K', '1.98Q'],
  78: ['23.40', '84 days, 5h, 40m, 0s', '7.57K', '593.80q', '9 years, 42 days, 7h, 20m, 0s', '334.86K', '2.57Q'],
  79: ['23.70', '85 days, 7h, 35m, 0s', '7.65K', '771.94q', '9 years, 127 days, 14h, 55m, 0s', '342.52K', '3.35Q'],
  80: ['24.00', '86 days, 9h, 30m, 0s', '7.73K', '1.00Q', '9 years, 214 days, 25m, 0s', '350.25K', '4.35Q'],
  81: ['24.30', '87 days, 11h, 25m, 0s', '7.81K', '1.30Q', '9 years, 301 days, 11h, 50m, 0s', '358.06K', '5.65Q'],
  82: ['24.60', '88 days, 13h, 20m, 0s', '7.89K', '1.70Q', '10 years, 25 days, 1h, 10m, 0s', '365.96K', '7.35Q'],
  83: ['24.90', '89 days, 15h, 15m, 0s', '7.97K', '2.20Q', '10 years, 114 days, 16h, 25m, 0s', '373.93K', '9.55Q'],
  84: ['25.20', '90 days, 17h, 10m, 0s', '8.05K', '2.87Q', '10 years, 205 days, 9h, 35m, 0s', '381.97K', '12.42Q'],
  85: ['25.50', '91 days, 19h, 6m, 0s', '8.11K', '3.73Q', '10 years, 297 days, 4h, 41m, 0s', '390.09K', '16.15Q'],
  86: ['25.80', '92 days, 21h, 1m, 0s', '8.18K', '4.84Q', '11 years, 25 days, 1h, 42m, 0s', '398.27K', '20.99Q'],
  87: ['26.10', '93 days, 22h, 56m, 0s', '8.25K', '6.30Q', '11 years, 119 days, 38m, 0s', '406.52K', '27.29Q'],
  88: ['26.40', '95 days, 51m, 0s', '8.32K', '8.19Q', '11 years, 214 days, 1h, 29m, 0s', '414.84K', '35.47Q'],
  89: ['26.70', '96 days, 2h, 46m, 0s', '8.39K', '10.64Q', '11 years, 310 days, 4h, 15m, 0s', '423.22K', '46.11Q'],
  90: ['27.00', '97 days, 4h, 41m, 0s', '8.45K', '13.83Q', '12 years, 42 days, 8h, 56m, 0s', '431.68K', '59.95Q'],
  91: ['27.30', '98 days, 6h, 36m, 0s', '8.52K', '17.98Q', '12 years, 140 days, 15h, 32m, 0s', '440.20K', '77.93Q'],
  92: ['27.60', '99 days, 8h, 32m, 0s', '8.59K', '23.38Q', '12 years, 240 days, 4m, 0s', '448.79K', '101.31Q'],
  93: ['27.90', '100 days, 10h, 27m, 0s', '8.66K', '30.39Q', '12 years, 340 days, 10h, 31m, 0s', '457.45K', '131.71Q'],
  94: ['28.20', '101 days, 12h, 22m, 0s', '8.73K', '39.51Q', '13 years, 76 days, 22h, 53m, 0s', '466.17K', '171.22Q'],
  95: ['28.50', '102 days, 14h, 17m, 0s', '8.79K', '51.37Q', '13 years, 179 days, 13h, 10m, 0s', '474.97K', '222.59Q'],
  96: ['28.80', '103 days, 16h, 12m, 0s', '8.86K', '66.78Q', '13 years, 283 days, 5h, 22m, 0s', '483.83K', '289.36Q'],
  97: ['29.10', '104 days, 18h, 7m, 0s', '8.93K', '86.81Q', '14 years, 22 days, 23h, 29m, 0s', '492.76K', '376.17Q'],
  98: ['29.40', '105 days, 20h, 2m, 0s', '9.00K', '112.85Q', '14 years, 128 days, 19h, 31m, 0s', '501.76K', '489.02Q'],
  99: ['29.70', '106 days, 21h, 57m, 0s', '9.07K', '146.71Q', '14 years, 235 days, 17h, 28m, 0s', '510.82K', '635.73Q'],
  100: ['30.00', '107 days, 23h, 53m, 0s', '9.13K', '190.72Q', '14 years, 343 days, 17h, 21m, 0s', '519.96K', '826.45Q'],
}

function parseAbbrevNum(raw) {
  const s = String(raw).trim().replace(/,/g, '')
  if (/Q$/.test(s)) return Math.round(parseFloat(s) * 1e18)
  if (/q$/.test(s)) return Math.round(parseFloat(s) * 1e15)
  if (/T$/.test(s)) return Math.round(parseFloat(s) * 1e12)
  if (/B$/.test(s)) return Math.round(parseFloat(s) * 1e9)
  if (/M$/.test(s)) return Math.round(parseFloat(s) * 1e6)
  if (/K$/.test(s)) return Math.round(parseFloat(s) * 1_000)
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
  name: 'Enhancement Attack - Coin Discount',
  maxLevel: 100,
  levels,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
console.log('Wrote', outPath, `(${levels.length} levels, screenshot data only)`)
