import { capitalizeRelicDisplayName } from './relicDisplayName'
import {
  workshopRelicsActiveBonusPercent,
  workshopRelicsDisplayedDamageBonusFraction,
  WORKSHOP_RELIC_DISPLAYED_DAMAGE_STAT_IDS,
} from './workshopRelicStats'
import relicRows from './workshopRelics.generated.json'

export const WORKSHOP_RELIC_RARITIES = ['rare', 'epic', 'legendary'] as const
export type WorkshopRelicRarity = (typeof WORKSHOP_RELIC_RARITIES)[number]

export const WORKSHOP_RELIC_UNLOCK_GROUPS = [
  'milestone',
  'tournament',
  'birthday',
  'event',
  'guild',
  'other',
] as const
export type WorkshopRelicUnlockGroup = (typeof WORKSHOP_RELIC_UNLOCK_GROUPS)[number]

export type WorkshopRelicDef = {
  order: number
  id: string
  name: string
  rarity: WorkshopRelicRarity
  description: string
  unlock: string
  unlockGroup: WorkshopRelicUnlockGroup
  /** Legacy catalog field; displayed-damage bonus is derived from the description via {@link workshopRelicsDamageBonusFraction}. */
  damagePercent: number
}

type RelicRowJson = Omit<WorkshopRelicDef, 'damagePercent'> & { damagePct: number }

const RELICS: WorkshopRelicDef[] = (relicRows as RelicRowJson[]).map((row) => ({
  order: row.order,
  id: row.id,
  name: capitalizeRelicDisplayName(row.name),
  rarity: row.rarity,
  description: row.description,
  unlock: row.unlock,
  unlockGroup: row.unlockGroup,
  damagePercent: row.damagePct,
}))

export const WORKSHOP_RELIC_ORDER: readonly string[] = RELICS.map((r) => r.id)

export const WORKSHOP_RELIC_COUNT = RELICS.length

const BY_ID = new Map<string, WorkshopRelicDef>(RELICS.map((r) => [r.id, r]))

export function workshopRelicDef(id: string): WorkshopRelicDef | undefined {
  return BY_ID.get(id)
}

export function workshopRelicsForUnlockGroup(
  group: WorkshopRelicUnlockGroup | 'all',
): readonly WorkshopRelicDef[] {
  if (group === 'all') return RELICS
  return RELICS.filter((r) => r.unlockGroup === group)
}

/** Group relics by rarity (Rare → Epic → Legendary), preserving wiki order within each tier. */
export function workshopRelicsGroupedByRarity(
  relics: readonly WorkshopRelicDef[],
): { rarity: WorkshopRelicRarity; relics: WorkshopRelicDef[] }[] {
  return WORKSHOP_RELIC_RARITIES.map((rarity) => ({
    rarity,
    relics: relics.filter((r) => r.rarity === rarity),
  })).filter((group) => group.relics.length > 0)
}

export function workshopRelicsDamageBonusPercent(ownedIds: ReadonlySet<string>): number {
  let sum = 0
  for (const statId of WORKSHOP_RELIC_DISPLAYED_DAMAGE_STAT_IDS) {
    sum += workshopRelicsActiveBonusPercent(ownedIds, statId)
  }
  return sum
}

export function workshopRelicsDamageBonusFraction(ownedIds: ReadonlySet<string>): number {
  return workshopRelicsDisplayedDamageBonusFraction(ownedIds)
}

export function sanitizeRelicOwnedIds(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  const seen = new Set<string>()
  const out: string[] = []
  for (const item of raw) {
    if (typeof item !== 'string') continue
    if (!BY_ID.has(item) || seen.has(item)) continue
    seen.add(item)
    out.push(item)
  }
  return out
}
