/**

 * Builds tables/labs/ultimate-weapon/lightning-amplifier-scatter.json from screenshot only.

 * Calculator Value 1.25 × level (1.25 … 37.5 at L1–30); L1–2 times differ from Chain Thunder; L3–30 match Swamp Rend - Basic Enemies tier.

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

  'lightning-amplifier-scatter.json',

)



/** [value, time, gems, coins, totalTime, totalGems, totalCoins] — screenshot L1–30 */

const BY_LEVEL = {

  1: ['1.25', '8 days, 8h, 0m, 0s', '1.15K', '100.00B', '8 days, 8h, 0m, 0s', '1.15K', '100.00B'],

  2: ['2.50', '9 days, 8h, 0m, 0s', '1.26K', '150.00B', '17 days, 16h, 0m, 0s', '2.41K', '250.00B'],

  3: ['3.75', '10 days, 10h, 52m, 47s', '1.38K', '225.00B', '28 days, 2h, 52m, 47s', '3.79K', '475.00B'],

  4: ['5.00', '11 days, 16h, 59m, 8s', '1.52K', '337.50B', '39 days, 19h, 51m, 55s', '5.31K', '812.50B'],

  5: ['6.25', '13 days, 2h, 42m, 13s', '1.68K', '506.25B', '52 days, 22h, 34m, 8s', '6.99K', '1.32T'],

  6: ['7.50', '14 days, 16h, 28m, 5s', '1.85K', '759.38B', '67 days, 15h, 2m, 13s', '8.84K', '2.08T'],

  7: ['8.75', '16 days, 10h, 45m, 52s', '2.05K', '1.14T', '84 days, 1h, 48m, 5s', '10.89K', '3.22T'],

  8: ['10.00', '18 days, 10h, 8m, 10s', '2.27K', '1.71T', '102 days, 11h, 56m, 15s', '13.16K', '4.93T'],

  9: ['11.25', '20 days, 15h, 11m, 33s', '2.51K', '2.56T', '123 days, 3h, 7m, 48s', '15.67K', '7.49T'],

  10: ['12.50', '23 days, 2h, 36m, 56s', '2.79K', '3.84T', '146 days, 5h, 44m, 44s', '18.46K', '11.33T'],

  11: ['13.75', '25 days, 21h, 10m, 10s', '3.09K', '5.77T', '172 days, 2h, 54m, 54s', '21.55K', '17.10T'],

  12: ['15.00', '28 days, 23h, 42m, 36s', '3.44K', '8.65T', '201 days, 2h, 37m, 30s', '24.99K', '25.75T'],

  13: ['16.25', '32 days, 11h, 11m, 42s', '3.73K', '12.97T', '233 days, 13h, 49m, 12s', '28.72K', '38.72T'],

  14: ['17.50', '36 days, 8h, 41m, 55s', '4.02K', '19.46T', '269 days, 22h, 31m, 7s', '32.74K', '58.18T'],

  15: ['18.75', '40 days, 17h, 25m, 20s', '4.35K', '29.19T', '310 days, 15h, 56m, 27s', '37.09K', '87.37T'],

  16: ['20.00', '45 days, 14h, 42m, 47s', '4.71K', '43.79T', '356 days, 6h, 39m, 14s', '41.80K', '131.16T'],

  17: ['21.25', '51 days, 2h, 4m, 43s', '5.11K', '65.68T', '1 year, 42 days, 8h, 43m, 57s', '46.91K', '196.84T'],

  18: ['22.50', '57 days, 5h, 12m, 29s', '5.57K', '98.53T', '1 year, 99 days, 13h, 56m, 26s', '52.48K', '295.37T'],

  19: ['23.75', '64 days, 1h, 59m, 35s', '6.08K', '147.79T', '1 year, 163 days, 15h, 56m, 1s', '58.56K', '443.16T'],

  20: ['25.00', '71 days, 18h, 33m, 8s', '6.65K', '221.68T', '1 year, 235 days, 10h, 29m, 9s', '65.21K', '664.84T'],

  21: ['26.25', '80 days, 9h, 15m, 31s', '7.29K', '332.53T', '1 year, 315 days, 19h, 44m, 40s', '72.49K', '997.37T'],

  22: ['27.50', '90 days, 46m, 11s', '8.00K', '498.79T', '2 years, 40 days, 20h, 30m, 51s', '80.50K', '1.50q'],

  23: ['28.75', '100 days, 20h, 3m, 43s', '8.68K', '748.18T', '2 years, 141 days, 16h, 34m, 34s', '89.18K', '2.24q'],

  24: ['30.00', '112 days, 22h, 28m, 10s', '9.45K', '1.12q', '2 years, 254 days, 15h, 2m, 44s', '98.63K', '3.36q'],

  25: ['31.25', '126 days, 11h, 43m, 33s', '10.30K', '1.68q', '3 years, 16 days, 2h, 46m, 17s', '108.92K', '5.04q'],

  26: ['32.50', '141 days, 16h, 0m, 47s', '11.25K', '2.53q', '3 years, 157 days, 18h, 47m, 4s', '120.18K', '7.57q'],

  27: ['33.75', '158 days, 16h, 0m, 52s', '12.32K', '3.79q', '3 years, 316 days, 10h, 47m, 56s', '132.50K', '11.36q'],

  28: ['35.00', '177 days, 16h, 58m, 34s', '13.52K', '5.68q', '4 years, 129 days, 3h, 46m, 30s', '146.02K', '17.04q'],

  29: ['36.25', '199 days, 46m, 25s', '14.87K', '8.52q', '4 years, 328 days, 4h, 32m, 55s', '160.89K', '25.56q'],

  30: ['37.50', '222 days, 21h, 59m, 11s', '16.37K', '12.78q', '5 years, 186 days, 2h, 32m, 6s', '177.26K', '38.34q'],

}



function parseAbbrevNum(raw) {

  const s = String(raw).trim().replace(/,/g, '')

  if (/q$/i.test(s)) return Math.round(parseFloat(s) * 1_000_000_000_000_000)

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

  name: 'Lightning Amplifier - Scatter',

  maxLevel: 30,

  levels,

}



fs.mkdirSync(path.dirname(outPath), { recursive: true })

fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')

console.log('Wrote', outPath, `(${levels.length} levels, screenshot data only)`)


