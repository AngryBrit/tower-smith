/**
 * Compare module ownership: strict resolve vs naive infoIndex.
 * Usage: npx tsx scripts/audit-module-ownership.mjs [playerInfo.dat]
 */
import { readFileSync } from 'node:fs'
import { decodePlayerInfoFile } from '../src/playerSave/decodePlayerInfo.ts'
import { playerSaveToWorkshop } from '../src/playerSave/mapPlayerDataToTower.ts'
import { CHASSIS_MODULE_ORDERS } from '../src/data/workshopChassisModuleSelection.ts'
import { workshopModuleIsOwned } from '../src/data/workshopModuleConfigLibrary.ts'
import { gameWorkshopChassisModuleId } from '../src/playerSave/gameModuleIndex.ts'
import { resolveModuleItemOwnership } from '../src/playerSave/resolveModuleItem.ts'
import { isSignificantModuleCopy } from '../src/data/workshopModuleCopyCounts.ts'

const path = process.argv[2] ?? 'h:/The Tower/SaveGames/playerInfo.dat'
const save = await decodePlayerInfoFile(new Uint8Array(readFileSync(path)))
const ws = playerSaveToWorkshop(save)
const slots = ['cannon', 'armor', 'generator', 'core']

const naiveOwned = new Set()
for (const item of save.moduleInventory) {
  if (!isSignificantModuleCopy(item)) continue
  for (const slot of slots) {
    const id = gameWorkshopChassisModuleId(item.infoIndex, slot)
    if (id) naiveOwned.add(`${slot}:${id}`)
  }
}
for (let i = 0; i < slots.length; i++) {
  const item = save.moduleEquipped[i]
  if (item) {
    const id = gameWorkshopChassisModuleId(item.infoIndex, slots[i])
    if (id) naiveOwned.add(`${slots[i]}:${id}`)
  }
  const item2 = save.assistModuleSlots[i]?.equipped
  if (item2) {
    const id = gameWorkshopChassisModuleId(item2.infoIndex, slots[i])
    if (id) naiveOwned.add(`${slots[i]}:${id}`)
  }
}

const strictOwned = new Set()
for (const slot of slots) {
  for (const moduleId of CHASSIS_MODULE_ORDERS[slot]) {
    if (workshopModuleIsOwned(ws, slot, moduleId)) strictOwned.add(`${slot}:${moduleId}`)
  }
}

const missing = [...naiveOwned].filter((k) => !strictOwned.has(k)).sort()
const extra = [...strictOwned].filter((k) => !naiveOwned.has(k)).sort()

console.log('save:', path)
console.log('naive owned:', naiveOwned.size, 'strict owned:', strictOwned.size)
console.log('\nmissing from strict (shown unowned but infoIndex says owned):', missing.length)
for (const key of missing) {
  const [slot, moduleId] = key.split(':')
  const rows = save.moduleInventory.filter((item) => {
    if (!isSignificantModuleCopy(item)) return false
    return gameWorkshopChassisModuleId(item.infoIndex, slot) === moduleId
  })
  console.log(`  ${key} (${rows.length} inventory rows)`)
  for (const item of rows.slice(0, 3)) {
    console.log('   ', {
      infoIndex: item.infoIndex,
      level: item.level,
      rarity: item.rarity,
      resolved: resolveModuleItemOwnership(item),
      effects: item.effects.filter((e) => e !== 0),
    })
  }
}

if (extra.length) {
  console.log('\nextra in strict only:', extra)
}
