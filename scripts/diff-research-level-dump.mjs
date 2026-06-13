/**
 * Diff researchLevel[] between previous snapshot and current docs/player-save-field-dump.json
 * Run: node scripts/diff-research-level-dump.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const DUMP_PATH = join(root, 'docs/player-save-field-dump.json')
const SNAPSHOT_PATH = join(root, 'docs/player-save-research-level.previous.json')

const LAB_BY_ID = {
  0: 'Attack: Damage',
  1: 'Attack: Attack Speed',
  2: 'Attack: Critical Factor',
  3: 'Attack: Range',
  4: 'Attack: Damage / Meter',
  5: 'Attack: Super Crit Chance',
  6: 'Attack: Super Crit Mult',
  10: 'Defense: Health',
  11: 'Defense: Health Regen',
  12: 'Defense Absolute',
  13: 'Defense %',
  14: 'Defense: Orbs Speed',
  18: 'Defense: Orb Boss Hit',
  19: 'Utility: Recovery Package Amount',
  20: 'Utility: Cash Bonus',
  21: 'Utility: Cash / Wave',
  22: 'Utility: Coins / Kill Bonus',
  23: 'Utility: Coins / Wave',
  26: 'Utility: Package After Boss',
  30: 'Main: Game Speed',
  32: 'Main: Workshop Attack Discount',
  33: 'Main: Workshop Defense Discount',
  34: 'Main: Workshop Utility Discount',
  35: 'Main: Labs Coin Discount',
  36: 'Main: Labs Speed',
  37: 'Main: Buy Multiplier',
  38: 'Main: More Round Stats',
  39: 'Main: Target Priority',
  40: 'Main: Card Presets',
  41: 'Main: Workshop Respec',
  80: 'Perks: Unlock Perks',
  81: 'Perks: Waves Required',
  82: 'Perks: Auto Pick Perks',
  83: 'Perks: Standard Perks Bonus',
  84: 'Perks: Perk Option Quantity',
  85: 'Perks: First Perk Choice',
  87: 'Perks: Ban Perks',
  88: 'Perks: Improve Trade-off Perks',
  151: 'Main: Reroll Daily Mission',
  153: 'Perks: Auto Pick Ranking',
  60: 'Ultimate: Golden Tower Bonus',
  61: 'Ultimate: Golden Tower Duration',
  62: 'Ultimate: Chain Lightning Shock',
  65: 'Ultimate: Death Wave Health',
  66: 'Ultimate: Death Wave Coin Bonus',
  94: 'Ultimate: Black Hole Damage',
  95: 'Ultimate: Extra Black Hole',
  96: 'Ultimate: Black Hole Coin Bonus',
  97: 'Ultimate: Spotlight Coin Bonus',
  190: 'Ultimate: Death Wave Cells Bonus',
  102: 'Bots: Flame Bot - Cooldown',
  103: 'Bots: Thunder Bot - Cooldown',
  104: 'Bots: Golden Bot - Cooldown',
  107: 'Bots: Flame Bot - Burn Stack',
  108: 'Bots: Golden Bot - Duration',
  109: 'Bots: Thunder Bot - Linger Time',
  124: 'Utility: Enemy Attack Level Skip',
  125: 'Utility: Enemy Health Level Skip',
  126: 'Defense: Wall Health',
  127: 'Defense: Wall Rebuild',
  128: 'Defense: Wall Regen',
  129: 'Defense: Wall Thorns',
  131: 'Attack: Max Rend Armor Multiplier',
  139: 'Modules: Reroll Shards',
  144: 'Defense: Wall Fortification',
  150: 'Attack: Light Speed Shots',
  193: 'Defense: Garlic Thorns',
}

/** Reconstructed from pre-2026-05-28 export (67 nonzero slots) */
function defaultPrevious(current) {
  const p = [...current]
  p[98] = 0
  p[139] = 27
  p[140] = 12
  p[143] = 0
  return p
}

function loadPrevious(current) {
  if (existsSync(SNAPSHOT_PATH)) {
    const j = JSON.parse(readFileSync(SNAPSHOT_PATH, 'utf-8'))
    if (Array.isArray(j.values) && j.values.length === 250) return j.values
  }
  return defaultPrevious(current)
}

const dump = JSON.parse(readFileSync(DUMP_PATH, 'utf-8'))
const next = dump.fields.researchLevel.values
const prev = loadPrevious(next)

const changes = []
for (let id = 0; id < 250; id++) {
  if (prev[id] !== next[id]) {
    changes.push({ id, prev: prev[id], cur: next[id], lab: LAB_BY_ID[id] })
  }
}

const prevNz = prev.filter((n) => n !== 0).length
const nextNz = next.filter((n) => n !== 0).length

console.log(`Decoded: ${dump.decodedAt}`)
console.log(`researchLevel nonzero: ${prevNz} → ${nextNz}`)
console.log(`Changed slots: ${changes.length}\n`)

const mapped = changes.filter((c) => c.lab)
const unmapped = changes.filter((c) => !c.lab)

if (mapped.length) {
  console.log('Mapped (affects TowerSmith import):')
  for (const c of mapped) {
    console.log(`  [${c.id}] ${c.lab}: ${c.prev} → ${c.cur}`)
  }
}

if (unmapped.length) {
  console.log('\nUnmapped (save changed; no import mapping yet):')
  for (const c of unmapped) {
    console.log(`  [${c.id}]: ${c.prev} → ${c.cur}`)
  }
}

writeFileSync(
  SNAPSHOT_PATH,
  JSON.stringify({ savedAt: dump.decodedAt, values: next }, null, 2),
  'utf-8',
)
console.log(`\nSaved current array to docs/player-save-research-level.previous.json`)
