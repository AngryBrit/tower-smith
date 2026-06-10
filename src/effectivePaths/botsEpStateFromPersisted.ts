import { workshopBotIsOwned } from '../data/workshopBots'
import {
  WORKSHOP_BOT_ORDER,
  WORKSHOP_BOT_SPECIAL_LEVEL_LOCKED,
  WORKSHOP_BOT_SPECIAL_LEVEL_ORDER,
  WORKSHOP_BOT_UPGRADE_ORDER,
  type WorkshopBotId,
} from '../data/workshopBotsData'
import type { WorkshopPersistedV1 } from '../labPresetsStorage'
import type { ResearchData } from '../types/research'

export type BotsEpSyncState = {
  levels: Record<string, number>
  ownedByBotId: Record<WorkshopBotId, boolean>
  labLevels: Record<string, number>
}

/** Medal + Bot+ levels and owned flags from workshop state. */
export function botsEpLevelsAndOwnedFromPersisted(ws: WorkshopPersistedV1): {
  levels: Record<string, number>
  ownedByBotId: Record<WorkshopBotId, boolean>
} {
  const levels: Record<string, number> = {}
  for (const key of WORKSHOP_BOT_UPGRADE_ORDER) {
    levels[key] = Math.max(0, Math.round(ws[key] ?? 0))
  }
  for (const key of WORKSHOP_BOT_SPECIAL_LEVEL_ORDER) {
    const raw = ws[key] ?? WORKSHOP_BOT_SPECIAL_LEVEL_LOCKED
    levels[key] = raw < 0 ? 0 : Math.max(0, Math.round(raw))
  }

  const ownedByBotId = {} as Record<WorkshopBotId, boolean>
  for (const botId of WORKSHOP_BOT_ORDER) {
    ownedByBotId[botId] = workshopBotIsOwned(ws, botId)
  }

  return { levels, ownedByBotId }
}

/** BOTS lab levels keyed by lab display name (e.g. "Flame Bot - Cooldown"). */
export function botLabLevelsFromOverrides(
  data: ResearchData,
  levelOverrides: Readonly<Record<string, number>>,
): Record<string, number> {
  const si = data.sections.findIndex((section) => section.sectionSlug === 'bots')
  if (si < 0) return {}
  const section = data.sections[si]!
  const out: Record<string, number> = {}
  section.items.forEach((item, ii) => {
    const level = levelOverrides[`${si}-${ii}`]
    if (typeof level === 'number' && Number.isFinite(level)) {
      out[item.name] = Math.max(0, Math.trunc(level))
    }
  })
  return out
}

/** Full Bots workbook sync payload from TowerSmith workspace state. */
export function botsEpStateFromPersisted(
  ws: WorkshopPersistedV1,
  data: ResearchData,
  levelOverrides: Readonly<Record<string, number>>,
): BotsEpSyncState {
  const { levels, ownedByBotId } = botsEpLevelsAndOwnedFromPersisted(ws)
  return {
    levels,
    ownedByBotId,
    labLevels: botLabLevelsFromOverrides(data, levelOverrides),
  }
}
