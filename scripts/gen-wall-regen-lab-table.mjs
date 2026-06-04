/**
 * Builds tables/labs/defense/wall-regen.json from Wall Regen calculator screenshots only.
 * Sources: Wall Regen screenshot (L1–30).
 * Value +10.00/level (10.00 … 300.00).
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outPath = path.join(__dirname, '..', 'tables', 'labs', 'defense', 'wall-regen.json')

/** [value, time, gems, coins, totalTime, totalGems, totalCoins] — screenshot L1–30 */
const BY_LEVEL = {
  1: ['10.00', '1 day, 3h, 46m, 0s', '185', '30.00B', '1 day, 3h, 46m, 0s', '185', '30.00B'],
  2: ['20.00', '1 day, 9h, 21m, 0s', '218', '35.10B', '2 days, 13h, 7m, 0s', '403', '65.10B'],
  3: ['30.00', '1 day, 15h, 16m, 0s', '252', '40.35B', '4 days, 4h, 23m, 0s', '655', '105.45B'],
  4: ['40.00', '1 day, 22h, 38m, 0s', '295', '45.72B', '6 days, 3h, 1m, 0s', '950', '151.17B'],
  5: ['50.00', '2 days, 9h, 32m, 0s', '358', '51.21B', '8 days, 12h, 33m, 0s', '1.31K', '202.38B'],
  6: ['60.00', '3 days, 3h, 15m, 0s', '461', '56.81B', '11 days, 15h, 48m, 0s', '1.77K', '259.19B'],
  7: ['70.00', '4 days, 8h, 14m, 0s', '630', '62.52B', '16 days, 2m, 0s', '2.40K', '321.71B'],
  8: ['80.00', '6 days, 6h, 21m, 0s', '898', '68.32B', '22 days, 6h, 23m, 0s', '3.30K', '390.03B'],
  9: ['90.00', '9 days, 4h, 50m, 0s', '1.25K', '74.22B', '31 days, 11h, 13m, 0s', '4.54K', '464.25B'],
  10: ['100.00', '13 days, 12h, 24m, 0s', '1.72K', '80.22B', '44 days, 23h, 37m, 0s', '6.27K', '544.47B'],
  11: ['110.00', '19 days, 15h, 18m, 3s', '2.40K', '86.31B', '64 days, 14h, 55m, 3s', '8.67K', '630.78B'],
  12: ['120.00', '22 days, 13h, 59m, 46s', '2.73K', '92.49B', '87 days, 4h, 54m, 49s', '11.40K', '723.27B'],
  13: ['130.00', '25 days, 23h, 17m, 44s', '3.10K', '98.76B', '113 days, 4h, 12m, 33s', '14.50K', '822.03B'],
  14: ['140.00', '29 days, 20h, 47m, 24s', '3.54K', '105.12B', '143 days, 59m, 57s', '18.04K', '927.15B'],
  15: ['150.00', '34 days, 8h, 18m, 30s', '3.87K', '111.56B', '177 days, 9h, 18m, 27s', '21.91K', '1.04T'],
  16: ['160.00', '39 days, 11h, 57m, 17s', '4.26K', '118.09B', '216 days, 21h, 15m, 44s', '26.16K', '1.16T'],
  17: ['170.00', '45 days, 10h, 8m, 52s', '4.69K', '124.70B', '262 days, 7h, 24m, 36s', '30.86K', '1.28T'],
  18: ['180.00', '52 days, 5h, 40m, 12s', '5.20K', '131.40B', '314 days, 13h, 4m, 48s', '36.06K', '1.41T'],
  19: ['190.00', '60 days, 1h, 43m, 14s', '5.78K', '138.18B', '1 year, 9 days, 14h, 48m, 2s', '41.84K', '1.55T'],
  20: ['200.00', '69 days, 1h, 58m, 43s', '6.45K', '145.03B', '1 year, 78 days, 16h, 46m, 45s', '48.29K', '1.70T'],
  21: ['210.00', '79 days, 10h, 40m, 32s', '7.22K', '151.97B', '1 year, 158 days, 3h, 27m, 17s', '55.51K', '1.85T'],
  22: ['220.00', '91 days, 8h, 40m, 37s', '8.09K', '158.99B', '1 year, 249 days, 12h, 7m, 54s', '63.59K', '2.01T'],
  23: ['230.00', '105 days, 1h, 34m, 42s', '8.95K', '166.08B', '1 year, 354 days, 13h, 42m, 36s', '72.54K', '2.17T'],
  24: ['240.00', '120 days, 19h, 48m, 55s', '9.94K', '173.26B', '2 years, 110 days, 9h, 31m, 31s', '82.48K', '2.35T'],
  25: ['250.00', '138 days, 22h, 47m, 14s', '11.08K', '180.51B', '2 years, 249 days, 8h, 18m, 45s', '93.56K', '2.53T'],
  26: ['260.00', '159 days, 19h, 0m, 19s', '12.40K', '187.83B', '3 years, 44 days, 3h, 19m, 4s', '105.96K', '2.71T'],
  27: ['270.00', '183 days, 18h, 15m, 21s', '13.90K', '195.23B', '3 years, 227 days, 21h, 34m, 25s', '119.86K', '2.91T'],
  28: ['280.00', '211 days, 7h, 47m, 39s', '15.64K', '202.71B', '4 years, 74 days, 5h, 22m, 4s', '135.50K', '3.11T'],
  29: ['290.00', '243 days, 33m, 49s', '17.64K', '210.26B', '4 years, 317 days, 5h, 55m, 53s', '153.14K', '3.32T'],
  30: ['300.00', '279 days, 11h, 26m, 51s', '19.93K', '217.89B', '5 years, 231 days, 17h, 22m, 44s', '173.07K', '3.54T'],
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
for (let level = 1; level <= 30; level++) {
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
  name: 'Wall Regen',
  maxLevel: 30,
  levels,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
console.log('Wrote', outPath, `(${levels.length} levels, screenshot data only)`)
