/**
 * Map module infoIndex values in a save to workshop chassis ids.
 * Usage: npx tsx scripts/probe-save-module-map.mjs [path-to.dat] [optional-module-id-filter]
 */
import { readFileSync, existsSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { decodePlayerInfoBytes } from '../src/playerSave/decodePlayerInfo.ts'
import { gameWorkshopChassisModuleId } from '../src/playerSave/gameModuleIndex.ts'
import { gameModuleEffectByIndexForSlot } from '../src/playerSave/gameModuleEffectIndex.ts'

const path = process.argv[2] ?? 'h:/The Tower/SaveGames/playerInfo.dat'
const filter = process.argv[3]?.toLowerCase()
if (!existsSync(path)) {
  console.error('Save not found:', path)
  process.exit(1)
}

const save = decodePlayerInfoBytes(gunzipSync(readFileSync(path)))
const SLOTS = ['cannon', 'armor', 'generator', 'core']

function resolveId(item) {
  for (const slot of SLOTS) {
    const id = gameWorkshopChassisModuleId(item.infoIndex, slot)
    if (id) return { slot, id }
  }
  return null
}

function printItem(label, item) {
  const resolved = resolveId(item)
  if (!resolved) {
    console.log(label, { infoIndex: item.infoIndex, level: item.level, rarity: item.rarity, mapped: null })
    return
  }
  const { slot, id } = resolved
  const effects = item.effects
    .filter((e) => e !== 0)
    .map((e) => {
      const d = gameModuleEffectByIndexForSlot(e, slot, item.level, 0)
      return d ? `${d.effectId}/${d.rarity}` : String(e)
    })
  console.log(label, { infoIndex: item.infoIndex, slot, id, level: item.level, rarity: item.rarity, effects })
}

function matchesFilter(resolved) {
  if (!filter || !resolved) return true
  return resolved.id.toLowerCase().includes(filter)
}

console.log('save:', path)

console.log('\n=== equipped ===')
save.moduleEquipped.forEach((item, i) => {
  if (!item) return
  const resolved = resolveId(item)
  if (matchesFilter(resolved)) printItem(`${SLOTS[i]} main`, item)
})

console.log('\n=== assist ===')
save.assistModuleSlots.forEach((row, i) => {
  if (!row.equipped) return
  const resolved = resolveId(row.equipped)
  if (matchesFilter(resolved)) printItem(`${SLOTS[i]} assist`, row.equipped)
})

console.log('\n=== inventory (unique infoIndex → id) ===')
const byIndex = new Map()
for (const item of save.moduleInventory) {
  const resolved = resolveId(item)
  if (!resolved || !matchesFilter(resolved)) continue
  const key = `${item.infoIndex}:${resolved.id}`
  if (!byIndex.has(key)) byIndex.set(key, item)
}
for (const [key, item] of [...byIndex.entries()].sort((a, b) => {
  return Number(a[0].split(':')[0]) - Number(b[0].split(':')[0])
})) {
  printItem(`inventory ${key}`, item)
}

if (filter) {
  const total =
    save.moduleEquipped.filter((item) => item && matchesFilter(resolveId(item))).length +
    save.assistModuleSlots.filter((row) => row.equipped && matchesFilter(resolveId(row.equipped))).length +
    byIndex.size
  if (total === 0) console.log(`\n(no rows matching "${filter}")`)
}
