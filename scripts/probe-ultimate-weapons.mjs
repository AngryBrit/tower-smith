import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'

const SAVE = process.argv[2] ?? 'h:/The Tower/SaveGames/playerInfo.dat'
const ORDER = [
  'goldenTower',
  'blackHole',
  'spotlight',
  'deathWave',
  'chainLightning',
  'smartMissiles',
  'innerLandMines',
  'poisonSwamp',
  'chronoField',
]

const { decodePlayerInfoBytes } = await import('../src/playerSave/decodePlayerInfo.ts')
const raw = readFileSync(SAVE)
const bytes = raw[0] === 0x1f && raw[1] === 0x8b ? gunzipSync(raw) : raw
const save = decodePlayerInfoBytes(bytes)

console.log('Save:', SAVE)
console.log('ultimateWeaponUnlocked', save.ultimateWeaponUnlocked)
console.log('ultimateWeaponOn', save.ultimateWeaponOn)
console.log('ultimateWeaponLevel (first 27 = 9 weapons x 3 upgrades):', save.ultimateWeaponLevel?.slice(0, 27))

console.log('\nBy WORKSHOP_ULTIMATE_WEAPON_ORDER index:')
for (let i = 0; i < ORDER.length; i++) {
  const u = save.ultimateWeaponUnlocked[i]
  const on = save.ultimateWeaponOn[i]
  const lv0 = save.ultimateWeaponLevel[i * 3]
  const lv1 = save.ultimateWeaponLevel[i * 3 + 1]
  const lv2 = save.ultimateWeaponLevel[i * 3 + 2]
  if (u || on || lv0 || lv1 || lv2) {
    console.log(
      `  [${i}] ${ORDER[i]}: unlocked=${u} on=${on} levels=[${lv0},${lv1},${lv2}]`,
    )
  }
}
