import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import {
  ArraySinglePrimitiveRecord,
  BinaryArrayRecord,
  ClassRecord,
  MemberReferenceRecord,
  NrbfDecoder,
} from '../src/playerSave/nrbf.ts'

const raw = readFileSync('h:/The Tower/SaveGames/playerInfo.dat')
const bytes = gunzipSync(raw)
const decoder = new NrbfDecoder(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength))
const root = decoder.decode()
const player = [...decoder.getAllRecords().values()].find(
  (r) => r instanceof ClassRecord && r.typeName.includes('PlayerData'),
)

function resolve(v) {
  if (v instanceof MemberReferenceRecord) return decoder.getRecord(v.idRef)
  return v
}

function dump(name) {
  let v = resolve(player.getValue(name))
  if (v instanceof ArraySinglePrimitiveRecord) {
    const arr = v.getArray().map((x) => Number(x))
    console.log(name, 'len', arr.length, 'nonzero', arr.filter((n) => n > 0).length, 'head', arr.slice(0, 12))
    return
  }
  if (v instanceof ClassRecord) {
    console.log(name, 'class', v.typeName, 'members', v.memberNames.slice(0, 8))
    return
  }
  console.log(name, typeof v, v?.constructor?.name, v)
}

const fields = [
  'relicsUnlocked',
  'themeTower',
  'themeBackground',
  'selectedTower',
  'selectedBackground',
  'selectedMenu',
  'selectedProfileBanner',
  'botsUnlocked',
  'botsActive',
  'botsLevel',
  'ultimateWeaponLevel',
  'ultimateWeaponUnlocked',
  'ultimateWeaponOn',
  'ultimateWeaponPlusLevel',
  'ultimateWeaponPlusUnlocked',
  'moduleEquipped',
  'currentWorkshopPreset',
  'currentPreset',
]

for (const f of fields) {
  if (player.memberNames.includes(f)) dump(f)
  else console.log(f, 'MISSING')
}

const modEq = resolve(player.getValue('moduleEquipped'))
if (modEq instanceof BinaryArrayRecord) {
  const slots = ['cannon', 'armor', 'generator', 'core']
  modEq.elementValues.forEach((el, i) => {
    const item = resolve(el)
    if (!(item instanceof ClassRecord)) return
    const rar = resolve(item.getValue('currentRarity'))
    const rarN =
      rar instanceof ClassRecord ? rar.getValue('value__') : rar
    console.log('module', slots[i], {
      infoIndex: item.getValue('infoIndex'),
      level: item.getValue('level'),
      rarity: rarN,
    })
  })
}

const tu = resolve(player.getValue('towerUnlocked'))
if (tu instanceof ArraySinglePrimitiveRecord) {
  const arr = tu.getArray().map((x) => !!x)
  console.log('towerUnlocked', arr.length, 'owned', arr.filter(Boolean).length)
}

// relicsUnlocked array of enums
const relics = resolve(player.getValue('relicsUnlocked'))
if (relics instanceof ArraySinglePrimitiveRecord) {
  const arr = relics.getArray()
  const unlocked = []
  for (let i = 0; i < arr.length; i++) {
    if (Number(arr[i]) === 2) unlocked.push(i)
  }
  console.log('unlocked relic indices', unlocked.length, unlocked.slice(0, 20))
}
