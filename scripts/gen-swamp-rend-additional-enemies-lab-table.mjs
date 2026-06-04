/**

 * Builds tables/labs/ultimate-weapon/swamp-rend-additional-enemies.json from screenshot only.

 * Calculator Value is enemy-type labels (L1–6); JSON `value` stores level index (benefit text in research.ts).

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

  'swamp-rend-additional-enemies.json',

)



/** [value, time, gems, coins, totalTime, totalGems, totalCoins] — screenshot L1–6 */

const BY_LEVEL = {

  1: [

    '1.00',

    '8 days, 7h, 59m, 59s',

    '1.15K',

    '100.00B',

    '8 days, 7h, 59m, 59s',

    '1.15K',

    '100.00B',

  ],

  2: [

    '2.00',

    '9 days, 8h, 0m, 0s',

    '1.26K',

    '150.00B',

    '17 days, 15h, 59m, 59s',

    '2.41K',

    '250.00B',

  ],

  3: [

    '3.00',

    '10 days, 10h, 52m, 47s',

    '1.38K',

    '225.00B',

    '28 days, 2h, 52m, 46s',

    '3.79K',

    '475.00B',

  ],

  4: [

    '4.00',

    '11 days, 16h, 59m, 8s',

    '1.52K',

    '337.50B',

    '39 days, 19h, 51m, 54s',

    '5.31K',

    '812.50B',

  ],

  5: [

    '5.00',

    '13 days, 2h, 42m, 13s',

    '1.68K',

    '506.25B',

    '52 days, 22h, 34m, 7s',

    '6.99K',

    '1.32T',

  ],

  6: [

    '6.00',

    '14 days, 16h, 28m, 5s',

    '1.85K',

    '759.38B',

    '67 days, 15h, 2m, 12s',

    '8.84K',

    '2.08T',

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

for (let level = 1; level <= 6; level++) {

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

  name: 'Swamp Rend - Additional Enemies',

  maxLevel: 6,

  levels,

}



fs.mkdirSync(path.dirname(outPath), { recursive: true })

fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')

console.log('Wrote', outPath, `(${levels.length} levels, screenshot data only)`)


