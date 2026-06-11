import {
  isBotsWorkbookName,
  isCardsWorkbookName,
  isLaboratoryWorkbookName,
  isModulesWorkbookName,
  isRelicsWorkbookName,
  isThemesWorkbookName,
  isUwsWorkbookName,
  isWorkshopWorkbookName,
} from './effectivePathsCategoryNames'
import type { LinkedWorkbookAccess } from './assembleEffectivePathsListResult'

export type WorkbookAccessState = 'ok' | 'denied' | 'not_found'

export type LinkedWorkbookAccessSetters = {
  setRelicsWorkbookAccess?: (access: WorkbookAccessState) => void
  setThemesWorkbookAccess?: (access: WorkbookAccessState) => void
  setCardsWorkbookAccess?: (access: WorkbookAccessState) => void
  setWorkshopWorkbookAccess?: (access: WorkbookAccessState) => void
  setBotsWorkbookAccess?: (access: WorkbookAccessState) => void
  setLaboratoryWorkbookAccess?: (access: WorkbookAccessState) => void
  setUwsWorkbookAccess?: (access: WorkbookAccessState) => void
  setModulesWorkbookAccess?: (access: WorkbookAccessState) => void
}

export function applyLinkedWorkbookAccessRow(
  row: LinkedWorkbookAccess,
  setters: LinkedWorkbookAccessSetters,
): void {
  if (isRelicsWorkbookName(row.name)) setters.setRelicsWorkbookAccess?.(row.access)
  if (isThemesWorkbookName(row.name)) setters.setThemesWorkbookAccess?.(row.access)
  if (isCardsWorkbookName(row.name)) setters.setCardsWorkbookAccess?.(row.access)
  if (isWorkshopWorkbookName(row.name)) setters.setWorkshopWorkbookAccess?.(row.access)
  if (isBotsWorkbookName(row.name)) setters.setBotsWorkbookAccess?.(row.access)
  if (isLaboratoryWorkbookName(row.name)) setters.setLaboratoryWorkbookAccess?.(row.access)
  if (isUwsWorkbookName(row.name)) setters.setUwsWorkbookAccess?.(row.access)
  if (isModulesWorkbookName(row.name)) setters.setModulesWorkbookAccess?.(row.access)
}
