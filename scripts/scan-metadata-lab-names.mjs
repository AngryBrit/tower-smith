import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const meta = readFileSync('h:/The Tower/global-metadata.dat')

const manifest = JSON.parse(
  readFileSync(path.join(root, 'public/research/manifest.json'), 'utf8'),
)
const names = []
for (const rel of manifest.sectionFiles) {
  const section = JSON.parse(readFileSync(path.join(root, 'public', rel), 'utf8'))
  for (const item of section.items) names.push(item.name)
}

function findOffset(needle) {
  const buf = Buffer.from(needle, 'utf8')
  for (let i = 0; i <= meta.length - buf.length; i++) {
    let ok = true
    for (let j = 0; j < buf.length; j++) {
      if (meta[i + j] !== buf[j]) {
        ok = false
        break
      }
    }
    if (ok) return i
  }
  return -1
}

const hits = []
for (const name of names) {
  const off = findOffset(name)
  if (off >= 0) hits.push({ name, off })
}
hits.sort((a, b) => a.off - b.off)

console.log('found', hits.length, '/', names.length)
console.log('first 25 by metadata offset:')
for (const h of hits.slice(0, 25)) console.log(h.off, h.name)
console.log('...')
const gs = hits.find((h) => h.name === 'Game Speed')
const dmg = hits.find((h) => h.name === 'Damage')
console.log('Game Speed rank', hits.indexOf(gs), 'offset', gs?.off)
console.log('Damage rank', hits.indexOf(dmg), 'offset', dmg?.off)
