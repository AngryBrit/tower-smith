/**
 * Export full manifest lab ↔ game researchLevel[id] mapping as CSV.
 * Run: npx tsx scripts/export-game-research-id-map.mjs [output.csv]
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const out =
  process.argv[2] ??
  path.join(root, 'docs', 'game-research-id-map.csv')

const { GAME_MANIFEST_FLAT_TO_RESEARCH_ID } = await import(
  '../src/playerSave/gameResearchIndex.ts'
)

const SKIP_IMPORT_SLUGS = new Set(['card-mastery'])

const manifest = JSON.parse(
  readFileSync(path.join(root, 'public/research/manifest.json'), 'utf8'),
)

function csvEscape(s) {
  const t = String(s)
  if (/[",\n\r]/.test(t)) return `"${t.replace(/"/g, '""')}"`
  return t
}

const rows = [
  [
    'manifest_flat',
    'section_slug',
    'item_index',
    'lab_name',
    'game_research_id',
    'mapped',
    'import_from_research_level',
  ].join(','),
]

let flat = 0
for (const rel of manifest.sectionFiles) {
  const slug = rel.split('/').pop().replace(/\.json$/i, '')
  const section = JSON.parse(
    readFileSync(path.join(root, 'public', rel.replace(/^\//, '')), 'utf8'),
  )
  const skipImport = SKIP_IMPORT_SLUGS.has(slug)
  for (let ii = 0; ii < section.items.length; ii++) {
    const name = section.items[ii].name
    const id = GAME_MANIFEST_FLAT_TO_RESEARCH_ID[flat] ?? -1
    const mapped = id >= 0 ? 'yes' : 'no'
    const importable = mapped === 'yes' && !skipImport ? 'yes' : 'no'
    rows.push(
      [
        flat,
        slug,
        ii,
        csvEscape(name),
        id,
        mapped,
        importable,
      ].join(','),
    )
    flat++
  }
}

const dir = path.dirname(out)
if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
writeFileSync(out, rows.join('\n') + '\n', 'utf8')

const mapped = rows.length - 1 - [...GAME_MANIFEST_FLAT_TO_RESEARCH_ID].filter((x) => x < 0).length
console.log(`Wrote ${rows.length - 1} labs to ${out}`)
console.log(
  `Mapped: ${GAME_MANIFEST_FLAT_TO_RESEARCH_ID.filter((x) => x >= 0).length}/${GAME_MANIFEST_FLAT_TO_RESEARCH_ID.length}`,
)
