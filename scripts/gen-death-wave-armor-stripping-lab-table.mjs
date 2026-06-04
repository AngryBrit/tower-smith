/**

 * Builds tables/labs/ultimate-weapon/death-wave-armor-stripping.json from screenshot only.

 * Calculator Value 1.00 × level (1.00 … 10.00 at L1–10); Include % off.

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

  'death-wave-armor-stripping.json',

)



/** [value, time, gems, coins, totalTime, totalGems, totalCoins] — screenshot L1–10 */

const BY_LEVEL = {

  1: ['1.00', '8 days, 8h, 0m, 0s', '1.15K', '100.00B', '8 days, 8h, 0m, 0s', '1.15K', '100.00B'],

  2: ['2.00', '10 days, 10h, 52m, 48s', '1.38K', '225.00B', '18 days, 18h, 52m, 48s', '2.53K', '325.00B'],

  3: ['3.00', '13 days, 2h, 42m, 13s', '1.68K', '506.25B', '31 days, 21h, 35m, 1s', '4.21K', '831.25B'],

  4: ['4.00', '16 days, 10h, 45m, 52s', '2.05K', '1.14T', '48 days, 8h, 20m, 53s', '6.26K', '1.97T'],

  5: ['5.00', '20 days, 15h, 11m, 33s', '2.51K', '2.56T', '68 days, 23h, 32m, 26s', '8.77K', '4.53T'],

  6: ['6.00', '25 days, 21h, 10m, 10s', '3.09K', '5.77T', '94 days, 20h, 42m, 36s', '11.86K', '10.30T'],

  7: ['7.00', '32 days, 11h, 11m, 42s', '3.73K', '12.97T', '127 days, 7h, 54m, 18s', '15.60K', '23.27T'],

  8: ['8.00', '40 days, 17h, 25m, 20s', '4.35K', '29.19T', '168 days, 1h, 19m, 38s', '19.94K', '52.46T'],

  9: ['9.00', '51 days, 2h, 4m, 43s', '5.11K', '65.68T', '219 days, 3h, 24m, 21s', '25.06K', '118.14T'],

  10: ['10.00', '64 days, 1h, 59m, 35s', '6.08K', '147.79T', '283 days, 5h, 23m, 56s', '31.13K', '265.93T'],

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

for (let level = 1; level <= 10; level++) {

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

  name: 'Death Wave Armor Stripping',

  maxLevel: 10,

  levels,

}



fs.mkdirSync(path.dirname(outPath), { recursive: true })

fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')

console.log('Wrote', outPath, `(${levels.length} levels, screenshot data only)`)


