/**
 * List relicsUnlocked indices with value 2 and wiki-order mapping.
 * Usage: npx tsx scripts/probe-relics-unlocked.mjs [playerInfo.dat]
 */
import { readFileSync } from 'node:fs'
import { decodePlayerInfoFile } from '../src/playerSave/decodePlayerInfo.ts'
import { WORKSHOP_RELIC_ORDER, workshopRelicDef } from '../src/data/workshopRelics.ts'

const path = process.argv[2] ?? 'h:/The Tower/SaveGames/playerInfo.dat'
const save = await decodePlayerInfoFile(new Uint8Array(readFileSync(path)))
const rel = save.relicsUnlocked

const gameBirthday = [
  [23, 'Year1'],
  [24, 'Year2'],
  [25, 'Year3'],
  [80, 'Year4'],
  [81, 'Year5'],
  [82, 'Year6'],
]

console.log('=== game birthday indices ===')
for (const [i, name] of gameBirthday) {
  console.log(i, name, 'state=', rel[i])
  const ws = WORKSHOP_RELIC_ORDER[i]
  const def = ws ? workshopRelicDef(ws) : undefined
  console.log('  wrong wiki[i]:', def?.name ?? ws)
}

console.log('\n=== wiki birthday slots (order 29-34) ===')
for (let o = 29; o <= 34; o++) {
  const ws = WORKSHOP_RELIC_ORDER[o - 1]
  const def = workshopRelicDef(ws)
  console.log('wiki index', o - 1, 'state=', rel[o - 1], def?.name)
}

console.log('\n=== all unlocked (value 2), first 40 ===')
let n = 0
for (let i = 0; i < rel.length; i++) {
  if (rel[i] !== 2) continue
  const def = workshopRelicDef(WORKSHOP_RELIC_ORDER[i])
  console.log(i, def?.name ?? WORKSHOP_RELIC_ORDER[i])
  if (++n >= 40) break
}
