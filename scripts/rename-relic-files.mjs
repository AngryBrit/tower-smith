/**
 * Replace spaces with underscores in `public/relics/**/*.webp` filenames
 * and sync `workshopRelicImages.generated.json`.
 */
import { readFileSync, writeFileSync, readdirSync, renameSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const relicsDir = join(root, 'public/relics')
const mapPath = join(root, 'src/data/workshopRelicImages.generated.json')

function toUnderscoreFilename(name) {
  return name.replace(/ /g, '_')
}

const renames = []
for (const sub of readdirSync(relicsDir, { withFileTypes: true })) {
  if (!sub.isDirectory()) continue
  const dir = join(relicsDir, sub.name)
  for (const name of readdirSync(dir)) {
    if (!name.endsWith('.webp') || !name.includes(' ')) continue
    const next = toUnderscoreFilename(name)
    if (next === name) continue
    renameSync(join(dir, name), join(dir, next))
    renames.push({ from: `${sub.name}/${name}`, to: `${sub.name}/${next}` })
  }
}

/** @type {Record<string, string>} */
const map = JSON.parse(readFileSync(mapPath, 'utf8'))
let mapUpdates = 0
for (const [id, rel] of Object.entries(map)) {
  const decoded = decodeURIComponent(rel)
  const slash = decoded.lastIndexOf('/')
  const prefix = slash >= 0 ? decoded.slice(0, slash + 1) : ''
  const base = slash >= 0 ? decoded.slice(slash + 1) : decoded
  const nextBase = toUnderscoreFilename(base)
  const next = prefix + nextBase
  if (next !== rel) {
    map[id] = next
    mapUpdates++
  }
}

writeFileSync(mapPath, `${JSON.stringify(map, null, 2)}\n`)

console.log(`Renamed ${renames.length} file(s).`)
console.log(`Updated ${mapUpdates} path(s) in workshopRelicImages.generated.json.`)
