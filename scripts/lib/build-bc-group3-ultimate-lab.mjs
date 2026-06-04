import { ROWS } from '../data/bc-group3-enemy-ultimate-rows.mjs'

/** BC Group 3: q and Q both 1e15 per calculator screenshots. */
export function parseAbbrevNum(raw) {
  const s = String(raw).trim().replace(/,/g, '')
  if (/[qQ]$/.test(s)) return Math.round(parseFloat(s) * 1_000_000_000_000_000)
  if (/T$/.test(s)) return Math.round(parseFloat(s) * 1_000_000_000_000)
  if (/B$/.test(s)) return Math.round(parseFloat(s) * 1_000_000_000)
  if (/K$/.test(s)) return Math.round(parseFloat(s) * 1_000)
  const n = Number(s)
  return Number.isFinite(n) ? Math.round(n) : 0
}

export function parseTimeToSeconds(display) {
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

export function buildBcGroup3UltimateLab(name) {
  const levels = []
  for (let level = 1; level <= 10; level++) {
    const row = ROWS[level]
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
  return { name, maxLevel: 10, levels }
}
