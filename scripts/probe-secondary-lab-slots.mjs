import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { gunzipSync } from 'node:zlib'

const SAMPLE = 'h:/The Tower/playerInfo.dat'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const manifest = JSON.parse(readFileSync(path.join(ROOT, 'public/research/manifest.json'), 'utf8'))

const manifestFlat = []
for (const rel of manifest.sectionFiles) {
  const slug = rel.split('/').pop().replace(/\.json$/i, '')
  const section = JSON.parse(readFileSync(path.join(ROOT, 'public', rel.replace(/^\//, '')), 'utf8'))
  for (let ii = 0; ii < section.items.length; ii++) {
    const item = section.items[ii]
    manifestFlat.push({
      slug,
      itemIndex: ii,
      name: item.name,
      max: item.maxLevel,
      flatIndex: manifestFlat.length,
    })
  }
}

const { decodePlayerInfoBytes } = await import('../src/playerSave/decodePlayerInfo.ts')
const raw = readFileSync(SAMPLE)
const bytes = raw[0] === 0x1f && raw[1] === 0x8b ? gunzipSync(raw) : raw
const saveLevels = decodePlayerInfoBytes(bytes).researchLevel

const TARGETS = [
  ['Golden Tower Duration', 10],
  ['Death Wave Health', 17],
  ['Death Wave Coin Bonus', 20],
  ['Double Death Ray', 9],
  ['Unlock Perks', 1],
  ['Waves Required', 19],
  ['Standard Perks Bonus', 17],
  ['Ban Perks', 4],
  ['Improve Trade-off Perks', 10],
  ['Auto Pick Ranking', 5],
]

function idsWithLevel(req) {
  const ids = []
  for (let id = 0; id < saveLevels.length; id++) {
    if ((saveLevels[id] ?? 0) === req) ids.push(id)
  }
  return ids
}

for (const [name, req] of TARGETS) {
  const matches = manifestFlat.filter((m) => m.name === name)
  if (matches.length === 0) {
    console.log(`${name}: not found in manifest`)
    continue
  }
  if (matches.length > 1) {
    console.log(`${name}: found ${matches.length} manifest entries; using first`)
  }
  const m = matches[0]
  const ids = idsWithLevel(req)
  const withinMax = ids.filter((id) => req <= m.max)
  console.log(
    `${m.slug}/${m.name} flat=${m.flatIndex} manifestMax=${m.max} req=${req} ` +
      `saveIdsWithReqLevel=${ids.length} sample=[${ids.slice(0, 12).join(',')}]`,
  )
  if (ids.length === 0) {
    console.log(`  -> No save slots have researchLevel[id] == ${req}`)
  }
}

