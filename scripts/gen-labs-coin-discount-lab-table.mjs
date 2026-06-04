/**
 * Builds tables/labs/main/labs-coin-discount.json from lab calculator screenshots only.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outPath = path.join(__dirname, '..', 'tables', 'labs', 'main', 'labs-coin-discount.json')

/** [value, time, gems, coins, totalTime, totalGems, totalCoins] */
const BY_LEVEL = {
  1: ['0.3', '19s', '1', '40', '19s', '1', '40'],
  2: ['0.6', '9m, 49s', '2', '83', '10m, 8s', '3', '123'],
  3: ['0.9', '23m, 49s', '3', '210', '33m, 57s', '6', '333'],
  4: ['1.2', '44m, 32s', '6', '517', '1h, 18m, 29s', '12', '850'],
  5: ['1.5', '1h, 13m, 0s', '9', '1.10K', '2h, 31m, 29s', '21', '1.95K'],
  6: ['1.8', '1h, 52m, 0s', '14', '2.07K', '4h, 23m, 29s', '35', '4.02K'],
  7: ['2.1', '2h, 42m, 0s', '19', '3.51K', '7h, 5m, 29s', '54', '7.53K'],
  8: ['2.4', '3h, 45m, 0s', '27', '5.55K', '10h, 50m, 29s', '81', '13.08K'],
  9: ['2.7', '5h, 1m, 0s', '35', '8.27K', '15h, 51m, 29s', '116', '21.35K'],
  10: ['3.0', '6h, 31m, 0s', '45', '11.79K', '22h, 22m, 29s', '161', '33.14K'],
  11: ['3.3', '8h, 17m, 0s', '57', '16.20K', '1 day, 6h, 39m, 29s', '218', '49.34K'],
  12: ['3.6', '10h, 19m, 0s', '71', '21.62K', '1 day, 16h, 58m, 29s', '289', '70.96K'],
  13: ['3.9', '12h, 39m, 0s', '87', '28.15K', '2 days, 5h, 37m, 29s', '376', '99.11K'],
  14: ['4.2', '15h, 16m, 0s', '104', '35.89K', '2 days, 20h, 53m, 29s', '480', '135.00K'],
  15: ['4.5', '18h, 13m, 0s', '124', '44.94K', '3 days, 15h, 6m, 29s', '604', '179.94K'],
  16: ['4.8', '21h, 29m, 0s', '146', '55.40K', '4 days, 12h, 35m, 29s', '750', '235.34K'],
  17: ['5.1', '1 day, 1h, 5m, 0s', '170', '67.38K', '5 days, 13h, 40m, 29s', '920', '302.72K'],
  18: ['5.4', '1 day, 5h, 3m, 0s', '193', '80.99K', '6 days, 18h, 43m, 29s', '1.11K', '383.71K'],
  19: ['5.7', '1 day, 9h, 33m, 0s', '219', '96.31K', '8 days, 4h, 16m, 29s', '1.33K', '480.02K'],
  20: ['6.0', '1 day, 14h, 5m, 0s', '245', '113.45K', '9 days, 18h, 21m, 29s', '1.58K', '593.47K'],
  21: ['6.3', '1 day, 19h, 11m, 0s', '275', '132.51K', '11 days, 13h, 32m, 29s', '1.85K', '725.98K'],
  22: ['6.6', '2 days, 40m, 0s', '307', '153.58K', '13 days, 14h, 12m, 29s', '2.16K', '879.56K'],
  23: ['6.9', '2 days, 6h, 34m, 0s', '341', '176.77K', '15 days, 20h, 46m, 29s', '2.50K', '1.06M'],
  24: ['7.2', '2 days, 12h, 54m, 0s', '378', '202.17K', '18 days, 9h, 40m, 29s', '2.88K', '1.26M'],
  25: ['7.5', '2 days, 19h, 39m, 0s', '417', '229.87K', '21 days, 5h, 19m, 29s', '3.30K', '1.49M'],
  26: ['7.8', '3 days, 2h, 51m, 0s', '459', '259.97K', '24 days, 8h, 10m, 29s', '3.75K', '1.75M'],
  27: ['8.1', '3 days, 10h, 29m, 0s', '503', '292.56K', '27 days, 18h, 39m, 29s', '4.26K', '2.04M'],
  28: ['8.4', '3 days, 18h, 36m, 0s', '551', '327.73K', '31 days, 13h, 15m, 29s', '4.81K', '2.37M'],
  29: ['8.7', '4 days, 3h, 11m, 0s', '601', '365.58K', '35 days, 16h, 26m, 29s', '5.41K', '2.73M'],
  30: ['9.0', '4 days, 12h, 14m, 0s', '653', '406.20K', '40 days, 4h, 40m, 29s', '6.06K', '3.14M'],
  31: ['9.3', '4 days, 21h, 47m, 0s', '709', '449.66K', '45 days, 2h, 27m, 29s', '6.77K', '3.59M'],
  32: ['9.6', '5 days, 7h, 50m, 0s', '767', '496.07K', '50 days, 10h, 17m, 29s', '7.54K', '4.09M'],
  33: ['9.9', '5 days, 18h, 23m, 0s', '828', '545.50K', '56 days, 4h, 40m, 29s', '8.37K', '4.63M'],
  34: ['10.2', '6 days, 5h, 28m, 0s', '893', '598.05K', '62 days, 10h, 8m, 29s', '9.26K', '5.23M'],
  35: ['10.5', '6 days, 17h, 3m, 0s', '960', '653.79K', '69 days, 3h, 11m, 29s', '10.22K', '5.88M'],
  36: ['10.8', '7 days, 5h, 11m, 0s', '1.02K', '712.81K', '76 days, 8h, 22m, 29s', '11.24K', '6.60M'],
  37: ['11.1', '7 days, 17h, 52m, 0s', '1.08K', '775.19K', '84 days, 2h, 14m, 29s', '12.33K', '7.37M'],
  38: ['11.4', '8 days, 7h, 6m, 0s', '1.14K', '841.01K', '92 days, 9h, 20m, 29s', '13.47K', '8.21M'],
  39: ['11.7', '8 days, 20h, 53m, 0s', '1.21K', '910.34K', '101 days, 6h, 13m, 29s', '14.68K', '9.12M'],
  40: ['12.0', '9 days, 11h, 14m, 0s', '1.27K', '983.28K', '110 days, 17h, 27m, 29s', '15.95K', '10.11M'],
  41: ['12.3', '10 days, 2h, 10m, 0s', '1.34K', '1.06M', '120 days, 19h, 37m, 29s', '17.30K', '11.17M'],
  42: ['12.6', '10 days, 17h, 41m, 0s', '1.42K', '1.14M', '131 days, 13h, 18m, 29s', '18.71K', '12.31M'],
  43: ['12.9', '11 days, 9h, 48m, 0s', '1.49K', '1.22M', '142 days, 23h, 6m, 29s', '20.20K', '13.53M'],
  44: ['13.2', '12 days, 2h, 30m, 0s', '1.57K', '1.31M', '155 days, 1h, 36m, 29s', '21.77K', '14.84M'],
  45: ['13.5', '12 days, 19h, 50m, 0s', '1.65K', '1.40M', '167 days, 21h, 26m, 29s', '23.41K', '16.24M'],
  46: ['13.8', '13 days, 13h, 46m, 0s', '1.73K', '1.50M', '181 days, 11h, 12m, 29s', '25.14K', '17.74M'],
  47: ['14.1', '14 days, 8h, 19m, 0s', '1.82K', '1.60M', '195 days, 19h, 31m, 29s', '26.96K', '19.34M'],
  48: ['14.4', '15 days, 3h, 30m, 0s', '1.90K', '1.71M', '210 days, 23h, 1m, 29s', '28.86K', '21.05M'],
  49: ['14.7', '15 days, 23h, 20m, 0s', '2.00K', '1.81M', '226 days, 22h, 21m, 29s', '30.85K', '22.86M'],
  50: ['15.0', '16 days, 19h, 48m, 0s', '2.09K', '1.93M', '243 days, 18h, 9m, 29s', '32.94K', '24.79M'],
  51: ['15.3', '17 days, 16h, 59m, 0s', '2.19K', '2.04M', '261 days, 11h, 8m, 29s', '35.13K', '26.83M'],
  52: ['15.6', '18 days, 14h, 43m, 0s', '2.29K', '2.17M', '280 days, 1h, 51m, 29s', '37.42K', '29.00M'],
  53: ['15.9', '19 days, 13h, 11m, 0s', '2.39K', '2.29M', '299 days, 15h, 2m, 29s', '39.81K', '31.29M'],
  54: ['16.2', '20 days, 12h, 19m, 0s', '2.50K', '2.42M', '320 days, 3h, 21m, 29s', '42.31K', '33.71M'],
  55: ['16.5', '21 days, 12h, 7m, 0s', '2.61K', '2.56M', '341 days, 15h, 28m, 29s', '44.92K', '36.27M'],
  56: ['16.8', '22 days, 12h, 38m, 0s', '2.72K', '2.70M', '364 days, 4h, 6m, 29s', '47.64K', '38.97M'],
  57: ['17.1', '23 days, 13h, 50m, 0s', '2.84K', '2.84M', '1 year, 22 days, 17h, 56m, 29s', '50.48K', '41.81M'],
  58: ['17.4', '24 days, 15h, 44m, 0s', '2.96K', '2.99M', '1 year, 47 days, 9h, 40m, 29s', '53.44K', '44.80M'],
  59: ['17.7', '25 days, 18h, 21m, 0s', '3.08K', '3.15M', '1 year, 73 days, 4h, 1m, 29s', '56.52K', '47.95M'],
  60: ['18.0', '26 days, 21h, 40m, 0s', '3.21K', '3.31M', '1 year, 100 days, 1h, 41m, 29s', '59.73K', '51.26M'],
  61: ['18.3', '28 days, 1h, 44m, 0s', '3.34K', '3.47M', '1 year, 128 days, 3h, 25m, 29s', '63.06K', '54.73M'],
  62: ['18.6', '29 days, 6h, 31m, 0s', '3.47K', '3.64M', '1 year, 157 days, 9h, 56m, 29s', '66.53K', '58.37M'],
  63: ['18.9', '30 days, 12h, 2m, 0s', '3.59K', '3.81M', '1 year, 187 days, 21h, 58m, 29s', '70.12K', '62.18M'],
  64: ['19.2', '31 days, 18h, 18m, 0s', '3.68K', '3.99M', '1 year, 219 days, 16h, 16m, 29s', '73.80K', '66.17M'],
  65: ['19.5', '33 days, 1h, 19m, 0s', '3.78K', '4.18M', '1 year, 252 days, 17h, 35m, 29s', '77.58K', '70.35M'],
  66: ['19.8', '34 days, 9h, 5m, 0s', '3.88K', '4.36M', '1 year, 287 days, 2h, 40m, 29s', '81.45K', '74.71M'],
  67: ['20.1', '35 days, 17h, 38m, 0s', '3.98K', '4.56M', '1 year, 322 days, 20h, 18m, 29s', '85.43K', '79.27M'],
  68: ['20.4', '37 days, 2h, 56m, 0s', '4.08K', '4.76M', '1 year, 359 days, 23h, 14m, 29s', '89.51K', '84.03M'],
  69: ['20.7', '38 days, 13h, 1m, 0s', '4.18K', '4.96M', '2 years, 33 days, 12h, 15m, 29s', '93.69K', '88.99M'],
  70: ['21.0', '39 days, 23h, 53m, 0s', '4.29K', '5.17M', '2 years, 73 days, 12h, 8m, 29s', '97.99K', '94.16M'],
  71: ['21.3', '41 days, 11h, 32m, 0s', '4.40K', '5.39M', '2 years, 114 days, 23h, 40m, 29s', '102.39K', '99.55M'],
  72: ['21.6', '42 days, 23h, 59m, 0s', '4.51K', '5.61M', '2 years, 157 days, 23h, 39m, 29s', '106.90K', '105.16M'],
  73: ['21.9', '44 days, 13h, 14m, 0s', '4.63K', '5.84M', '2 years, 202 days, 12h, 53m, 29s', '111.53K', '111.00M'],
  74: ['22.2', '46 days, 3h, 18m, 0s', '4.75K', '6.07M', '2 years, 248 days, 16h, 11m, 29s', '116.28K', '117.07M'],
  75: ['22.5', '47 days, 18h, 10m, 0s', '4.87K', '6.30M', '2 years, 296 days, 10h, 21m, 29s', '121.15K', '123.37M'],
  76: ['22.8', '49 days, 9h, 51m, 0s', '4.99K', '6.55M', '2 years, 345 days, 20h, 12m, 29s', '126.14K', '129.92M'],
  77: ['23.1', '51 days, 2h, 23m, 0s', '5.12K', '6.80M', '3 years, 31 days, 22h, 35m, 29s', '131.25K', '136.72M'],
  78: ['23.4', '52 days, 19h, 43m, 0s', '5.24K', '7.05M', '3 years, 84 days, 18h, 18m, 29s', '136.49K', '143.77M'],
  79: ['23.7', '54 days, 13h, 55m, 0s', '5.37K', '7.31M', '3 years, 139 days, 8h, 13m, 29s', '141.87K', '151.08M'],
  80: ['24.0', '56 days, 8h, 57m, 0s', '5.51K', '7.57M', '3 years, 195 days, 17h, 10m, 29s', '147.37K', '158.65M'],
  81: ['24.3', '58 days, 4h, 50m, 0s', '5.64K', '7.84M', '3 years, 253 days, 22h, 0m, 29s', '153.02K', '166.49M'],
  82: ['24.6', '60 days, 1h, 34m, 0s', '5.78K', '8.12M', '3 years, 313 days, 23h, 34m, 29s', '158.80K', '174.61M'],
  83: ['24.9', '61 days, 23h, 10m, 0s', '5.92K', '8.40M', '4 years, 10 days, 22h, 44m, 29s', '164.72K', '183.01M'],
  84: ['25.2', '63 days, 21h, 38m, 0s', '6.07K', '8.69M', '4 years, 74 days, 20h, 22m, 29s', '170.78K', '191.70M'],
  85: ['25.5', '65 days, 20h, 58m, 0s', '6.21K', '8.98M', '4 years, 140 days, 17h, 20m, 29s', '176.99K', '200.68M'],
  86: ['25.8', '67 days, 21h, 11m, 0s', '6.36K', '9.28M', '4 years, 208 days, 14h, 31m, 29s', '183.35K', '209.96M'],
  87: ['26.1', '69 days, 22h, 18m, 0s', '6.51K', '9.58M', '4 years, 278 days, 12h, 49m, 29s', '189.87K', '219.54M'],
  88: ['26.4', '72 days, 17m, 0s', '6.67K', '9.89M', '4 years, 350 days, 13h, 6m, 29s', '196.53K', '229.43M'],
  89: ['26.7', '74 days, 3h, 11m, 0s', '6.82K', '10.20M', '5 years, 59 days, 16h, 17m, 29s', '203.36K', '239.63M'],
  90: ['27.0', '76 days, 6h, 58m, 0s', '6.98K', '10.53M', '5 years, 135 days, 23h, 15m, 29s', '210.34K', '250.16M'],
  91: ['27.3', '78 days, 11h, 40m, 0s', '7.15K', '10.85M', '5 years, 214 days, 10h, 55m, 29s', '217.49K', '261.01M'],
  92: ['27.6', '80 days, 17h, 17m, 0s', '7.31K', '11.18M', '5 years, 295 days, 4h, 12m, 29s', '224.80K', '272.19M'],
  93: ['27.9', '82 days, 23h, 49m, 0s', '7.48K', '11.52M', '6 years, 13 days, 4h, 1m, 29s', '232.28K', '283.71M'],
  94: ['28.2', '85 days, 7h, 16m, 0s', '7.65K', '11.86M', '6 years, 98 days, 11h, 17m, 29s', '239.93K', '295.57M'],
  95: ['28.5', '87 days, 15h, 39m, 0s', '7.83K', '12.21M', '6 years, 186 days, 2h, 56m, 29s', '247.76K', '307.78M'],
  96: ['28.8', '90 days, 59m, 0s', '8.00K', '12.57M', '6 years, 276 days, 3h, 55m, 29s', '255.76K', '320.35M'],
  97: ['29.1', '92 days, 11h, 14m, 0s', '8.16K', '12.93M', '7 years, 3 days, 15h, 9m, 29s', '263.92K', '333.28M'],
  98: ['29.4', '94 days, 22h, 27m, 0s', '8.31K', '13.29M', '7 years, 98 days, 13h, 36m, 29s', '272.23K', '346.57M'],
  99: ['29.7', '97 days, 10h, 36m, 0s', '8.47K', '13.67M', '7 years, 196 days, 12m, 29s', '280.70K', '360.24M'],
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
  name: 'Labs Coin Discount',
  maxLevel: 99,
  levels,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
console.log('Wrote', outPath, `(${levels.length} levels)`)
