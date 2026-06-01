/**
 * Wiki **Displayed Attack Speed**:
 * **(Workshop × Lab × Card + Module Sub Effect) × Enhancement**
 *
 * No intermediate rounding; format with `.toFixed(2)` only for display labels.
 */

import { workshopCardMultProduct } from './workshopCardWorkshopDisplay'
import { mergeLabOverridesForDisplayedDamage } from './workshopLabOverridesForDamage'
import type { WorkshopPersistedV1 } from '../labPresetsStorage'
import { attackResearchAttackSpeedLabMultiplier, type ResearchData } from '../types/research'
import { workshopEnhanceAttackSpeedMultiplier } from './workshopEnhanceAttack'
import { workshopEnhancementsLabUnlocked } from './workshopEnhanceResearch'
import { workshopAttackSpeedStatValue } from './workshopAttackSpeed'
import { enrichAttackSpeedDisplayOpts } from './workshopRelicWorkshopDisplay'

export type WorkshopAttackSpeedDisplayOpts = {
  labMultiplier?: number
  attackSpeedCardMultiplier?: number
  /** Owned relic attack-speed % as **(1 + Relics)** on the workshop × lab × card product. */
  relicMultiplier?: number
  /** Flat cannon submodule attack speed add (wiki Sub-Module Effects). */
  moduleSubEffect?: number
  enhancementsMultiplier?: number
}

/**
 * Displayed attack speed from workshop base and optional multipliers (wiki formula).
 */
export function computeWorkshopDisplayedAttackSpeed(
  workshopAttackSpeed: number,
  opts: WorkshopAttackSpeedDisplayOpts = {},
): number {
  const lab = opts.labMultiplier ?? 1
  const card = opts.attackSpeedCardMultiplier ?? 1
  const relic = opts.relicMultiplier ?? 1
  const sub = opts.moduleSubEffect ?? 0
  const enhancements = opts.enhancementsMultiplier ?? 1
  return (workshopAttackSpeed * lab * card * relic + sub) * enhancements
}

function normalizeAttackSpeedDisplayOpts(
  opts?: WorkshopAttackSpeedDisplayOpts | number,
): WorkshopAttackSpeedDisplayOpts | undefined {
  if (opts === undefined) return undefined
  if (typeof opts === 'number') return { labMultiplier: opts }
  return opts
}

export function workshopDisplayedAttackSpeedFromWorkshopLevel(
  completedLevels: number,
  opts?: WorkshopAttackSpeedDisplayOpts | number,
): number {
  const workshop = workshopAttackSpeedStatValue(completedLevels)
  const normalized = normalizeAttackSpeedDisplayOpts(opts)
  if (normalized === undefined) return workshop
  return computeWorkshopDisplayedAttackSpeed(workshop, normalized)
}

/** Build wiki displayed-attack-speed opts from workshop + lab + cards/modules sim. */
export function workshopAttackSpeedDisplayOptsFromPersisted(
  ws: WorkshopPersistedV1,
  research: ResearchData | null,
  labOverrides: Record<string, number>,
  gameResearchLevel?: readonly number[] | null,
): WorkshopAttackSpeedDisplayOpts | undefined {
  if (research == null) return undefined
  const merged = mergeLabOverridesForDisplayedDamage(
    research,
    labOverrides,
    gameResearchLevel,
  )
  const attackSpeedCardMultiplier = workshopCardMultProduct(
    ws,
    research,
    merged,
    'attackSpeed',
  )
  return enrichAttackSpeedDisplayOpts(
    {
      labMultiplier: attackResearchAttackSpeedLabMultiplier(research, merged),
      attackSpeedCardMultiplier,
      moduleSubEffect: ws.simAttackSpeedModuleSubEffect,
      enhancementsMultiplier: workshopEnhanceAttackSpeedMultiplier(
        workshopEnhancementsLabUnlocked(research, merged)
          ? ws.enhanceAttackSpeedLevel
          : 0,
      ),
    },
    new Set(ws.relicOwnedIds),
  )
}

export function workshopDisplayedAttackSpeedFromPersisted(
  ws: WorkshopPersistedV1,
  research: ResearchData | null,
  labOverrides: Record<string, number>,
  gameResearchLevel?: readonly number[] | null,
): number {
  const workshop = workshopAttackSpeedStatValue(ws.attackSpeedLevel)
  const opts = workshopAttackSpeedDisplayOptsFromPersisted(
    ws,
    research,
    labOverrides,
    gameResearchLevel,
  )
  if (opts === undefined) return workshop
  return computeWorkshopDisplayedAttackSpeed(workshop, opts)
}
