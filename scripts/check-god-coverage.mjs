import fs from 'fs'
import path from 'path'

const tower = JSON.parse(fs.readFileSync('src/data/tower-labs.json', 'utf8'))
const godKeys = new Set()
function collectGodNames(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) collectGodNames(p)
    else if (ent.name.endsWith('.json') && ent.name !== 'lab-order.json') {
      const doc = JSON.parse(fs.readFileSync(p, 'utf8'))
      if (doc.name) godKeys.add(doc.name)
    }
  }
}
collectGodNames('tables/labs')

const aliases = {}
for (const m of fs.readFileSync('src/labCosts.ts', 'utf8').matchAll(/'([^']+)': '([^']+)'/g)) {
  aliases[m[1]] = m[2]
}

function resolveGod(name) {
  let t = name.trim()
  const seen = new Set()
  while (t && !seen.has(t)) {
    seen.add(t)
    if (godKeys.has(t)) return t
    if (aliases[t]) {
      t = aliases[t]
      continue
    }
    break
  }
  return null
}

const jsonFiles = []
function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) walk(p)
    else if (ent.name.endsWith('.json') && ent.name !== 'lab-order.json') jsonFiles.push(p)
  }
}
walk('tables/labs')

const cards = []
for (const f of fs.readdirSync('public/research/sections')) {
  if (!f.endsWith('.json')) continue
  const j = JSON.parse(fs.readFileSync(path.join('public/research/sections', f), 'utf8'))
  for (const it of j.items ?? []) {
    if (it.name) cards.push(it.name)
  }
}
const unique = [...new Set(cards)].sort()
const noGod = unique.filter((n) => !resolveGod(n))

console.log('GOD JSON files:', jsonFiles.length)
console.log('LAB GOD tables registered:', godKeys.size)
console.log('tower-labs.json keys:', Object.keys(tower).length)
console.log('Research card names:', unique.length)
console.log('Cards with direct GOD key:', unique.length - noGod.length)
console.log('Cards still without GOD:', noGod.length)
for (const n of noGod) {
  const tl = tower[n] ?? tower[aliases[n]]
  console.log(`  - ${n} (${tl ? 'tower-labs fallback' : 'no ladder'})`)
}
