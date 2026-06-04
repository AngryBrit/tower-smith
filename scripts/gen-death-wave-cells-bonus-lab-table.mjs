/**

 * Builds tables/labs/ultimate-weapon/death-wave-cells-bonus.json from screenshot only.

 * Calculator Value x1.10 + 0.10/level (1.10 … 3.00 at L1–20); Include % off.

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

  'death-wave-cells-bonus.json',

)



/** [value, time, gems, coins, totalTime, totalGems, totalCoins] — screenshot L1–20 */

const BY_LEVEL = {

  1: ['1.10', '3 days, 5h, 46m, 39s', '476', '1.00B', '3 days, 5h, 46m, 39s', '476', '1.00B'],

  2: ['1.20', '3 days, 15h, 6m, 39s', '530', '1.50B', '6 days, 20h, 53m, 18s', '1.01K', '2.50B'],

  3: ['1.30', '4 days, 1h, 33m, 51s', '591', '2.25B', '10 days, 22h, 27m, 9s', '1.60K', '4.75B'],

  4: ['1.40', '4 days, 13h, 16m, 19s', '659', '3.38B', '15 days, 11h, 43m, 28s', '2.26K', '8.13B'],

  5: ['1.50', '5 days, 2h, 23m, 5s', '735', '5.06B', '20 days, 14h, 6m, 33s', '2.99K', '13.19B'],

  6: ['1.60', '5 days, 17h, 4m, 15s', '821', '7.59B', '26 days, 7h, 10m, 48s', '3.81K', '20.78B'],

  7: ['1.70', '6 days, 9h, 31m, 10s', '916', '11.39B', '32 days, 16h, 41m, 58s', '4.73K', '32.17B'],

  8: ['1.80', '7 days, 3h, 56m, 30s', '1.02K', '17.09B', '39 days, 20h, 38m, 28s', '5.75K', '49.26B'],

  9: ['1.90', '8 days, 34m, 29s', '1.11K', '25.63B', '47 days, 21h, 12m, 57s', '6.86K', '74.89B'],

  10: ['2.00', '8 days, 23h, 41m, 2s', '1.22K', '38.44B', '56 days, 20h, 53m, 59s', '8.08K', '113.33B'],

  11: ['2.10', '10 days, 1h, 33m, 57s', '1.34K', '57.67B', '66 days, 22h, 27m, 56s', '9.42K', '171.00B'],

  12: ['2.20', '11 days, 6h, 33m, 13s', '1.47K', '86.50B', '78 days, 5h, 1m, 9s', '10.90K', '257.50B'],

  13: ['2.30', '12 days, 15h, 1m, 13s', '1.62K', '129.75B', '90 days, 20h, 2m, 22s', '12.52K', '387.25B'],

  14: ['2.40', '14 days, 3h, 22m, 58s', '1.79K', '194.62B', '104 days, 23h, 25m, 20s', '14.31K', '581.87B'],

  15: ['2.50', '15 days, 20h, 6m, 31s', '1.98K', '291.93B', '120 days, 19h, 31m, 51s', '16.29K', '873.80B'],

  16: ['2.60', '17 days, 17h, 43m, 18s', '2.19K', '437.89B', '138 days, 13h, 15m, 9s', '18.48K', '1.31T'],

  17: ['2.70', '19 days, 20h, 48m, 30s', '2.43K', '656.84B', '158 days, 10h, 3m, 39s', '20.91K', '1.97T'],

  18: ['2.80', '22 days, 6h, 1m, 31s', '2.69K', '985.26B', '180 days, 16h, 5m, 10s', '23.60K', '2.95T'],

  19: ['2.90', '24 days, 22h, 6m, 30s', '2.99K', '1.48T', '205 days, 14h, 11m, 40s', '26.59K', '4.43T'],

  20: ['3.00', '27 days, 21h, 52m, 53s', '3.32K', '2.22T', '233 days, 12h, 4m, 33s', '29.91K', '6.65T'],

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

  name: 'Death Wave Cells Bonus',

  maxLevel: 20,

  levels,

}



fs.mkdirSync(path.dirname(outPath), { recursive: true })

fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')

console.log('Wrote', outPath, `(${levels.length} levels, screenshot data only)`)


