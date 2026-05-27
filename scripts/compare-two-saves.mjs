import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'url'
import { gunzipSync } from 'node:zlib'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const SAVES = [
  ['You (playerInfo)', 'h:/The Tower/playerInfo.dat'],
  ['Fudgyrella', 'h:/The Tower/Fudgyrella.dat'],
]

const { decodePlayerInfoBytes } = await import('../src/playerSave/decodePlayerInfo.ts')

function loadLevels(p) {
  const raw = readFileSync(p)
  const bytes = raw[0] === 0x1f && raw[1] === 0x8b ? gunzipSync(raw) : raw
  return decodePlayerInfoBytes(bytes).researchLevel
}

const indexSrc = readFileSync(
  path.join(ROOT, 'src/playerSave/gameResearchIndex.ts'),
  'utf8',
)
const flatToId = []
const m = indexSrc.match(
  /export const GAME_MANIFEST_FLAT_TO_RESEARCH_ID[^[]*\[([\s\S]*?)\] as const/,
)
if (!m) throw new Error('parse GAME_MANIFEST_FLAT_TO_RESEARCH_ID failed')
for (const line of m[1].split('\n')) {
  const t = line.trim().replace(/,$/, '')
  if (t === '' || t.startsWith('//')) continue
  flatToId.push(Number(t))
}

const manifest = JSON.parse(
  readFileSync(path.join(ROOT, 'public/research/manifest.json'), 'utf8'),
)
const flat = []
for (const rel of manifest.sectionFiles) {
  const slug = rel.split('/').pop().replace(/\.json$/i, '')
  const section = JSON.parse(
    readFileSync(path.join(ROOT, 'public', rel.replace(/^\//, '')), 'utf8'),
  )
  for (const it of section.items) {
    flat.push({ slug, name: it.name, max: it.maxLevel })
  }
}

const levels = SAVES.map(([label, p]) => ({ label, lv: loadLevels(p) }))

console.log('Cross-save check for mapped labs (same id -> same lab name)\n')

const overMax = []
const bothNonzero = []

for (let fi = 0; fi < flat.length; fi++) {
  const id = flatToId[fi]
  if (id < 0) continue
  const lab = flat[fi]
  const a = levels[0].lv[id] ?? 0
  const b = levels[1].lv[id] ?? 0
  if (a > lab.max || b > lab.max) {
    overMax.push({
      name: lab.name,
      slug: lab.slug,
      id,
      max: lab.max,
      a,
      b,
    })
  }
  if (a > 0 && b > 0) {
    bothNonzero.push({ name: lab.name, slug: lab.slug, id, a, b })
  }
}

console.log(`Mapped labs: ${flatToId.filter((x) => x >= 0).length}`)
console.log(`Both players have level > 0: ${bothNonzero.length}`)
console.log(`Over manifest maxLevel (either save): ${overMax.length}\n`)

if (overMax.length) {
  console.log('Over-max (possible wrong mapping or stale manifest cap):')
  for (const r of overMax) {
    console.log(
      `  ${r.slug} / ${r.name} id=${r.id} max=${r.max} | ${levels[0].label}=${r.a} | ${levels[1].label}=${r.b}`,
    )
  }
}

console.log('\nMain labs side-by-side:')
const mainNames = flat
  .filter((x) => x.slug === 'main-research')
  .map((x) => x.name)
for (const name of mainNames.slice(0, 14)) {
  const fi = flat.findIndex((x) => x.name === name && x.slug === 'main-research')
  const id = flatToId[fi]
  if (id < 0) {
    console.log(`  ${name}: unmapped`)
    continue
  }
  console.log(
    `  ${name} id=${id}: ${levels[0].label}=${levels[0].lv[id]} ${levels[1].label}=${levels[1].lv[id]}`,
  )
}
