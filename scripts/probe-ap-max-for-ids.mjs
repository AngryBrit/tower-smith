import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const AUTOPLAYER =
  'h:/The Tower/Dump/Assembly-CSharp/AutoplayerProfile.cs'

const apMax = new Map()
const lines = readFileSync(AUTOPLAYER, 'utf8').split(/\r?\n/)
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(/researchLevel(\d+)/)
  if (!m) continue
  let max = null
  for (let j = i - 1; j >= Math.max(0, i - 3); j--) {
    const r = lines[j].match(/Range\(0f,\s*(\d+(?:\.\d+)?)f\)/)
    if (r) {
      max = Number(r[1])
      break
    }
  }
  if (max != null) apMax.set(Number(m[1]), max)
}

function apMatchesManifest(ap, manifestMax) {
  if (ap == null) return true
  return ap === manifestMax || ap === manifestMax + 1
}

const manifest = JSON.parse(
  readFileSync(
    path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      '../public/research/manifest.json',
    ),
    'utf8',
  ),
)

const manifestByNameAndSlug = new Map()
for (const rel of manifest.sectionFiles) {
  const slug = rel.split('/').pop().replace(/\.json$/i, '')
  const section = JSON.parse(
    readFileSync(
      path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', rel.replace(/^\//, '')),
      'utf8',
    ),
  )
  for (const it of section.items) {
    manifestByNameAndSlug.set(`${slug}::${it.name}`, it.maxLevel)
  }
}

const CHECKS = [
  {
    slug: 'ultimate-weapon-research',
    name: 'Golden Tower Duration',
    ids: [61, 88, 94, 193],
  },
  { slug: 'ultimate-weapon-research', name: 'Death Wave Health', ids: [65, 83] },
  {
    slug: 'ultimate-weapon-research',
    name: 'Death Wave Coin Bonus',
    ids: [14, 66, 96, 97, 190],
  },
  { slug: 'cards-research', name: 'Double Death Ray', ids: [71, 134] },
  {
    slug: 'perks-research',
    name: 'Unlock Perks',
    ids: [26, 38, 39, 40, 41, 62, 72, 80, 82, 85, 95, 132],
  },
]

for (const { slug, name, ids } of CHECKS) {
  const manifestMax = manifestByNameAndSlug.get(`${slug}::${name}`)
  console.log(`-- ${slug}/${name} manifestMax=${manifestMax} --`)
  for (const id of ids) {
    const ap = apMax.get(id)
    const ok = apMatchesManifest(ap, Number(manifestMax))
    console.log(`id=${id} apMax=${ap ?? 'null'} matches=${ok}`)
  }
}

