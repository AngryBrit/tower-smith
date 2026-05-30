import { readFileSync } from 'node:fs'

const dump = JSON.parse(readFileSync('docs/player-save-field-dump.json', 'utf8'))
const src = readFileSync('src/playerSave/gameRelicMapping.ts', 'utf8')
const m = src.match(/GAME_RELIC_INDEX_TO_WORKSHOP_ID[^[]*\[([\s\S]*?)\]\s*as const/s)
const gameIds = [...m[1].matchAll(/"([^"]+)"|null/g)].map((x) => x[1] ?? null)
const items = dump.fields.relicsUnlocked.items
const owned = new Set()
for (const it of items) {
  if (it.value?.value__ !== 2) continue
  const id = gameIds[it.index]
  if (id) owned.add(id)
}

function row(id) {
  const i = gameIds.indexOf(id)
  return { index: i, state: items[i]?.value?.value__, owned: owned.has(id) }
}

for (const id of [
  'neuron',
  'viral_infection',
  'spirit_wolf',
  'bacteriophage',
  't_xi_resonance',
  'personal_care',
  'global_threat',
  'ionized_plasma',
  'comet',
  'champagne',
]) {
  console.log(id, row(id))
}
console.log('owned count', owned.size)
