/**
 * Builds tables/labs/defense/wall-fortification.json from Wall Fortification calculator screenshots only.
 * Sources: Wall Fortification screenshots (L1–29, L29–60).
 * Value +20.00/level (20.00 … 1200.00).
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outPath = path.join(__dirname, '..', 'tables', 'labs', 'defense', 'wall-fortification.json')

/** [value, time, gems, coins, totalTime, totalGems, totalCoins] — screenshots L1–60 */
const BY_LEVEL = {
  1: ['20.00', '2 days, 7h, 33m, 19s', '347', '300.00B', '2 days, 7h, 33m, 19s', '347', '300.00B'],
  2: ['40.00', '2 days, 10h, 4m, 29s', '362', '300.07B', '4 days, 17h, 37m, 48s', '709', '600.07B'],
  3: ['60.00', '2 days, 12h, 40m, 54s', '377', '300.44B', '7 days, 6h, 18m, 42s', '1.09K', '900.51B'],
  4: ['80.00', '2 days, 15h, 25m, 59s', '393', '301.41B', '9 days, 21h, 44m, 41s', '1.48K', '1.20T'],
  5: ['100.00', '2 days, 18h, 22m, 35s', '410', '303.28B', '12 days, 16h, 7m, 16s', '1.89K', '1.51T'],
  6: ['120.00', '2 days, 21h, 33m, 18s', '428', '306.35B', '15 days, 13h, 40m, 34s', '2.32K', '1.81T'],
  7: ['140.00', '3 days, 1h, 0m, 32s', '448', '310.92B', '18 days, 14h, 41m, 6s', '2.77K', '2.12T'],
  8: ['160.00', '3 days, 4h, 46m, 32s', '470', '317.29B', '21 days, 19h, 27m, 38s', '3.24K', '2.44T'],
  9: ['180.00', '3 days, 8h, 53m, 25s', '494', '325.76B', '25 days, 4h, 21m, 3s', '3.73K', '2.77T'],
  10: ['200.00', '3 days, 13h, 23m, 16s', '520', '336.62B', '28 days, 17h, 44m, 19s', '4.25K', '3.10T'],
  11: ['220.00', '3 days, 18h, 18m, 2s', '549', '350.20B', '32 days, 12h, 2m, 21s', '4.80K', '3.45T'],
  12: ['240.00', '3 days, 23h, 39m, 39s', '580', '366.77B', '36 days, 11h, 42m, 0s', '5.38K', '3.82T'],
  13: ['260.00', '4 days, 5h, 29m, 56s', '614', '386.64B', '40 days, 17h, 11m, 56s', '5.99K', '4.21T'],
  14: ['280.00', '4 days, 11h, 50m, 43s', '651', '410.11B', '45 days, 5h, 2m, 39s', '6.64K', '4.62T'],
  15: ['300.00', '4 days, 18h, 43m, 44s', '691', '437.48B', '49 days, 23h, 46m, 23s', '7.33K', '5.05T'],
  16: ['320.00', '5 days, 2h, 10m, 44s', '734', '469.05B', '55 days, 1h, 57m, 7s', '8.07K', '5.52T'],
  17: ['340.00', '5 days, 10h, 13m, 22s', '781', '505.12B', '60 days, 12h, 10m, 29s', '8.85K', '6.03T'],
  18: ['360.00', '5 days, 18h, 53m, 17s', '831', '545.99B', '66 days, 7h, 3m, 46s', '9.68K', '6.57T'],
  19: ['380.00', '6 days, 4h, 12m, 7s', '885', '591.96B', '72 days, 11h, 15m, 53s', '10.57K', '7.17T'],
  20: ['400.00', '6 days, 14h, 11m, 27s', '943', '643.33B', '79 days, 1h, 27m, 20s', '11.51K', '7.81T'],
  21: ['420.00', '7 days, 52m, 50s', '1.00K', '700.40B', '86 days, 2h, 20m, 10s', '12.51K', '8.51T'],
  22: ['440.00', '7 days, 12h, 17m, 49s', '1.06K', '763.47B', '93 days, 14h, 37m, 59s', '13.57K', '9.27T'],
  23: ['460.00', '8 days, 27m, 55s', '1.11K', '832.84B', '101 days, 15h, 5m, 54s', '14.68K', '10.11T'],
  24: ['480.00', '8 days, 13h, 24m, 38s', '1.17K', '908.81B', '110 days, 4h, 30m, 32s', '15.86K', '11.01T'],
  25: ['500.00', '9 days, 3h, 9m, 25s', '1.24K', '991.68B', '119 days, 7h, 39m, 57s', '17.09K', '12.01T'],
  26: ['520.00', '9 days, 17h, 43m, 44s', '1.30K', '1.08T', '129 days, 1h, 23m, 41s', '18.40K', '13.09T'],
  27: ['540.00', '10 days, 9h, 9m, 1s', '1.38K', '1.18T', '139 days, 10h, 32m, 42s', '19.77K', '14.27T'],
  28: ['560.00', '11 days, 1h, 26m, 41s', '1.45K', '1.28T', '150 days, 11h, 59m, 23s', '21.22K', '15.55T'],
  29: ['580.00', '11 days, 18h, 38m, 9s', '1.53K', '1.40T', '162 days, 6h, 37m, 32s', '22.75K', '16.95T'],
  30: ['600.00', '12 days, 12h, 44m, 47s', '1.61K', '1.52T', '174 days, 19h, 22m, 19s', '24.37K', '18.47T'],
  31: ['620.00', '13 days, 7h, 47m, 59s', '1.70K', '1.65T', '188 days, 3h, 10m, 18s', '26.07K', '20.12T'],
  32: ['640.00', '14 days, 3h, 49m, 5s', '1.79K', '1.79T', '202 days, 6h, 59m, 23s', '27.86K', '21.91T'],
  33: ['660.00', '15 days, 49m, 26s', '1.89K', '1.94T', '217 days, 7h, 48m, 49s', '29.76K', '23.85T'],
  34: ['680.00', '15 days, 22h, 50m, 22s', '1.99K', '2.10T', '233 days, 6h, 39m, 11s', '31.75K', '25.95T'],
  35: ['700.00', '16 days, 21h, 53m, 12s', '2.10K', '2.27T', '250 days, 4h, 32m, 23s', '33.85K', '28.22T'],
  36: ['720.00', '17 days, 21h, 59m, 15s', '2.21K', '2.44T', '268 days, 2h, 31m, 38s', '36.06K', '30.66T'],
  37: ['740.00', '18 days, 23h, 9m, 49s', '2.33K', '2.63T', '287 days, 1h, 41m, 27s', '38.39K', '33.29T'],
  38: ['760.00', '20 days, 1h, 26m, 9s', '2.45K', '2.83T', '307 days, 3h, 7m, 36s', '40.83K', '36.12T'],
  39: ['780.00', '21 days, 4h, 49m, 34s', '2.58K', '3.04T', '328 days, 7h, 57m, 10s', '43.41K', '39.16T'],
  40: ['800.00', '22 days, 9h, 21m, 18s', '2.71K', '3.27T', '350 days, 17h, 18m, 28s', '46.12K', '42.43T'],
  41: ['820.00', '23 days, 15h, 2m, 38s', '2.84K', '3.50T', '1 year, 9 days, 8h, 21m, 6s', '48.96K', '45.93T'],
  42: ['840.00', '24 days, 21h, 54m, 46s', '2.99K', '3.75T', '1 year, 34 days, 6h, 15m, 52s', '51.95K', '49.68T'],
  43: ['860.00', '26 days, 5h, 58m, 59s', '3.14K', '4.01T', '1 year, 60 days, 12h, 14m, 51s', '55.08K', '53.69T'],
  44: ['880.00', '27 days, 15h, 16m, 29s', '3.29K', '4.28T', '1 year, 88 days, 3h, 31m, 20s', '58.37K', '57.97T'],
  45: ['900.00', '29 days, 1h, 48m, 29s', '3.45K', '4.56T', '1 year, 117 days, 5h, 19m, 49s', '61.82K', '62.53T'],
  46: ['920.00', '30 days, 13h, 36m, 12s', '3.59K', '4.86T', '1 year, 147 days, 18h, 56m, 1s', '65.41K', '67.39T'],
  47: ['940.00', '32 days, 2h, 49m, 50s', '3.71K', '5.17T', '1 year, 179 days, 21h, 36m, 51s', '69.12K', '72.56T'],
  48: ['960.00', '35 days, 17h, 5m, 34s', '3.85K', '5.49T', '1 year, 213 days, 14h, 40m, 25s', '72.94K', '78.05T'],
  49: ['980.00', '35 days, 8h, 45m, 25s', '3.95K', '5.83T', '1 year, 248 days, 22h, 26m, 0s', '76.89K', '82.88T'],
  50: ['1000.00', '37 days, 1h, 48m, 5s', '4.08K', '6.18T', '1 year, 286 days, 1h, 14m, 5s', '80.97K', '90.06T'],
  51: ['1020.00', '38 days, 20h, 12m, 13s', '4.21K', '6.55T', '1 year, 324 days, 21h, 26m, 18s', '85.17K', '96.61T'],
  52: ['1040.00', '40 days, 15h, 59m, 9s', '4.34K', '6.93T', '2 years, 0 days, 13h, 25m, 27s', '89.51K', '103.54T'],
  53: ['1060.00', '42 days, 13h, 10m, 2s', '4.48K', '7.33T', '2 years, 43 days, 2h, 35m, 29s', '94.00K', '110.87T'],
  54: ['1080.00', '44 days, 11h, 46m, 2s', '4.63K', '7.74T', '2 years, 87 days, 14h, 21m, 31s', '98.62K', '118.61T'],
  55: ['1100.00', '46 days, 11h, 48m, 17s', '4.77K', '8.17T', '2 years, 134 days, 2h, 9m, 48s', '103.39K', '126.78T'],
  56: ['1120.00', '48 days, 13h, 17m, 54s', '4.93K', '8.62T', '2 years, 182 days, 15h, 27m, 42s', '108.32K', '135.40T'],
  57: ['1140.00', '50 days, 16h, 16m, 3s', '5.08K', '9.08T', '2 years, 233 days, 7h, 43m, 45s', '113.41K', '144.48T'],
  58: ['1160.00', '52 days, 20h, 43m, 50s', '5.25K', '9.56T', '2 years, 286 days, 4h, 27m, 35s', '118.65K', '154.04T'],
  59: ['1180.00', '55 days, 2h, 42m, 22s', '5.41K', '10.06T', '2 years, 341 days, 7h, 9m, 57s', '124.06K', '164.10T'],
  60: ['1200.00', '57 days, 10h, 12m, 46s', '5.59K', '10.57T', '3 years, 33 days, 17h, 22m, 43s', '129.65K', '174.67T'],
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
for (let level = 1; level <= 60; level++) {
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
  name: 'Wall Fortification',
  maxLevel: 60,
  levels,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
console.log('Wrote', outPath, `(${levels.length} levels, screenshot data only)`)
