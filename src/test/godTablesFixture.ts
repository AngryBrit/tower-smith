import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  installLabGodTables,
  type LabGodTable,
} from '../data/labGodTables'
import {
  installWorkshopGodTables,
  type WorkshopGodTable,
} from '../data/workshopGodTables'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')

function loadJsonTablesFromDir<T extends { name: string }>(
  baseDir: string,
  excludeBasenames: string[] = [],
): Record<string, T> {
  const tables: Record<string, T> = {}

  function walk(dir: string): void {
    for (const ent of readdirSync(dir, { withFileTypes: true })) {
      const abs = join(dir, ent.name)
      if (ent.isDirectory()) {
        if (ent.name === 'formulas') continue
        walk(abs)
        continue
      }
      if (!ent.name.endsWith('.json') || excludeBasenames.includes(ent.name)) continue
      const doc = JSON.parse(readFileSync(abs, 'utf-8')) as T
      if (doc.name) tables[doc.name] = doc
    }
  }

  walk(baseDir)
  return tables
}

let loaded = false

/** Loads authoritative GOD tables from `tables/` for unit tests (no fetch). */
export function loadGodTablesFixture(): void {
  if (loaded) return
  installWorkshopGodTables(
    loadJsonTablesFromDir<WorkshopGodTable>(join(root, 'tables/workshop')),
  )
  installLabGodTables(
    loadJsonTablesFromDir<LabGodTable>(join(root, 'tables/labs'), ['lab-order.json']),
  )
  loaded = true
}
