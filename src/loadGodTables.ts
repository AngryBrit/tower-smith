import { installLabGodTables, type LabGodTable } from './data/labGodTables'
import {
  installWorkshopGodTables,
  type WorkshopGodTable,
} from './data/workshopGodTables'
import { researchFetchInit, withResearchCacheBust } from './researchLoadCache'

type GodTablesManifest = {
  version: number
  files: { name: string; path: string }[]
}

async function loadManifest(
  baseUrl: string,
  kind: 'workshop' | 'labs',
): Promise<GodTablesManifest> {
  const url = withResearchCacheBust(`${baseUrl}tables/${kind}/manifest.json`)
  const res = await fetch(url, researchFetchInit())
  if (!res.ok) {
    throw new Error(`Failed to load ${kind} upgrade tables (${res.status})`)
  }
  return (await res.json()) as GodTablesManifest
}

async function loadTablesFromManifest<T extends { name: string }>(
  baseUrl: string,
  kind: 'workshop' | 'labs',
  manifest: GodTablesManifest,
): Promise<Record<string, T>> {
  const entries = await Promise.all(
    manifest.files.map(async ({ path: rel }) => {
      const url = withResearchCacheBust(`${baseUrl}tables/${kind}/${rel}`)
      const res = await fetch(url, researchFetchInit())
      if (!res.ok) {
        throw new Error(`Failed to load ${kind} table ${rel} (${res.status})`)
      }
      const table = (await res.json()) as T
      return [table.name, table] as const
    }),
  )
  return Object.fromEntries(entries)
}

export async function loadWorkshopGodTables(baseUrl: string): Promise<void> {
  const manifest = await loadManifest(baseUrl, 'workshop')
  const tables = await loadTablesFromManifest<WorkshopGodTable>(
    baseUrl,
    'workshop',
    manifest,
  )
  installWorkshopGodTables(tables)
}

export async function loadLabGodTables(baseUrl: string): Promise<void> {
  const manifest = await loadManifest(baseUrl, 'labs')
  const tables = await loadTablesFromManifest<LabGodTable>(baseUrl, 'labs', manifest)
  installLabGodTables(tables)
}

/** Fetch workshop + lab GOD tables from `public/tables/` into memory. */
export async function loadGodTables(baseUrl: string): Promise<void> {
  await Promise.all([loadWorkshopGodTables(baseUrl), loadLabGodTables(baseUrl)])
}
