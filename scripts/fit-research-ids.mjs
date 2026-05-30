import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { gunzipSync } from 'node:zlib'

const EXPECTED = {
  'main-research': [
    ['Game Speed', 7],
    ['Starting Cash', 0],
    ['Workshop Attack Discount', 2],
    ['Workshop Defense Discount', 2],
    ['Workshop Utility Discount', 2],
    ['Labs Coin Discount', 4],
    ['Labs Speed', 88],
    ['Buy Multiplier', 2],
    ['More Round Stats', 1],
    ['Target Priority', 1],
    ['Card Presets', 1],
    ['Workshop Respec', 1],
    ['Reroll Daily Mission', 1],
    ['Workshop Enhancements', 1],
  ],
  'attack-research': [
    ['Damage', 46],
    ['Attack Speed', 84],
    ['Critical Factor', 16],
    ['Range', 0],
    ['Damage / Meter', 14],
    ['Super Crit Chance', 0],
    ['Super Crit Multi', 0],
    ['Max Rend Armor Multiplier', 4],
    ['Light Speed Shots', 1],
  ],
  'defense-research': [
    ['Health', 80],
    ['Health Regen', 62],
    ['Defense Absolute', 11],
    ['Defense %', 32],
    ['Orbs Speed', 20],
    ['Land Mine Damage', 0],
    ['Land Mine Decay', 0],
    ['Shockwave Size', 0],
    ['Orb Boss Hit', 8],
    ['Wall Health', 50],
    ['Wall Rebuild', 5],
    ['Wall Regen', 18],
    ['Wall Thorns', 16],
    ['Wall Invincibility', 0],
    ['Wall Fortification', 42],
    ['Garlic Thorns', 10],
  ],
  'utility-research': [
    ['Cash Bonus', 27],
    ['Cash / Wave', 5],
    ['Coins / Kill Bonus', 89],
    ['Coins / Wave', 26],
    ['Interest', 0],
    ['Max Interest', 0],
    ['Package After Boss', 1],
    ['Recovery Package Amount', 0],
    ['Recovery Package Max', 0],
    ['Recovery Package Chance', 0],
    ['Enemy Attack Level Skip', 19],
    ['Enemy Health Level Skip', 19],
  ],
}

const { decodePlayerInfoBytes } = await import('../src/playerSave/decodePlayerInfo.ts')
const raw = readFileSync('h:/The Tower/playerInfo.dat')
const bytes = raw[0] === 0x1f && raw[1] === 0x8b ? gunzipSync(raw) : raw
const levels = decodePlayerInfoBytes(bytes).researchLevel

const mf = JSON.parse(readFileSync('public/research/manifest.json', 'utf8'))
let flat = 0
const rows = []
for (const rel of mf.sectionFiles) {
  const slug = rel.split('/').pop().replace(/\.json$/i, '')
  const sec = JSON.parse(readFileSync(join('public', rel.replace(/^\//, '')), 'utf8'))
  const expected = EXPECTED[slug]
  for (let ii = 0; ii < sec.items.length; ii++) {
    const name = sec.items[ii].name
    const exp = expected?.[ii]
    const expLv = exp ? exp[1] : null
    const matches = []
    for (let id = 0; id < levels.length; id++) {
      if (levels[id] === expLv) matches.push(id)
    }
    rows.push({ flat, slug, ii, name, expLv, matches: matches.slice(0, 8) })
    flat++
  }
}

for (const r of rows) {
  if (r.expLv == null) continue
  const m =
    r.matches.length === 1
      ? `id ${r.matches[0]}`
      : r.matches.length === 0
        ? 'NO MATCH'
        : `ambig [${r.matches.join(',')}]`
  console.log(`${r.slug}[${r.ii}] ${r.name} = ${r.expLv} -> ${m}`)
}
