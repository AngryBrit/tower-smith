/**
 * Builds tables/labs/ultimate-weapon/death-wave-coin-bonus.json from screenshot only.
 * Value x1.50 + 0.05/level (1.55 … 2.50 at L1–20); same cost ladder as Shock Chance L1–20.
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
  'death-wave-coin-bonus.json',
)

/** [value, time, gems, coins, totalTime, totalGems, totalCoins] — screenshot L1–20 */
const BY_LEVEL = {
  1: ['1.55', '20h, 0m, 0s', '136', '250.00K', '20h, 0m, 0s', '136', '250.00K'],
  2: ['1.60', '1 day, 4h, 21m, 9s', '189', '560.00K', '2 days, 21m, 9s', '325', '810.00K'],
  3: ['1.65', '1 day, 12h, 53m, 11s', '238', '1.10M', '3 days, 13h, 14m, 20s', '563', '1.91M'],
  4: ['1.70', '1 day, 21h, 54m, 33s', '291', '2.80M', '5 days, 11h, 8m, 53s', '854', '4.71M'],
  5: ['1.75', '2 days, 7h, 49m, 19s', '348', '7.75M', '7 days, 18h, 58m, 12s', '1.20K', '12.46M'],
  6: ['1.80', '2 days, 19h, 6m, 5s', '414', '19.54M', '10 days, 14h, 4m, 17s', '1.62K', '32.00M'],
  7: ['1.85', '3 days, 8h, 17m, 16s', '491', '43.58M', '13 days, 22h, 21m, 33s', '2.11K', '75.58M'],
  8: ['1.90', '3 days, 23h, 58m, 44s', '582', '87.41M', '17 days, 22h, 20m, 17s', '2.69K', '162.99M'],
  9: ['1.95', '4 days, 18h, 49m, 30s', '691', '160.91M', '22 days, 17h, 9m, 47s', '3.38K', '323.90M'],
  10: ['2.00', '5 days, 17h, 31m, 29s', '823', '276.62M', '28 days, 10h, 41m, 16s', '4.20K', '600.52M'],
  11: ['2.05', '6 days, 20h, 49m, 19s', '982', '449.93M', '35 days, 7h, 30m, 35s', '5.19K', '1.05B'],
  12: ['2.10', '8 days, 5h, 30m, 9s', '1.14K', '699.34M', '43 days, 13h, 0m, 44s', '6.32K', '1.75B'],
  13: ['2.15', '9 days, 20h, 23m, 37s', '1.32K', '1.05B', '53 days, 9h, 24m, 21s', '7.64K', '2.80B'],
  14: ['2.20', '11 days, 18h, 21m, 37s', '1.53K', '1.52B', '65 days, 3h, 45m, 58s', '9.17K', '4.32B'],
  15: ['2.25', '14 days, 18m, 17s', '1.78K', '2.14B', '79 days, 4h, 4m, 15s', '10.95K', '6.46B'],
  16: ['2.30', '16 days, 15h, 9m, 51s', '2.07K', '2.95B', '95 days, 19h, 14m, 6s', '13.01K', '9.41B'],
  17: ['2.35', '19 days, 15h, 54m, 39s', '2.40K', '3.98B', '115 days, 11h, 8m, 45s', '15.42K', '13.39B'],
  18: ['2.40', '23 days, 3h, 32m, 57s', '2.79K', '5.27B', '138 days, 14h, 41m, 42s', '18.21K', '18.66B'],
  19: ['2.45', '27 days, 3h, 6m, 55s', '3.23K', '6.88B', '165 days, 17h, 48m, 37s', '21.44K', '25.54B'],
  20: ['2.50', '31 days, 15h, 40m, 37s', '3.67K', '8.84B', '197 days, 9h, 29m, 14s', '25.11K', '34.38B'],
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
  name: 'Death Wave Coin Bonus',
  maxLevel: 20,
  levels,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
console.log('Wrote', outPath, `(${levels.length} levels, screenshot data only)`)
