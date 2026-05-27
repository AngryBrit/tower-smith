import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'

const { decodePlayerInfoBytes } = await import('../src/playerSave/decodePlayerInfo.ts')
const raw = readFileSync('h:/The Tower/playerInfo.dat')
const bytes = raw[0] === 0x1f && raw[1] === 0x8b ? gunzipSync(raw) : raw
const save = decodePlayerInfoBytes(bytes)

const mf = JSON.parse(readFileSync('public/research/manifest.json', 'utf8'))
const sections = []
for (const rel of mf.sectionFiles) {
  const sec = JSON.parse(readFileSync(`public/${rel}`, 'utf8'))
  sections.push({ title: sec.title, items: sec.items.map((i) => i.name) })
}

// print non-zero by id ranges
const nz = save.researchLevel.map((lv, id) => ({ id, lv })).filter((x) => x.lv > 0)
console.log('nonzero count', nz.length)
for (const x of nz) console.log(x.id, x.lv)
