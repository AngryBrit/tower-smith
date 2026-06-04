/**

 * Builds tables/labs/ultimate-weapon/recharge-missile-barrage.json from screenshot only.

 * Calculator Value = cooldown waves (1500 … 200 at L1–7); Include % off.

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

  'recharge-missile-barrage.json',

)



/** [value, time, gems, coins, totalTime, totalGems, totalCoins] — screenshot L1–7 */

const BY_LEVEL = {

  1: [

    '1500.00',

    '5 days, 5h, 0m, 0s',

    '751',

    '550.00B',

    '5 days, 5h, 0m, 0s',

    '751',

    '550.00B',

  ],

  2: [

    '1250.00',

    '6 days, 14h, 21m, 9s',

    '944',

    '1.05T',

    '11 days, 19h, 21m, 9s',

    '1.70K',

    '1.60T',

  ],

  3: [

    '1000.00',

    '8 days, 54m, 39s',

    '1.12K',

    '1.55T',

    '19 days, 20h, 15m, 48s',

    '2.81K',

    '3.15T',

  ],

  4: [

    '750.00',

    '9 days, 23h, 10m, 29s',

    '1.33K',

    '2.05T',

    '29 days, 19h, 26m, 17s',

    '4.14K',

    '5.20T',

  ],

  5: [

    '500.00',

    '14 days, 1h, 58m, 39s',

    '1.79K',

    '2.56T',

    '43 days, 21h, 24m, 56s',

    '5.93K',

    '7.76T',

  ],

  6: [

    '350.00',

    '24 days, 19h, 29m, 9s',

    '2.98K',

    '3.07T',

    '68 days, 16h, 54m, 5s',

    '8.90K',

    '10.83T',

  ],

  7: [

    '200.00',

    '51 days, 8h, 12m, 0s',

    '5.13K',

    '3.60T',

    '120 days, 1h, 6m, 5s',

    '14.03K',

    '14.43T',

  ],

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

for (let level = 1; level <= 7; level++) {

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

  name: 'Recharge Missile Barrage',

  maxLevel: 7,

  levels,

}



fs.mkdirSync(path.dirname(outPath), { recursive: true })

fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')

console.log('Wrote', outPath, `(${levels.length} levels, screenshot data only)`)


