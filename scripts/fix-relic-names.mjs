/**
 * Title-case relic display names (first letter of each word capitalized).
 */
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const catalogPath = join(root, 'src/data/workshopRelics.generated.json')

/** @param {string} word */
function capitalizeWord(word) {
  if (/^\d+(?:st|nd|rd|th)$/i.test(word)) return word.toLowerCase()
  if (/^T:[IVXLC]+$/i.test(word)) return word.toUpperCase()
  if (/^[A-Z]{2,}$/.test(word) && !/[a-z]/.test(word)) return word

  return word.replace(
    /^([^A-Za-z]*)([A-Za-z])([A-Za-z']*)(.*)$/,
    (_, pre, first, mid, post) => pre + first.toUpperCase() + mid.toLowerCase() + post,
  )
}

/** @param {string} name */
export function capitalizeRelicDisplayName(name) {
  return name.split(' ').map(capitalizeWord).join(' ')
}

/** @type {Array<{name:string}>} */
const relics = JSON.parse(readFileSync(catalogPath, 'utf8'))
const changes = []

for (const relic of relics) {
  const next = capitalizeRelicDisplayName(relic.name)
  if (next !== relic.name) {
    changes.push({ from: relic.name, to: next })
    relic.name = next
  }
}

if (changes.length > 0) {
  writeFileSync(catalogPath, `${JSON.stringify(relics, null, 2)}\n`)
}

console.log(`Updated ${changes.length} relic name(s).`)
for (const c of changes) console.log(`  ${JSON.stringify(c.from)} → ${JSON.stringify(c.to)}`)
