/**
 * List moduleEquipped + inventory infoIndex values from playerInfo.dat
 * Usage: npx tsx scripts/probe-module-inventory.mjs
 */
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import {
  BinaryArrayRecord,
  ClassRecord,
  MemberReferenceRecord,
  NrbfDecoder,
} from '../src/playerSave/nrbf.ts'

const raw = readFileSync('h:/The Tower/playerInfo.dat')
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

function readModuleItem(item) {
  if (!(item instanceof ClassRecord)) return null
  const rar = resolve(item.getValue('currentRarity'))
  const rarN = rar instanceof ClassRecord ? rar.getValue('value__') : rar
  const effectsRaw = resolve(item.getValue('effects'))
  let effectIds = []
  if (effectsRaw?.getArray) {
    effectIds = effectsRaw.getArray().map((x) => Math.trunc(Number(x)))
  } else if (effectsRaw instanceof BinaryArrayRecord) {
    effectIds = effectsRaw.elementValues.map((el) => {
      const v = resolve(el)
      return typeof v === 'number' ? Math.trunc(v) : 0
    })
  }
  return {
    infoIndex: item.getValue('infoIndex'),
    level: item.getValue('level'),
    rarity: rarN,
    effects: effectIds,
  }
}

const slots = ['cannon', 'armor', 'generator', 'core']
const modEq = resolve(player.getValue('moduleEquipped'))
if (modEq instanceof BinaryArrayRecord) {
  console.log('=== moduleEquipped ===')
  modEq.elementValues.forEach((el, i) => {
    console.log(slots[i], readModuleItem(resolve(el)))
  })
}

const inv = resolve(player.getValue('inventory'))
if (inv instanceof ClassRecord) {
  const items = resolve(inv.getValue('_items'))
  if (items && items.elementValues) {
    console.log('\n=== inventory (first 40) ===')
    const byIndex = new Map()
    for (const el of items.elementValues) {
      const row = readModuleItem(resolve(el))
      if (!row) continue
      const k = row.infoIndex
      if (!byIndex.has(k)) byIndex.set(k, [])
      byIndex.get(k).push(row)
    }
    console.log('unique infoIndex count', byIndex.size)
    const sorted = [...byIndex.entries()].sort((a, b) => a[0] - b[0])
    for (const [idx, rows] of sorted.slice(0, 40)) {
      console.log(idx, 'x' + rows.length, rows[0])
    }
    console.log('...')
    for (const [idx, rows] of sorted.slice(-10)) {
      console.log(idx, 'x' + rows.length, rows[0])
    }
  }
}

const assist = resolve(player.getValue('assistModuleSlots'))
if (assist instanceof BinaryArrayRecord) {
  console.log('\n=== assistModuleSlots ===')
  assist.elementValues.forEach((el, i) => {
    const slot = resolve(el)
    if (!(slot instanceof ClassRecord)) return
    const mod = readModuleItem(resolve(slot.getValue('equippedModule')))
    console.log(slots[i], {
      unlocked: slot.getValue('unlocked'),
      uniqueEff: slot.getValue('uniqueEffectEfficiencyLevel'),
      mainEff: slot.getValue('mainEffectEfficiencyLevel'),
      subEff: slot.getValue('substatEfficiencyLevel'),
      module: mod,
    })
  })
}
