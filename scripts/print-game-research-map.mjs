/**
 * Print game researchLevel[id] → TowerSmith lab name.
 * Run: npx tsx scripts/print-game-research-map.mjs
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  GAME_MANIFEST_FLAT_TO_RESEARCH_ID,
  GAME_RESEARCH_ID_TO_MANIFEST_FLAT,
} from '../src/playerSave/gameResearchIndex.ts'

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const manifestRaw = JSON.parse(readFileSync(join(root, 'public/research/manifest.json'), 'utf-8'))

const sections = manifestRaw.sectionFiles.map((rel) => {
  const path = join(root, 'public', rel.replace(/^\//, ''))
  const raw = JSON.parse(readFileSync(path, 'utf-8'))
  const slug = rel.split('/').pop().replace(/\.json$/i, '')
  return { slug, title: raw.title ?? slug, items: raw.items ?? [] }
})

const flatLabs = []
let flat = 0
for (let si = 0; si < sections.length; si++) {
  const sec = sections[si]
  for (let ii = 0; ii < sec.items.length; ii++) {
    flatLabs.push({
      flat,
      sectionIndex: si,
      itemIndex: ii,
      sectionSlug: sec.slug,
      sectionTitle: sec.title,
      name: sec.items[ii].name,
      gameId: GAME_MANIFEST_FLAT_TO_RESEARCH_ID[flat],
      overrideKey: `${si}-${ii}`,
    })
    flat++
  }
}

const byGameId = []
for (let id = 0; id < GAME_RESEARCH_ID_TO_MANIFEST_FLAT.length; id++) {
  const fi = GAME_RESEARCH_ID_TO_MANIFEST_FLAT[id]
  if (fi < 0) continue
  const lab = flatLabs[fi]
  if (!lab) continue
  byGameId.push({ gameId: id, ...lab })
}
byGameId.sort((a, b) => a.gameId - b.gameId)

console.log(`Mapped labs: ${byGameId.length} (save uses researchLevel[0..249])\n`)
console.log('Game ID | Override | Section              | Lab name')
console.log('--------|----------|----------------------|------------------')
for (const r of byGameId) {
  const sec = r.sectionSlug.padEnd(20).slice(0, 20)
  console.log(
    String(r.gameId).padStart(7) +
      ' | ' +
      r.overrideKey.padEnd(8) +
      ' | ' +
      sec +
      ' | ' +
      r.name,
  )
}

const unmapped = flatLabs.filter((l) => l.gameId < 0)
console.log(`\nTowerSmith labs without a game ID (${unmapped.length}):`)
for (const l of unmapped) {
  console.log(`  ${l.overrideKey}  ${l.sectionSlug}  ${l.name}`)
}
