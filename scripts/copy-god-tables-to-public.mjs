/**
 * Copies authoritative `tables/workshop/` and `tables/labs/` JSON into
 * `public/tables/` with manifests for runtime fetch (keeps main bundle small).
 *
 * Run automatically via npm prebuild / dev, or manually:
 *   node scripts/copy-god-tables-to-public.mjs
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

/**
 * @param {string} srcSubdir e.g. `workshop` under `tables/`
 * @param {string} destSubdir e.g. `workshop` under `public/tables/`
 * @param {string[]} excludeBasenames JSON filenames to skip
 */
function publishGodTables(srcSubdir, destSubdir, excludeBasenames = []) {
  const srcBase = path.join(root, 'tables', srcSubdir)
  const destBase = path.join(root, 'public/tables', destSubdir)
  fs.rmSync(destBase, { recursive: true, force: true })

  /** @type {{ name: string; path: string }[]} */
  const files = []

  /** @param {string} dir @param {string} relPrefix */
  function walk(dir, relPrefix = '') {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const rel = relPrefix ? `${relPrefix}/${ent.name}` : ent.name
      const abs = path.join(dir, ent.name)
      if (ent.isDirectory()) {
        walk(abs, rel)
        continue
      }
      if (!ent.name.endsWith('.json') || excludeBasenames.includes(ent.name)) continue
      const doc = JSON.parse(fs.readFileSync(abs, 'utf8'))
      const dest = path.join(destBase, rel.replace(/\\/g, '/'))
      fs.mkdirSync(path.dirname(dest), { recursive: true })
      fs.copyFileSync(abs, dest)
      if (doc.name) {
        files.push({ name: doc.name, path: rel.replace(/\\/g, '/') })
      }
    }
  }

  if (!fs.existsSync(srcBase)) {
    throw new Error(`Missing GOD tables directory: ${srcBase}`)
  }
  walk(srcBase)
  files.sort((a, b) => a.name.localeCompare(b.name))

  fs.mkdirSync(destBase, { recursive: true })
  fs.writeFileSync(
    path.join(destBase, 'manifest.json'),
    `${JSON.stringify({ version: 1, files }, null, 2)}\n`,
  )
  return files.length
}

const workshopCount = publishGodTables('workshop', 'workshop')
const labCount = publishGodTables('labs', 'labs', ['lab-order.json'])
console.log(
  `Published ${workshopCount} workshop + ${labCount} lab GOD tables to public/tables/`,
)
