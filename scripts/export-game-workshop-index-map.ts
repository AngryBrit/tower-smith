/**
 * Export workshop ↔ game save index mapping as CSV.
 * Run: npx tsx scripts/export-game-workshop-index-map.ts [output.csv]
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  GAME_ENHANCE_ATTACK_LEVEL_KEYS,
  GAME_ENHANCE_DEFENSE_LEVEL_KEYS,
  GAME_ENHANCE_UTILITY_LEVEL_KEYS,
  GAME_WORKSHOP_ATTACK_LEVEL_KEYS,
  GAME_WORKSHOP_DEFENSE_LEVEL_KEYS,
  GAME_WORKSHOP_UTILITY_LEVEL_KEYS,
} from '../src/playerSave/gameWorkshopMapping'
import {
  GAME_ULTIMATE_UPGRADES_PER_WEAPON,
  GAME_ULTIMATE_WEAPON_INDEX,
} from '../src/playerSave/gameUltimateWeaponMapping'
import { WORKSHOP_GAME_CARD_ORDER } from '../src/data/workshopGameCards'
import { WORKSHOP_BOT_ORDER, WORKSHOP_BOT_UPGRADE_ORDER } from '../src/data/workshopBotsData'
import {
  workshopUltimateOwnedKey,
  workshopUltimateActiveKey,
  workshopUltimateWeaponUpgradeKeys,
  WORKSHOP_ULTIMATE_WEAPON_ORDER,
} from '../src/data/workshopUltimate'
import {
  WORKSHOP_ULTIMATE_PLUS_ABILITY_ORDER,
  WORKSHOP_ULTIMATE_PLUS_LEVEL_BY_ABILITY,
} from '../src/data/workshopUltimatePlusData'
import { workshopRelicDef } from '../src/data/workshopRelics'
import {
  GAME_RELIC_COUNT,
  GAME_RELIC_INDEX_TO_WORKSHOP_ID,
} from '../src/playerSave/gameRelicMapping'
import { GAME_THEMES, type ThemeCategory } from '../src/data/gameThemes'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const out =
  process.argv[2] ?? path.join(root, 'docs', 'game-workshop-index-map.csv')

type Row = {
  category: string
  save_array: string
  save_index: number | string
  towersmith_field: string
  display_name: string
  import_mapped: string
  notes: string
}

const rows: Row[] = []

function push(r: Row) {
  rows.push(r)
}

function levelRows(
  category: string,
  saveArray: string,
  keys: readonly string[],
  names?: readonly string[],
  extraUnmappedSlots = 0,
) {
  for (let i = 0; i < keys.length; i++) {
    push({
      category,
      save_array: saveArray,
      save_index: i,
      towersmith_field: keys[i]!,
      display_name: names?.[i] ?? keys[i]!,
      import_mapped: 'yes',
      notes: '',
    })
  }
  for (let i = keys.length; i < keys.length + extraUnmappedSlots; i++) {
    push({
      category,
      save_array: saveArray,
      save_index: i,
      towersmith_field: '',
      display_name: `(save slot ${i}, not mapped)`,
      import_mapped: 'no',
      notes: 'index beyond TowerSmith key list',
    })
  }
}

function boolRows(
  category: string,
  saveArray: string,
  ids: readonly string[],
  keyFn: (id: string) => string,
  displayFn: (id: string) => string,
) {
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i]!
    push({
      category,
      save_array: saveArray,
      save_index: i,
      towersmith_field: keyFn(id),
      display_name: displayFn(id),
      import_mapped: 'yes',
      notes: '',
    })
  }
}

// --- Basic workshop (coins) ---
const ATTACK_LABELS = [
  'Damage',
  'Attack Speed',
  'Crit Chance',
  'Crit Factor',
  'Range',
  'Damage/Meter',
  'Multishot Chance',
  'Multishot Targets',
  'Rapid Fire Chance',
  'Rapid Fire Duration',
  'Bounce Shot Chance',
  'Bounce Shot Targets',
  'Bounce Shot Range',
  'Super Crit Chance',
  'Super Crit Mult',
  'Rend Armor Chance',
  'Rend Armor Mult',
]

levelRows(
  'workshop_attack',
  'upgradeWorkshopLevel',
  GAME_WORKSHOP_ATTACK_LEVEL_KEYS,
  ATTACK_LABELS,
  4,
)

const DEFENSE_LABELS = [
  'Health',
  'Health Regen',
  'Defense %',
  'Defense Absolute',
  'Thorn Damage',
  'Lifesteal',
  'Knockback Chance',
  'Knockback Force',
  'Orb Speed',
  'Orbs',
  'Shockwave Size',
  'Shockwave Frequency',
  'Land Mine Chance',
  'Land Mine Damage',
  'Land Mine Radius',
  'Death Defy',
  'Wall Health',
  'Wall Rebuild',
]

levelRows(
  'workshop_defense',
  'upgradeWorkshopDefenseLevel',
  GAME_WORKSHOP_DEFENSE_LEVEL_KEYS,
  DEFENSE_LABELS,
)

const UTILITY_LABELS = [
  'Cash Bonus',
  'Cash/Wave',
  'Coins/Kill',
  'Coins/Wave',
  'Free Attack Upgrade',
  'Free Defense Upgrade',
  'Free Utility Upgrade',
  'Interest/Wave',
  'Recovery Amount',
  'Max Recovery',
  'Package Chance',
  'Enemy Attack Level Skip',
  'Enemy Health Level Skip',
]

levelRows(
  'workshop_utility',
  'upgradeWorkshopUtilityLevel',
  GAME_WORKSHOP_UTILITY_LEVEL_KEYS,
  UTILITY_LABELS,
)

// --- Enhancements ---
levelRows('enhance_attack', 'enhancementLevel', GAME_ENHANCE_ATTACK_LEVEL_KEYS)
levelRows('enhance_defense', 'enhancementDefenseLevel', GAME_ENHANCE_DEFENSE_LEVEL_KEYS)
levelRows('enhance_utility', 'enhancementUtilityLevel', GAME_ENHANCE_UTILITY_LEVEL_KEYS)

// --- Bots ---
for (let bi = 0; bi < WORKSHOP_BOT_ORDER.length; bi++) {
  const botId = WORKSHOP_BOT_ORDER[bi]!
  push({
    category: 'bot_owned',
    save_array: 'botsUnlocked',
    save_index: bi,
    towersmith_field: `${botId}Owned`,
    display_name: `${botId} bot (owned)`,
    import_mapped: 'yes',
    notes: 'assumes save index matches WORKSHOP_BOT_ORDER',
  })
  push({
    category: 'bot_active',
    save_array: 'botsActive',
    save_index: bi,
    towersmith_field: `${botId}Active`,
    display_name: `${botId} bot (active)`,
    import_mapped: 'yes',
    notes: 'assumes save index matches WORKSHOP_BOT_ORDER',
  })
}

for (let i = 0; i < WORKSHOP_BOT_UPGRADE_ORDER.length; i++) {
  push({
    category: 'bot_upgrade',
    save_array: 'botsLevel',
    save_index: i,
    towersmith_field: WORKSHOP_BOT_UPGRADE_ORDER[i]!,
    display_name: WORKSHOP_BOT_UPGRADE_ORDER[i]!,
    import_mapped: 'yes',
    notes: 'linear index → WORKSHOP_BOT_UPGRADE_ORDER',
  })
}

// --- Ultimate weapons (UI order = game save index 0…8) ---
const UI_WEAPON_NAMES: Record<string, string> = {
  goldenTower: 'Golden Tower',
  blackHole: 'Black Hole',
  spotlight: 'Spotlight',
  deathWave: 'Death Wave',
  chainLightning: 'Chain Lightning',
  smartMissiles: 'Smart Missiles',
  innerLandMines: 'Inner Land Mines',
  poisonSwamp: 'Poison Swamp',
  chronoField: 'Chrono Field',
}

for (let ui = 0; ui < WORKSHOP_ULTIMATE_WEAPON_ORDER.length; ui++) {
  const weaponId = WORKSHOP_ULTIMATE_WEAPON_ORDER[ui]!
  const gi = GAME_ULTIMATE_WEAPON_INDEX[weaponId]
  const name = UI_WEAPON_NAMES[weaponId] ?? weaponId

  push({
    category: 'ultimate_owned',
    save_array: 'ultimateWeaponUnlocked',
    save_index: gi,
    towersmith_field: workshopUltimateOwnedKey(weaponId),
    display_name: name,
    import_mapped: 'yes',
    notes: `game index ${gi}`,
  })
  push({
    category: 'ultimate_active',
    save_array: 'ultimateWeaponOn',
    save_index: gi,
    towersmith_field: workshopUltimateActiveKey(weaponId),
    display_name: name,
    import_mapped: 'yes',
    notes: `game index ${gi}`,
  })

  const upgradeKeys = workshopUltimateWeaponUpgradeKeys(weaponId)
  const base = gi * GAME_ULTIMATE_UPGRADES_PER_WEAPON
  for (let u = 0; u < upgradeKeys.length; u++) {
    push({
      category: 'ultimate_upgrade',
      save_array: 'ultimateWeaponLevel',
      save_index: base + u,
      towersmith_field: upgradeKeys[u]!,
      display_name: `${name} upgrade ${u}`,
      import_mapped: 'yes',
      notes: `game weapon ${gi}, slot ${u}`,
    })
  }
}

for (let pi = 0; pi < WORKSHOP_ULTIMATE_PLUS_ABILITY_ORDER.length; pi++) {
  const abilityId = WORKSHOP_ULTIMATE_PLUS_ABILITY_ORDER[pi]!
  push({
    category: 'ultimate_plus',
    save_array: 'ultimateWeaponPlusLevel',
    save_index: pi,
    towersmith_field: WORKSHOP_ULTIMATE_PLUS_LEVEL_BY_ABILITY[abilityId],
    display_name: abilityId,
    import_mapped: 'yes',
    notes: 'wiki plus unlock order',
  })
}

// --- Cards ---
for (let i = 0; i < WORKSHOP_GAME_CARD_ORDER.length; i++) {
  const cardId = WORKSHOP_GAME_CARD_ORDER[i]!
  push({
    category: 'card_stars',
    save_array: 'cardLevel',
    save_index: i,
    towersmith_field: `cardStars.${cardId}`,
    display_name: cardId,
    import_mapped: 'yes',
    notes: '',
  })
}

// --- Relics (game Relic enum index, not wiki order) ---
for (let i = 0; i < GAME_RELIC_COUNT; i++) {
  const id = GAME_RELIC_INDEX_TO_WORKSHOP_ID[i]
  const def = id ? workshopRelicDef(id) : undefined
  push({
    category: 'relic',
    save_array: 'relicsUnlocked',
    save_index: i,
    towersmith_field: id ? `relicOwnedIds (includes ${id})` : '',
    display_name: def?.name ?? id ?? `Relic enum ${i}`,
    import_mapped: id ? 'yes' : 'no',
    notes: 'value 2 = owned; index is Il2Cpp Relic enum',
  })
}

// --- Themes ---
const THEME_CATEGORIES: { category: ThemeCategory; saveField: string }[] = [
  { category: 'tower', saveField: 'towerUnlocked' },
  { category: 'background', saveField: 'backgroundUnlocked' },
  { category: 'menus', saveField: 'menuUnlocked' },
  { category: 'banners', saveField: 'profileBannerUnlocked' },
]

for (const { category, saveField } of THEME_CATEGORIES) {
  const ids = GAME_THEMES.filter((t) => t.category === category).map((t) => t.id)
  for (let i = 0; i < ids.length; i++) {
    push({
      category: 'theme_owned',
      save_array: saveField,
      save_index: i,
      towersmith_field: `themes.ownedIds (${ids[i]})`,
      display_name: ids[i]!,
      import_mapped: 'yes',
      notes: `selected: selectedTower/Background/Menu/ProfileBanner`,
    })
  }
}

push({
  category: 'theme_selection',
  save_array: 'selectedTower',
  save_index: '—',
  towersmith_field: 'themes.selection.tower',
  display_name: 'Selected tower theme',
  import_mapped: 'yes',
  notes: 'index into towerUnlocked catalog',
})
push({
  category: 'theme_selection',
  save_array: 'selectedBackground',
  save_index: '—',
  towersmith_field: 'themes.selection.background',
  display_name: 'Selected background theme',
  import_mapped: 'yes',
  notes: '',
})
push({
  category: 'theme_selection',
  save_array: 'selectedMenu',
  save_index: '—',
  towersmith_field: 'themes.selection.menus',
  display_name: 'Selected menu theme',
  import_mapped: 'yes',
  notes: '',
})
push({
  category: 'theme_selection',
  save_array: 'selectedProfileBanner',
  save_index: '—',
  towersmith_field: 'themes.selection.banners',
  display_name: 'Selected banner theme',
  import_mapped: 'yes',
  notes: '',
})

// --- Modules (partial) ---
const MODULE_SLOTS = ['cannon', 'armor', 'generator', 'core'] as const
for (let i = 0; i < MODULE_SLOTS.length; i++) {
  push({
    category: 'module_equipped',
    save_array: 'moduleEquipped',
    save_index: i,
    towersmith_field: `module slot ${MODULE_SLOTS[i]}`,
    display_name: MODULE_SLOTS[i]!,
    import_mapped: 'partial',
    notes: 'level + rarity + chassis id (MANUAL_OVERRIDES in gen-game-module-index.mjs); sub-module effects not mapped',
  })
}

push({
  category: 'workshop_preset',
  save_array: 'currentWorkshopPreset',
  save_index: '—',
  towersmith_field: '(not imported)',
  display_name: 'Active workshop preset',
  import_mapped: 'no',
  notes: '',
})

function csvEscape(s: string) {
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

const header = [
  'category',
  'save_array',
  'save_index',
  'towersmith_field',
  'display_name',
  'import_mapped',
  'notes',
].join(',')

const lines = [
  header,
  ...rows.map((r) =>
    [
      r.category,
      r.save_array,
      r.save_index,
      csvEscape(r.towersmith_field),
      csvEscape(r.display_name),
      r.import_mapped,
      csvEscape(r.notes),
    ].join(','),
  ),
]

const dir = path.dirname(out)
if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
writeFileSync(out, lines.join('\n') + '\n', 'utf8')

console.log(`Wrote ${rows.length} rows to ${out}`)
