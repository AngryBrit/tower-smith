/**
 * Compare Effective Paths relic Unlocked column vs player-save-field-dump relicsUnlocked.
 *
 * Usage: node scripts/compare-effective-paths-relics.mjs [spreadsheet.tsv]
 * Default spreadsheet: scripts/effective-paths-relics.tsv (paste from Effective Paths)
 */

import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dumpPath = join(root, 'docs/player-save-field-dump.json')
const relicsPath = join(root, 'src/data/workshopRelics.generated.json')
const mappingPath = join(root, 'src/playerSave/gameRelicMapping.ts')

const RELIC_UNLOCKED = 2

function normalizeName(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/['']/g, '')
    .replace(/\bt\s*:\s*([ivx]+)\b/gi, (_match, roman) => `t${roman.toLowerCase()}`)
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function loadGameIndexToId() {
  const src = readFileSync(mappingPath, 'utf8')
  const m = src.match(
    /export const GAME_RELIC_INDEX_TO_WORKSHOP_ID[^[]*\[([\s\S]*?)\]\s*as const/s,
  )
  if (!m) throw new Error('Could not parse GAME_RELIC_INDEX_TO_WORKSHOP_ID')
  const ids = [...m[1].matchAll(/"([^"]+)"|null/g)].map((x) => (x[1] ?? null))
  return ids
}

function loadNameToId() {
  const relics = JSON.parse(readFileSync(relicsPath, 'utf8'))
  const byNorm = new Map()
  const aliases = new Map([
    [normalizeName('Game Joystick'), 'holy_joystick'],
    [normalizeName('Holy Joystick'), 'holy_joystick'],
    [normalizeName('Controller'), 'controller'],
    [normalizeName('Cheers'), 'cheers'],
    [normalizeName('Champagne'), 'champagne'],
    [normalizeName('Gnosis'), 'gnosis'],
    [normalizeName('Omniscience'), 'gnosis'],
    [normalizeName('Instant Knowledge'), 'gnosis'],
    [normalizeName('Creepy Smile'), 'creepy_smile'],
    [normalizeName('Dark Sight'), 'dark_sight'],
    [normalizeName('Storm Clouds'), 'cloud_lightning'],
    [normalizeName('Cloud Lightning'), 'cloud_lightning'],
    [normalizeName('River Of Plenty'), 'river_of_plenty'],
    [normalizeName('Gift box'), 'gift_box'],
    [normalizeName('Gift Box'), 'gift_box'],
    [normalizeName('Carousel Of Joy'), 'carousel_of_joy'],
    [normalizeName('Mystic Bunny'), 'mystic_bunny_1'],
    [normalizeName('Pet Cat'), 'pet_cat'],
    [normalizeName('Lunar Cat Paw'), 'lunar_cat_paw'],
    [normalizeName('Clip Ons'), 'clip_ons'],
    [normalizeName('Summit Starlight'), 'summit_starlight'],
    [normalizeName('3 Body Solution'), '3_body_solution'],
    [normalizeName('Lets Mix'), 'let_s_mix'],
    [normalizeName("Let's Mix"), 'let_s_mix'],
    [normalizeName('Night Life'), 'night_life'],
    [normalizeName('Vr'), 'vr'],
    [normalizeName('Cyberpunk'), 'vr'],
    [normalizeName('Lets Play'), 'let_s_play'],
    [normalizeName("Let's Play"), 'let_s_play'],
    [normalizeName('Warm Clothes'), 'warm_clothes'],
    [normalizeName('Winter Is Coming'), 'warm_clothes'],
    [normalizeName("Collector's Spirit"), 'collector_s_spirit'],
    [normalizeName('What Time Is It?'), 'ancient_times'],
    [normalizeName('What time is it? (II)'), 'clock_tower'],
    [normalizeName('Ancient Times'), 'ancient_times'],
    [normalizeName("Nature's Fury"), 'nature_s_fury'],
    [normalizeName("Nature's Wrath"), 'nature_s_wrath'],
    [normalizeName('Endless Adventure'), 'eternal_quest'],
    [normalizeName('Eternal Quest'), 'eternal_quest'],
    [normalizeName('Tower Agent'), 'tower_agent'],
    [normalizeName('Fake Reality'), 'fake_reality'],
    [normalizeName('Sands of (II) Time'), 'sphinx'],
    [normalizeName('Sands of Time (II)'), 'sphinx'],
  ])
  for (const r of relics) {
    byNorm.set(normalizeName(r.name), r.id)
  }
  for (const [k, v] of aliases) byNorm.set(k, v)
  return byNorm
}

function loadSaveOwnedIds() {
  const dump = JSON.parse(readFileSync(dumpPath, 'utf8'))
  const items = dump.fields.relicsUnlocked.items
  const gameIds = loadGameIndexToId()
  const owned = new Set()
  for (const item of items) {
    const v = item.value?.value__
    if (v !== RELIC_UNLOCKED) continue
    const id = gameIds[item.index]
    if (id) owned.add(id)
  }
  return owned
}

function detectTsvLayout(lines) {
  let nameCol = 2
  let unlockedCol = 5
  let startRow = 1
  for (let i = 0; i < Math.min(lines.length, 15); i++) {
    const cols = lines[i].split('\t').map((c) => c.trim())
    const hasRarity = cols.some((c) => c.toLowerCase() === 'rarity')
    if (!hasRarity) continue
    const relicNameIdx = cols.findIndex((c) => /^relic(\s*name)?$/i.test(c) || c.toLowerCase() === 'name')
    const unlockedIdx = cols.findIndex((c) => c.toLowerCase() === 'unlocked' || c.toLowerCase() === 'owned')
    if (relicNameIdx >= 0) nameCol = relicNameIdx
    if (unlockedIdx >= 0) unlockedCol = unlockedIdx
    startRow = i + 1
    break
  }
  return { nameCol, unlockedCol, startRow }
}

function parseSpreadsheet(path) {
  const text = readFileSync(path, 'utf8')
  const lines = text.split(/\r?\n/)
  const { nameCol, unlockedCol, startRow } = detectTsvLayout(lines)
  const rows = []
  for (let i = startRow; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue
    const cols = line.split('\t').map((c) => c.trim())
    const name = cols[nameCol]?.trim()
    const unlockedRaw = cols[unlockedCol]?.trim().toUpperCase()
    if (!name || name.toLowerCase().startsWith('rarity')) continue
    if (!unlockedRaw) continue
    if (unlockedRaw !== 'TRUE' && unlockedRaw !== 'FALSE') continue
    rows.push({ name, unlocked: unlockedRaw === 'TRUE' })
  }
  return rows
}

const defaultSheetPath = join(root, 'scripts/effective-paths-relics.tsv')
const sheetPath = process.argv[2] ?? defaultSheetPath
if (!existsSync(sheetPath)) {
  console.error('Missing spreadsheet:', sheetPath)
  console.error('')
  console.error('Export your Effective Paths Relics tab from Google Sheets:')
  console.error('  File → Download → Tab-separated values (.tsv)')
  console.error('Then save it as one of:')
  console.error(`  ${defaultSheetPath}`)
  console.error('  or pass the full path:')
  console.error('  node scripts/compare-effective-paths-relics.mjs "C:\\Users\\you\\Downloads\\Relics.tsv"')
  console.error('')
  console.error('Save data uses docs/player-save-field-dump.json — refresh with:')
  console.error('  npx tsx scripts/regenerate-player-save-dump.mjs "h:/The Tower/SaveGames/playerInfo.dat"')
  process.exit(1)
}

const nameToId = loadNameToId()
const saveOwned = loadSaveOwnedIds()
const rows = parseSpreadsheet(sheetPath)

const mismatches = []
const unmapped = []
let matched = 0

for (const row of rows) {
  const id = nameToId.get(normalizeName(row.name))
  if (!id) {
    unmapped.push(row.name)
    continue
  }
  const inSave = saveOwned.has(id)
  if (inSave !== row.unlocked) {
    mismatches.push({
      name: row.name,
      id,
      sheet: row.unlocked,
      save: inSave,
    })
  } else {
    matched++
  }
}

console.log('Save owned count:', saveOwned.size)
console.log('Spreadsheet rows:', rows.length)
console.log('Matched:', matched)
console.log('Unmapped names:', unmapped.length)
if (unmapped.length) console.log('  ', unmapped.join(', '))
console.log('Mismatches:', mismatches.length)
for (const m of mismatches) {
  console.log(
    `  ${m.name} (${m.id}): sheet=${m.sheet ? 'TRUE' : 'FALSE'} save=${m.save ? 'owned' : 'not owned'}`,
  )
}

// Relics in save but not TRUE in sheet (among mapped sheet rows only)
const sheetTrueIds = new Set(
  rows
    .map((r) => nameToId.get(normalizeName(r.name)))
    .filter(Boolean)
    .filter((id, _i, _a) => {
      const row = rows.find((r) => nameToId.get(normalizeName(r.name)) === id)
      return row?.unlocked
    }),
)
const extraInSave = [...saveOwned].filter((id) => {
  const relics = JSON.parse(readFileSync(relicsPath, 'utf8'))
  const r = relics.find((x) => x.id === id)
  if (!r) return true
  const row = rows.find((x) => nameToId.get(normalizeName(x.name)) === id)
  if (!row) return true
  return !row.unlocked
})
if (extraInSave.length) {
  console.log('\nOwned in save but FALSE/missing in sheet:')
  const relics = JSON.parse(readFileSync(relicsPath, 'utf8'))
  for (const id of extraInSave.sort()) {
    const r = relics.find((x) => x.id === id)
    console.log(`  ${r?.name ?? id} (${id})`)
  }
}

process.exit(mismatches.length || unmapped.length ? 1 : 0)
