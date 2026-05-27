import { readFileSync, writeFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { decodePlayerInfoBytes } from '../src/playerSave/decodePlayerInfo.ts'

const save = decodePlayerInfoBytes(gunzipSync(readFileSync('h:/The Tower/playerInfo.dat')))
const lines = save.researchLevel.map((lv, i) => `${i}\t${lv}`).join('\n')
writeFileSync('scripts/out-research-levels.tsv', lines)
const nz = save.researchLevel
  .map((lv, i) => ({ i, lv }))
  .filter((x) => x.lv > 0)
console.log('nonzero', nz.length)
console.log('id30 (Game Speed?)', save.researchLevel[30])
console.log('id0', save.researchLevel[0])
console.log('wrote scripts/out-research-levels.tsv')
