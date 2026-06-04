/**

 * Builds tables/labs/cards/extra-extra-orbs.json from Extra Inner Orbs screenshot only.

 * Manifest name Extra Extra Orbs; calculator Value +1/level (1 … 2 at L1–2); Include % off.

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

  'cards',

  'extra-extra-orbs.json',

)



/** [value, time, gems, coins, totalTime, totalGems, totalCoins] — screenshot L1–2 */

const BY_LEVEL = {

  1: [

    '1.00',

    '1 day, 14h, 53m, 0s',

    '250',

    '25.00M',

    '1 day, 14h, 53m, 0s',

    '250',

    '25.00M',

  ],

  2: [

    '2.00',

    '5 days, 18h, 53m, 0s',

    '831',

    '900.00M',

    '7 days, 9h, 46m, 0s',

    '1.08K',

    '925.00M',

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

for (let level = 1; level <= 2; level++) {

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

  name: 'Extra Extra Orbs',

  maxLevel: 2,

  levels,

}



fs.mkdirSync(path.dirname(outPath), { recursive: true })

fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')

console.log('Wrote', outPath, `(${levels.length} levels, screenshot data only)`)


