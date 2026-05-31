/**
 * Usage: npx tsx scripts/probe-save-modules.mjs [path-to.dat]
 */
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import {
  BinaryArrayRecord,
  ClassRecord,
  MemberReferenceRecord,
  NrbfDecoder,
} from '../src/playerSave/nrbf.ts'
import { gameModuleEffectByIndex } from '../src/playerSave/gameModuleEffectIndex.ts'

const path = process.argv[2] ?? 'h:/The Tower/playerInfo.dat'
const raw = readFileSync(path)
const bytes = gunzipSync(raw)
const decoder = new NrbfDecoder(
  bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
)
decoder.decode()
const player = [...decoder.getAllRecords().values()].find(
  (r) => r instanceof ClassRecord && r.typeName.includes('PlayerData'),
)

function resolve(v) {
  if (v instanceof MemberReferenceRecord) return decoder.getRecord(v.idRef)
  return v
}

const slots = ['cannon', 'armor', 'generator', 'core']
const modEq = resolve(player.getValue('moduleEquipped'))
console.log('save:', path)
modEq.elementValues.forEach((el, i) => {
  const item = resolve(el)
  if (!(item instanceof ClassRecord)) return
  const effectsRaw = resolve(item.getValue('effects'))
  const effects = []
  if (effectsRaw?.getArray) {
    for (const x of effectsRaw.getArray()) effects.push(Math.trunc(Number(x)))
  } else if (effectsRaw instanceof BinaryArrayRecord) {
    for (const el2 of effectsRaw.elementValues) {
      const v = resolve(el2)
      effects.push(typeof v === 'number' ? Math.trunc(v) : 0)
    }
  }
  const rar = resolve(item.getValue('currentRarity'))
  const rarN = rar instanceof ClassRecord ? rar.getValue('value__') : rar
  const level = Math.trunc(Number(item.getValue('level')) || 0)
  const nonzero = effects.filter((x) => x !== 0)
  console.log('\n' + slots[i], {
    infoIndex: item.getValue('infoIndex'),
    level,
    rarity: rarN,
    effects: nonzero,
  })
  if (nonzero.length) {
    for (const idx of nonzero) {
      const d = gameModuleEffectByIndex(idx, level)
      console.log(' ', idx, d ? `${d.effectId}/${d.rarity}` : '?')
    }
  }
})
