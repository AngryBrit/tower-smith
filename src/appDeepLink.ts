import { WORKSHOP_ENHANCE_ATTACK_UPGRADE_ORDER } from './data/workshopEnhanceAttack'
import { WORKSHOP_ENHANCE_DEFENSE_UPGRADE_ORDER } from './data/workshopEnhanceDefense'
import { WORKSHOP_ENHANCE_UTILITY_UPGRADE_ORDER } from './data/workshopEnhanceUtility'
import { WORKSHOP_DEFENSE_UPGRADE_ORDER } from './data/workshopDefense'
import { WORKSHOP_UTILITY_UPGRADE_ORDER } from './data/workshopUtility'
import {
  WORKSHOP_ULTIMATE_WEAPON_ORDER,
  type WorkshopUltimateWeaponId,
} from './data/workshopUltimate'
import { workshopRelicDef } from './data/workshopRelics'
import { LAB_DEEP_LINK_QUERY_PARAM } from './labSlug'
import type { WorkshopCategoryPersisted } from './labPresetsStorage'

/** Query param for relic deep links, e.g. `?relic=t_i_flux` */
export const RELIC_DEEP_LINK_QUERY_PARAM = 'relic'

/** Query param for workshop deep links, e.g. `?workshop=damageLevel` */
export const WORKSHOP_DEEP_LINK_QUERY_PARAM = 'workshop'

const RELIC_HASH_PREFIX = 'relic-'
const WORKSHOP_HASH_PREFIX = 'workshop-'

const WORKSHOP_ATTACK_UPGRADE_KEYS = [
  'damageLevel',
  'attackSpeedLevel',
  'critChanceLevel',
  'critFactorLevel',
  'attackRangeLevel',
  'damagePerMeterLevel',
  'multishotChanceLevel',
  'multishotTargetsLevel',
  'rapidFireChanceLevel',
  'rapidFireDurationLevel',
  'bounceShotChanceLevel',
  'bounceShotTargetsLevel',
  'bounceShotRangeLevel',
  'superCritChanceLevel',
  'superCritMultLevel',
  'rendArmorChanceLevel',
  'rendArmorMultLevel',
] as const

export type AppDeepLink =
  | { kind: 'lab'; target: string }
  | { kind: 'workshop'; target: string }
  | { kind: 'relic'; target: string }

export type WorkshopDeepLinkNav = {
  category: WorkshopCategoryPersisted
  mainTab: 'upgrade' | 'enhance'
  domId: string
}

type DeepLinkListener = (link: AppDeepLink) => void

const listeners = new Set<DeepLinkListener>()

export function subscribeAppDeepLink(listener: DeepLinkListener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function emitAppDeepLink(link: AppDeepLink): void {
  for (const listener of listeners) {
    listener(link)
  }
}

function decodeHashSegment(raw: string): string {
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

function readHashTargetFromRaw(hash: string): string | null {
  const raw = hash.replace(/^#/, '').trim()
  return raw.length > 0 ? decodeHashSegment(raw) : null
}

function readQueryTargetFromSearch(search: string, param: string): string | null {
  const q = new URLSearchParams(search).get(param)?.trim()
  return q && q.length > 0 ? q : null
}

/**
 * Read deep link from hash/search strings (hash wins over query params).
 * Lab slugs are unprefixed; workshop uses `workshop-…`; relics use `relic-…`.
 */
export function parseAppDeepLinkFromLocation(
  hash: string,
  search: string,
): AppDeepLink | null {
  const hashTarget = readHashTargetFromRaw(hash)
  if (hashTarget) {
    if (hashTarget.startsWith(RELIC_HASH_PREFIX)) {
      const target = hashTarget.slice(RELIC_HASH_PREFIX.length)
      return target.length > 0 ? { kind: 'relic', target } : null
    }
    if (hashTarget.startsWith(WORKSHOP_HASH_PREFIX)) {
      const target = hashTarget.slice(WORKSHOP_HASH_PREFIX.length)
      return target.length > 0 ? { kind: 'workshop', target } : null
    }
    return { kind: 'lab', target: hashTarget }
  }

  const relic = readQueryTargetFromSearch(search, RELIC_DEEP_LINK_QUERY_PARAM)
  if (relic) return { kind: 'relic', target: relic }

  const workshop = readQueryTargetFromSearch(search, WORKSHOP_DEEP_LINK_QUERY_PARAM)
  if (workshop) return { kind: 'workshop', target: workshop }

  const lab = readQueryTargetFromSearch(search, LAB_DEEP_LINK_QUERY_PARAM)
  if (lab) return { kind: 'lab', target: lab }

  return null
}

/**
 * Read URL deep link from `window.location` (hash wins over query params).
 */
export function parseAppDeepLinkFromUrl(): AppDeepLink | null {
  if (typeof window === 'undefined') return null
  return parseAppDeepLinkFromLocation(window.location.hash, window.location.search)
}

export function relicDomId(relicId: string): string {
  return `${RELIC_HASH_PREFIX}${relicId}`
}

export function workshopStatDomId(fieldKey: string): string {
  return `${WORKSHOP_HASH_PREFIX}${fieldKey}`
}

export function workshopUltimateDomId(weaponId: WorkshopUltimateWeaponId): string {
  return workshopStatDomId(`ultimate-${weaponId}`)
}

export function isKnownRelicId(relicId: string): boolean {
  return workshopRelicDef(relicId) != null
}

const WORKSHOP_STAT_NAV = new Map<string, Omit<WorkshopDeepLinkNav, 'domId'>>()

function registerWorkshopStat(
  fieldKey: string,
  category: WorkshopCategoryPersisted,
  mainTab: 'upgrade' | 'enhance',
): void {
  WORKSHOP_STAT_NAV.set(fieldKey, { category, mainTab })
}

for (const key of WORKSHOP_ATTACK_UPGRADE_KEYS) {
  registerWorkshopStat(key, 'attack', 'upgrade')
}
for (const key of WORKSHOP_DEFENSE_UPGRADE_ORDER) {
  registerWorkshopStat(key, 'defense', 'upgrade')
}
for (const key of WORKSHOP_UTILITY_UPGRADE_ORDER) {
  registerWorkshopStat(key, 'utility', 'upgrade')
}
for (const key of WORKSHOP_ENHANCE_ATTACK_UPGRADE_ORDER) {
  registerWorkshopStat(key, 'attack', 'enhance')
}
for (const key of WORKSHOP_ENHANCE_DEFENSE_UPGRADE_ORDER) {
  registerWorkshopStat(key, 'defense', 'enhance')
}
for (const key of WORKSHOP_ENHANCE_UTILITY_UPGRADE_ORDER) {
  registerWorkshopStat(key, 'utility', 'enhance')
}

const ULTIMATE_WEAPON_IDS = new Set<string>(WORKSHOP_ULTIMATE_WEAPON_ORDER)

export function resolveWorkshopDeepLinkNav(
  target: string,
): WorkshopDeepLinkNav | null {
  if (target.startsWith('ultimate-')) {
    const weaponId = target.slice('ultimate-'.length)
    if (!ULTIMATE_WEAPON_IDS.has(weaponId)) return null
    return {
      category: 'ultimate',
      mainTab: 'upgrade',
      domId: workshopUltimateDomId(weaponId as WorkshopUltimateWeaponId),
    }
  }
  const nav = WORKSHOP_STAT_NAV.get(target)
  if (!nav) return null
  return { ...nav, domId: workshopStatDomId(target) }
}

export function mainPanelForDeepLink(link: AppDeepLink): 'research' | 'workshop' | 'relics' {
  switch (link.kind) {
    case 'lab':
      return 'research'
    case 'workshop':
      return 'workshop'
    case 'relic':
      return 'relics'
  }
}
