/**
 * Builds tables/labs/ultimate-weapon/spotlight-coin-bonus.json from Spotlight Coin Bonus screenshot only.
 * Value x1.00 + 0.10/level (1.10 … 3.00 at L1–20); same time/gem/coin ladder as Black Hole Coin Bonus.
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
  'spotlight-coin-bonus.json',
)

/** [value, time, gems, coins, totalTime, totalGems, totalCoins] — screenshot L1–20 */
const BY_LEVEL = {
  1: ['1.10', '1 day, 15h, 59m, 0s', '256', '20.00M', '1 day, 15h, 59m, 0s', '256', '20.00M'],
  2: ['1.20', '2 days, 21m, 0s', '305', '21.41M', '3 days, 16h, 20m, 0s', '561', '41.41M'],
  3: ['1.30', '2 days, 8h, 53m, 0s', '355', '23.12M', '6 days, 1h, 13m, 0s', '916', '64.53M'],
  4: ['1.40', '2 days, 17h, 54m, 0s', '407', '26.63M', '8 days, 19h, 7m, 0s', '1.32K', '91.16M'],
  5: ['1.50', '3 days, 3h, 49m, 0s', '465', '35.84M', '11 days, 22h, 56m, 0s', '1.79K', '126.99M'],
  6: ['1.60', '3 days, 15h, 6m, 0s', '530', '58.25M', '15 days, 14h, 2m, 0s', '2.32K', '185.24M'],
  7: ['1.70', '4 days, 4h, 17m, 0s', '607', '106.16M', '19 days, 18h, 19m, 0s', '2.93K', '291.41M'],
  8: ['1.80', '4 days, 19h, 58m, 0s', '698', '197.87M', '24 days, 14h, 17m, 0s', '3.62K', '489.28M'],
  9: ['1.90', '5 days, 14h, 49m, 0s', '808', '358.88M', '30 days, 5h, 6m, 0s', '4.43K', '848.15M'],
  10: ['2.00', '6 days, 13h, 31m, 0s', '940', '623.09M', '36 days, 18h, 37m, 0s', '5.37K', '1.47B'],
  11: ['2.10', '7 days, 16h, 49m, 0s', '1.08K', '1.03B', '44 days, 11h, 26m, 0s', '6.45K', '2.50B'],
  12: ['2.20', '9 days, 1h, 30m, 0s', '1.23K', '1.64B', '53 days, 12h, 56m, 0s', '7.68K', '4.14B'],
  13: ['2.30', '10 days, 16h, 23m, 0s', '1.41K', '2.52B', '64 days, 5h, 19m, 0s', '9.09K', '6.66B'],
  14: ['2.40', '12 days, 14h, 21m, 0s', '1.62K', '3.74B', '76 days, 19h, 40m, 0s', '10.71K', '10.40B'],
  15: ['2.50', '14 days, 20h, 18m, 0s', '1.87K', '5.41B', '91 days, 15h, 58m, 0s', '12.58K', '15.81B'],
  16: ['2.60', '17 days, 11h, 9m, 0s', '2.16K', '7.63B', '109 days, 3h, 7m, 0s', '14.74K', '23.44B'],
  17: ['2.70', '20 days, 11h, 54m, 0s', '2.50K', '10.52B', '129 days, 15h, 1m, 0s', '17.24K', '33.96B'],
  18: ['2.80', '23 days, 23h, 32m, 0s', '2.88K', '14.23B', '153 days, 14h, 33m, 0s', '20.12K', '48.19B'],
  19: ['2.90', '27 days, 23h, 5m, 31s', '3.33K', '18.93B', '181 days, 13h, 38m, 31s', '23.44K', '67.12B'],
  20: ['3.00', '32 days, 11h, 40m, 0s', '3.74K', '24.80B', '214 days, 1h, 18m, 31s', '27.18K', '91.92B'],
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
for (let level = 1; level <= 20; level++) {
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
  name: 'Spotlight Coin Bonus',
  maxLevel: 20,
  levels,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
console.log('Wrote', outPath, `(${levels.length} levels, screenshot data only)`)
