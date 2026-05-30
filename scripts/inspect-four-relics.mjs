import { readFileSync } from 'node:fs'

const src = readFileSync('src/playerSave/gameRelicMapping.ts', 'utf8')
const m = src.match(/GAME_RELIC_INDEX_TO_WORKSHOP_ID[^[]*\[([\s\S]*?)\]\s*as const/s)
const ids = [...m[1].matchAll(/"([^"]+)"|null/g)].map((x) => x[1] ?? null)
const dump = JSON.parse(readFileSync('docs/player-save-field-dump.json', 'utf8'))
const items = dump.fields.relicsUnlocked.items

const viralOutbreakIds = [
  'bacteriophage',
  'rabies',
  'neuron',
  'ebola',
  'viral_infection',
  'immunization',
  'personal_care',
  'global_threat',
]

const targets = [
  { name: 'Neuron', index: 29 },
  { name: 'Viral Infection', index: 264 },
  { name: 'Personal Care', index: 265 },
  { name: 'Immunization (neighbor)', index: 266 },
  { name: 'Global Threat', index: 267 },
]

console.log('=== Viral Outbreak set (all 8) ===')
for (const id of viralOutbreakIds) {
  const index = ids.indexOf(id)
  const state = items[index]?.value?.value__
  console.log(`${id.padEnd(18)} index ${String(index).padStart(3)}  state=${state}`)
}
console.log('')

console.log('=== relicsUnlocked (Relics+RelicState) ===')
for (const t of targets) {
  const state = items[t.index]?.value?.value__
  console.log(`${t.name.padEnd(24)} index ${String(t.index).padStart(3)}  workshop=${ids[t.index] ?? 'null'}  state=${state}`)
}

console.log('\n=== profileRelics (equipped showcase, not ownership) ===')
for (const i of dump.fields.profileRelics.values) {
  const state = items[i]?.value?.value__
  console.log(`  index ${i}  ${ids[i]}  relicsUnlocked=${state}`)
}

const stateCounts = {}
for (const it of items) {
  const v = it.value?.value__
  stateCounts[v] = (stateCounts[v] ?? 0) + 1
}
console.log('\n=== relicsUnlocked state distribution ===')
console.log(stateCounts)
console.log('(0=locked, 2=unlocked per import; 189 unlocked in this save)')
