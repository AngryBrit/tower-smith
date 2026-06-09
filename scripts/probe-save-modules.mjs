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
function printEffects(label, item, slotName) {
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
  console.log('\n' + label, {
    infoIndex: item.getValue('infoIndex'),
    level,
    rarity: rarN,
    effects,
  })
  for (let si = 0; si < effects.length; si++) {
    const idx = effects[si]
    if (idx === 0) continue
    const d = gameModuleEffectByIndex(idx, level)
    console.log(
      ' ',
      `slot${si}`,
      idx,
      d && d.slot === slotName ? `${d.effectId}/${d.rarity}` : d ? `WRONG_SLOT:${d.slot}/${d.effectId}` : '?',
    )
  }
}

modEq.elementValues.forEach((el, i) => {
  const item = resolve(el)
  if (!(item instanceof ClassRecord)) return
  printEffects(slots[i] + ' (main)', item, slots[i])
})

const assistRaw = resolve(player.getValue('assistModuleSlots'))
if (assistRaw instanceof BinaryArrayRecord) {
  assistRaw.elementValues.forEach((el, i) => {
    const slotRec = resolve(el)
    if (!(slotRec instanceof ClassRecord)) return
    const equipped = resolve(slotRec.getValue('equippedModule'))
    if (!(equipped instanceof ClassRecord)) return
    printEffects(slots[i] + ' (assist)', equipped, slots[i])
  })
}
