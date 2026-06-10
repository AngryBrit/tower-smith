import type { WorkshopPersistedV1 } from '../labPresetsStorage'
import { WORKSHOP_EP_UPGRADE_KEYS } from './workshopSheetNames'

/** Level fields from workshop state for Effective Paths sync. */
export function workshopLevelsFromPersisted(ws: WorkshopPersistedV1): Record<string, number> {
  const out: Record<string, number> = {}
  for (const key of WORKSHOP_EP_UPGRADE_KEYS) {
    out[key] = ws[key]
  }
  return out
}
