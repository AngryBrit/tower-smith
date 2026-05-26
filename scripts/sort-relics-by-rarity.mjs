/**
 * Move `public/relics/*.webp` into rarity subfolders and update
 * `workshopRelicImages.generated.json` paths (e.g. `rare/relic_Flux_1.webp`).
 */
import {
  readFileSync,
  writeFileSync,
  readdirSync,
  renameSync,
  mkdirSync,
  existsSync,
} from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const relicsDir = join(root, 'public/relics')
const catalogPath = join(root, 'src/data/workshopRelics.generated.json')
const mapPath = join(root, 'src/data/workshopRelicImages.generated.json')

const RARITIES = ['rare', 'epic', 'legendary']

/** @type {Record<string, string>} */
const map = JSON.parse(readFileSync(mapPath, 'utf8'))
/** @type {Array<{id:string,rarity:string}>} */
const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'))

const idToRarity = new Map(catalog.map((r) => [r.id, r.rarity]))

/** basename -> rarity (first catalog entry wins on conflict) */
const fileToRarity = new Map()
for (const [id, file] of Object.entries(map)) {
  const rarity = idToRarity.get(id)
  if (!rarity) continue
  if (!fileToRarity.has(file)) fileToRarity.set(file, rarity)
}

function inferUnmappedRarity(name) {
  const lower = name.toLowerCase()
  if (lower.includes('framerare') || lower.startsWith('rare_')) return 'rare'
  if (lower.includes('frameepic') || lower.startsWith('epic_')) return 'epic'
  if (lower.includes('framelegendary')) return 'legendary'
  return 'unmapped'
}

for (const rarity of [...RARITIES, 'unmapped']) {
  const dir = join(relicsDir, rarity)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
}

const moved = []
const missing = []

function moveFile(basename, rarity) {
  const from = join(relicsDir, basename)
  const to = join(relicsDir, rarity, basename)
  if (existsSync(to)) return
  if (!existsSync(from)) {
    if (!existsSync(to)) missing.push({ basename, rarity })
    return
  }
  renameSync(from, to)
  moved.push({ basename, rarity })
}

for (const [basename, rarity] of fileToRarity) {
  moveFile(basename, rarity)
}

const rootFiles = readdirSync(relicsDir).filter((f) => f.endsWith('.webp'))
for (const basename of rootFiles) {
  const rarity = inferUnmappedRarity(basename)
  moveFile(basename, rarity)
}

/** @type {Record<string, string>} */
const nextMap = {}
for (const [id, file] of Object.entries(map)) {
  const rarity = idToRarity.get(id)
  if (!rarity) {
    nextMap[id] = file
    continue
  }
  const base = file.includes('/') ? file.split('/').pop() : file
  nextMap[id] = `${rarity}/${base}`
}

writeFileSync(mapPath, `${JSON.stringify(nextMap, null, 2)}\n`)

console.log(`Moved ${moved.length} file(s) into rarity folders.`)
if (missing.length) {
  console.log(`Missing (${missing.length}):`)
  for (const m of missing) console.log(`  ${m.basename} → ${m.rarity}`)
}

const counts = Object.fromEntries(
  [...RARITIES, 'unmapped'].map((r) => [
    r,
    readdirSync(join(relicsDir, r)).filter((f) => f.endsWith('.webp')).length,
  ]),
)
console.log('Folder counts:', counts)
