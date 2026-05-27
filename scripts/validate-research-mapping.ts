/**
 * Validate gameResearchIndex mapping against a player save.
 * Usage: npx tsx scripts/validate-research-mapping.ts [path-to-.dat]
 */

import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { gunzipSync } from 'node:zlib'
import { decodePlayerInfoBytes } from '../src/playerSave/decodePlayerInfo'
import {
  GAME_MANIFEST_FLAT_TO_RESEARCH_ID,
  GAME_RESEARCH_ID_TO_MANIFEST_FLAT,
} from '../src/playerSave/gameResearchIndex'
import { parseResearchManifest, parseResearchSection } from '../src/types/research'
import { researchLevelsToOverrides } from '../src/playerSave/mapPlayerDataToTower'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const SAVE =
  process.argv[2] ?? process.env.PLAYER_SAVE ?? 'h:/The Tower/playerInfo.dat'

const manifestRaw: unknown = JSON.parse(
  readFileSync(path.join(root, 'public/research/manifest.json'), 'utf8'),
)
const { sectionFiles } = parseResearchManifest(manifestRaw)
const sections = sectionFiles.map((rel: string) => {
  const raw: unknown = JSON.parse(
    readFileSync(path.join(root, 'public', rel.replace(/^\//, '')), 'utf8'),
  )
  const slug = rel.split('/').pop()!.replace(/\.json$/i, '')
  return parseResearchSection(raw, slug)
})

const manifestFlat: { slug: string; itemIndex: number; name: string; max: number }[] =
  []
for (const sec of sections) {
  for (let ii = 0; ii < sec.items.length; ii++) {
    manifestFlat.push({
      slug: sec.sectionSlug ?? '',
      itemIndex: ii,
      name: sec.items[ii]!.name,
      max: sec.items[ii]!.maxLevel ?? 99,
    })
  }
}

if (!existsSync(SAVE)) {
  console.error('Save not found:', SAVE)
  process.exit(1)
}

const raw = readFileSync(SAVE)
const bytes = raw[0] === 0x1f && raw[1] === 0x8b ? gunzipSync(raw) : raw
const save = decodePlayerInfoBytes(bytes)
const levels = save.researchLevel
const data = { sections }
const overrides = researchLevelsToOverrides(data, levels)

console.log('Save:', SAVE)
console.log('researchLevel length:', levels.length)
console.log('nonzero slots:', levels.filter((lv) => lv > 0).length)
console.log('')

let mappedLabs = 0
let importableLabs = 0
const bySection = new Map<
  string,
  { mapped: number; importable: number; nonzero: { name: string; id: number; lv: number }[] }
>()

for (let fi = 0; fi < manifestFlat.length; fi++) {
  const m = manifestFlat[fi]!
  const id = GAME_MANIFEST_FLAT_TO_RESEARCH_ID[fi]!
  if (id < 0) continue
  mappedLabs++
  const lv = levels[id] ?? 0
  if (lv > 0) importableLabs++
  const key = m.slug
  if (!bySection.has(key)) {
    bySection.set(key, { mapped: 0, importable: 0, nonzero: [] })
  }
  const s = bySection.get(key)!
  s.mapped++
  if (lv > 0) {
    s.importable++
    s.nonzero.push({ name: m.name, id, lv })
  }
}

console.log(`Mapped labs: ${mappedLabs}/${manifestFlat.length}`)
console.log(`Would import (level > 0): ${importableLabs}`)
console.log(`Override keys: ${Object.keys(overrides).length}`)
console.log('')
console.log('By section:')
for (const [slug, s] of [...bySection.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  console.log(`  ${slug}: ${s.importable}/${s.mapped} importable`)
}

let reverseOk = 0
let reverseBad = 0
const badReverse: { id: number; fi: number; lv: number; name?: string; max?: number; reason: string }[] =
  []
for (let id = 0; id < levels.length; id++) {
  const fi = GAME_RESEARCH_ID_TO_MANIFEST_FLAT[id]!
  if (fi < 0) continue
  const lv = levels[id] ?? 0
  if (lv <= 0) continue
  const m = manifestFlat[fi]
  if (!m) {
    reverseBad++
    badReverse.push({ id, fi, lv, reason: 'invalid flat' })
    continue
  }
  if (lv > m.max) {
    reverseBad++
    badReverse.push({ id, fi, lv, name: m.name, max: m.max, reason: 'over max' })
    continue
  }
  reverseOk++
}

console.log('')
console.log(`Reverse (nonzero id -> manifest): ${reverseOk} ok, ${reverseBad} over-max/invalid`)
if (badReverse.length > 0) {
  console.log('Issues:')
  for (const b of badReverse.slice(0, 15)) {
    console.log(' ', b)
  }
}

console.log('')
console.log('Sample high-level imports:')
for (const [slug, s] of [...bySection.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  const top = [...s.nonzero].sort((a, b) => b.lv - a.lv).slice(0, 5)
  if (top.length === 0) continue
  console.log(`  ${slug}:`)
  for (const t of top) {
    console.log(`    ${t.name} id=${t.id} lv=${t.lv}`)
  }
}
