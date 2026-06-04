/**
 * Builds tables/labs/ultimate-weapon/golden-tower-bonus.json from Golden Tower Bonus screenshot only.
 * Value +0.15/level (0.15 … 3.75 at L1–25); Include % off in calculator UI.
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
  'ultimate-weapon',
  'golden-tower-bonus.json',
)

/** [value, time, gems, coins, totalTime, totalGems, totalCoins] — screenshot L1–25 */
const BY_LEVEL = {
  1: ['0.15', '1 day, 16h, 0m, 0s', '256', '1.00M', '1 day, 16h, 0m, 0s', '256', '1.00M'],
  2: ['0.30', '2 days, 21m, 0s', '305', '1.31M', '3 days, 16h, 21m, 0s', '561', '2.31M'],
  3: ['0.45', '2 days, 8h, 53m, 0s', '355', '1.85M', '6 days, 1h, 14m, 0s', '916', '4.16M'],
  4: ['0.60', '2 days, 17h, 54m, 0s', '407', '3.55M', '8 days, 19h, 8m, 0s', '1.32K', '7.71M'],
  5: ['0.75', '3 days, 3h, 49m, 0s', '465', '8.50M', '11 days, 22h, 57m, 0s', '1.79K', '16.21M'],
  6: ['0.90', '3 days, 15h, 6m, 0s', '530', '20.29M', '15 days, 14h, 3m, 0s', '2.32K', '36.50M'],
  7: ['1.05', '4 days, 4h, 17m, 0s', '607', '44.33M', '19 days, 18h, 20m, 0s', '2.93K', '80.83M'],
  8: ['1.20', '4 days, 19h, 58m, 0s', '698', '88.16M', '24 days, 14h, 18m, 0s', '3.62K', '168.99M'],
  9: ['1.35', '5 days, 14h, 49m, 0s', '808', '161.66M', '30 days, 5h, 7m, 0s', '4.43K', '330.65M'],
  10: ['1.50', '6 days, 13h, 31m, 0s', '940', '277.37M', '36 days, 18h, 38m, 0s', '5.37K', '608.02M'],
  11: ['1.65', '7 days, 16h, 49m, 0s', '1.08K', '450.68M', '44 days, 11h, 27m, 0s', '6.45K', '1.06B'],
  12: ['1.80', '9 days, 1h, 30m, 0s', '1.23K', '700.09M', '53 days, 12h, 57m, 0s', '7.68K', '1.76B'],
  13: ['1.95', '10 days, 16h, 23m, 0s', '1.41K', '1.05B', '64 days, 5h, 20m, 0s', '9.09K', '2.81B'],
  14: ['2.10', '12 days, 14h, 21m, 0s', '1.62K', '1.52B', '76 days, 19h, 41m, 0s', '10.71K', '4.33B'],
  15: ['2.25', '14 days, 20h, 18m, 0s', '1.87K', '2.14B', '91 days, 15h, 59m, 0s', '12.58K', '6.47B'],
  16: ['2.40', '17 days, 11h, 9m, 0s', '2.16K', '2.95B', '109 days, 3h, 8m, 0s', '14.74K', '9.42B'],
  17: ['2.55', '20 days, 11h, 54m, 0s', '2.50K', '3.98B', '129 days, 15h, 2m, 0s', '17.24K', '13.40B'],
  18: ['2.70', '23 days, 23h, 32m, 0s', '2.88K', '5.27B', '153 days, 14h, 34m, 0s', '20.12K', '18.67B'],
  19: ['2.85', '27 days, 23h, 6m, 0s', '3.33K', '6.88B', '181 days, 13h, 40m, 0s', '23.44K', '25.55B'],
  20: ['3.00', '32 days, 11h, 40m, 0s', '3.74K', '8.84B', '214 days, 1h, 20m, 0s', '27.18K', '34.39B'],
  21: ['3.15', '37 days, 14h, 19m, 0s', '4.11K', '11.22B', '251 days, 15h, 39m, 0s', '31.29K', '45.61B'],
  22: ['3.30', '43 days, 8h, 12m, 0s', '4.54K', '14.08B', '294 days, 23h, 51m, 0s', '35.83K', '59.69B'],
  23: ['3.45', '49 days, 18h, 27m, 0s', '5.02K', '17.48B', '344 days, 18h, 18m, 0s', '40.85K', '77.17B'],
  24: ['3.60', '56 days, 22h, 16m, 0s', '5.55K', '21.49B', '1 year, 36 days, 16h, 34m, 0s', '46.40K', '98.66B'],
  25: ['3.75', '64 days, 20h, 50m, 0s', '6.14K', '26.19B', '1 year, 101 days, 13h, 24m, 0s', '52.54K', '124.85B'],
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
for (let level = 1; level <= 25; level++) {
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
  name: 'Golden Tower Bonus',
  maxLevel: 25,
  levels,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
console.log('Wrote', outPath, `(${levels.length} levels, screenshot data only)`)
