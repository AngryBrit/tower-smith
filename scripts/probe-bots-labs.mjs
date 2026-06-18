/**
 * Probe bot lab ↔ researchLevel[id] candidates from sample save.
 * Run: npx tsx scripts/probe-bots-labs.mjs
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { gunzipSync } from 'node:zlib'
import { decodePlayerInfoBytes } from '../src/playerSave/decodePlayerInfo.ts'
import { GAME_MANIFEST_FLAT_TO_RESEARCH_ID } from '../src/playerSave/gameResearchIndex.ts'

const SAMPLE = process.env.PLAYER_SAVE ?? 'h:/The Tower/SaveGames/playerInfo.dat'
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

const raw = readFileSync(SAMPLE)
const bytes = raw[0] === 0x1f && raw[1] === 0x8b ? gunzipSync(raw) : raw
const levels = decodePlayerInfoBytes(bytes).researchLevel
const usedIds = new Set(GAME_MANIFEST_FLAT_TO_RESEARCH_ID.filter((id) => id >= 0))

const manifest = JSON.parse(readFileSync(path.join(root, 'public/research/manifest.json'), 'utf8'))
const rows = []
let flat = 0
for (const rel of manifest.sectionFiles) {
  const slug = rel.split('/').pop().replace(/\.json$/i, '')
  const section = JSON.parse(readFileSync(path.join(root, 'public', rel.replace(/^\//, '')), 'utf8'))
  for (let ii = 0; ii < section.items.length; ii++) {
    const item = section.items[ii]
    const id = GAME_MANIFEST_FLAT_TO_RESEARCH_ID[flat] ?? -1
    rows.push({
      flat,
      slug,
      ii,
      name: item.name,
      max: item.maxLevel,
      id,
      saveLv: id >= 0 ? levels[id] : null,
    })
    flat++
  }
}

console.log('=== BOTS section ===')
for (const r of rows.filter((x) => x.slug === 'bots')) {
  const cands = []
  for (let id = 0; id < levels.length; id++) {
    const lv = levels[id] ?? 0
    if (lv > r.max) continue
    if (usedIds.has(id)) continue
    if (lv > 0) cands.push({ id, lv })
  }
  console.log(
    `${r.ii} ${r.name} flat=${r.flat} max=${r.max}` +
      (r.id >= 0 ? ` mapped id=${r.id} lv=${r.saveLv}` : ''),
  )
  if (r.id < 0) {
    const lv2 = cands.filter((c) => c.lv === 2)
    if (lv2.length) console.log(`  unmapped save ids with lv=2: ${lv2.map((c) => c.id).join(', ')}`)
    const pos = cands.filter((c) => c.lv > 0).slice(0, 8)
    if (pos.length) console.log(`  unmapped positive: ${pos.map((c) => `${c.id}@${c.lv}`).join(', ')}`)
  }
}

console.log('\n=== save ids with level 2 ===')
for (let id = 0; id < levels.length; id++) {
  if (levels[id] !== 2) continue
  const mapped = rows.find((r) => r.id === id)
  console.log(
    `id ${id}` +
      (mapped ? ` -> flat ${mapped.flat} ${mapped.slug}/${mapped.name}` : ' UNMAPPED'),
  )
}
