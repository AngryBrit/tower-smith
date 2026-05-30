/**
 * Updates `src/data/wikiDataStamp.json` when wiki/game data is regenerated.
 * Import `touchWikiDataStamp` from gen/patch scripts after writing outputs.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
export const WIKI_DATA_STAMP_PATH = join(root, 'src/data/wikiDataStamp.json')

/** @typedef {{ alignedAt: string, scripts?: Record<string, string> }} WikiDataStamp */

/** @returns {WikiDataStamp} */
function readStamp() {
  try {
    const raw = JSON.parse(readFileSync(WIKI_DATA_STAMP_PATH, 'utf8'))
    if (typeof raw?.alignedAt === 'string' && raw.alignedAt.length > 0) {
      return {
        alignedAt: raw.alignedAt,
        scripts: typeof raw.scripts === 'object' && raw.scripts ? raw.scripts : {},
      }
    }
  } catch {
    /* first run */
  }
  return { alignedAt: new Date(0).toISOString(), scripts: {} }
}

/**
 * @param {string} scriptId basename without `.mjs`, e.g. `gen-workshop-ultimate-data`
 * @returns {string} ISO timestamp written
 */
export function touchWikiDataStamp(scriptId) {
  const now = new Date().toISOString()
  const stamp = readStamp()
  stamp.alignedAt = now
  stamp.scripts = { ...stamp.scripts, [scriptId]: now }
  writeFileSync(WIKI_DATA_STAMP_PATH, `${JSON.stringify(stamp, null, 2)}\n`, 'utf8')
  const day = now.slice(0, 10)
  console.log(
    `Wiki/game data aligned as of ${day} (wikiDataStamp.json — ${scriptId})`,
  )
  return now
}
