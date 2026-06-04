/**
 * Ensures every research card name has its own GOD JSON (no shared-ladder aliases).
 * Copies ladder data from alias target or existing same-ladder file; writes new JSON + manifest.
 *
 * Run: node scripts/ensure-all-lab-god-json.mjs
 * Then: node scripts/sync-lab-god-tables-from-manifest.mjs
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function readAliases() {
  const text = fs.readFileSync(path.join(root, 'src/labCosts.ts'), 'utf8')
  const aliases = {}
  for (const m of text.matchAll(/^\s+'([^']+)': '([^']+)',/gm)) {
    aliases[m[1].replace(/\\'/g, "'")] = m[2].replace(/\\'/g, "'")
  }
  return aliases
}

function readResearchCards() {
  const cards = []
  const dir = path.join(root, 'public/research/sections')
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.json')) continue
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))
    for (const it of j.items ?? []) {
      if (it.name) cards.push(it.name.trim())
    }
  }
  return [...new Set(cards)].sort()
}

/** @type {Map<string, string>} display name -> relative path tables/labs/... */
function indexGodJsonByName() {
  const byName = new Map()
  function walk(dir) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, ent.name)
      if (ent.isDirectory()) walk(p)
      else if (ent.name.endsWith('.json') && ent.name !== 'lab-order.json') {
        const doc = JSON.parse(fs.readFileSync(p, 'utf8'))
        if (doc.name) {
          const rel = path.relative(path.join(root, 'tables/labs'), p).replace(/\\/g, '/')
          byName.set(doc.name, rel)
        }
      }
    }
  }
  walk(path.join(root, 'tables/labs'))
  return byName
}

function resolveSourceName(name, aliases, byName, seen = new Set()) {
  let t = name
  while (t && !seen.has(t)) {
    seen.add(t)
    if (byName.has(t)) return t
    if (aliases[t]) {
      t = aliases[t]
      continue
    }
    break
  }
  return byName.has(t) ? t : null
}

function inferCategory(relPath) {
  const top = relPath.split('/')[0]
  return top
}

const aliases = readAliases()
const cards = readResearchCards()
const byName = indexGodJsonByName()

const created = []
const manifest = {}

for (const card of cards) {
  if (byName.has(card)) {
    manifest[card] = byName.get(card)
    continue
  }

  const sourceName = resolveSourceName(card, aliases, byName)
  if (!sourceName) {
    console.warn('SKIP (no source GOD):', card)
    continue
  }

  const sourceRel = byName.get(sourceName)
  const sourceDoc = JSON.parse(
    fs.readFileSync(path.join(root, 'tables/labs', sourceRel), 'utf8'),
  )
  const category = inferCategory(sourceRel)
  const outRel = `${category}/${slugify(card)}.json`
  const outPath = path.join(root, 'tables/labs', outRel)

  const doc = {
    ...sourceDoc,
    name: card,
    levels: sourceDoc.levels.map((row) => ({ ...row })),
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
  byName.set(card, outRel)
  manifest[card] = outRel
  created.push({ card, from: sourceName, outRel })
  console.log('Created', outRel, '<-', sourceName)
}

fs.writeFileSync(
  path.join(root, 'scripts/data/lab-god-manifest.json'),
  JSON.stringify({ generatedAt: new Date().toISOString(), manifest, created }, null, 2) + '\n',
)

console.log(`\nDone: ${created.length} new files, ${cards.length} cards indexed`)
