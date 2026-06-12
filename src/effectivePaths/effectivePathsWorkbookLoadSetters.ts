import { applyLinkedWorkbookAccessRow } from './applyLinkedWorkbookAccessRow'
import type { EffectivePathsIdsGateway } from './assembleEffectivePathsListResult'
import type { LinkedWorkbookAccess } from './assembleEffectivePathsListResult'
import type { EffectivePathsLinkedWorkbook } from './parseIdsMasterWorkbooks'

type WorkbookAccessState = 'ok' | 'denied' | 'not_found' | null

export type EffectivePathsWorkbookLoadSetters = {
  setWorkbooks?: (workbooks: EffectivePathsLinkedWorkbook[] | null) => void
  setIdsTabTitle: (title: string | null) => void
  setRelicsWorkbook: (workbook: EffectivePathsLinkedWorkbook | null) => void
  setRelicsWorkbookAccess: (access: WorkbookAccessState) => void
  setThemesWorkbook: (workbook: EffectivePathsLinkedWorkbook | null) => void
  setThemesWorkbookAccess: (access: WorkbookAccessState) => void
  setCardsWorkbook: (workbook: EffectivePathsLinkedWorkbook | null) => void
  setCardsWorkbookAccess: (access: WorkbookAccessState) => void
  setWorkshopWorkbook: (workbook: EffectivePathsLinkedWorkbook | null) => void
  setWorkshopWorkbookAccess: (access: WorkbookAccessState) => void
  setBotsWorkbook: (workbook: EffectivePathsLinkedWorkbook | null) => void
  setBotsWorkbookAccess: (access: WorkbookAccessState) => void
  setLaboratoryWorkbook: (workbook: EffectivePathsLinkedWorkbook | null) => void
  setLaboratoryWorkbookAccess: (access: WorkbookAccessState) => void
  setUwsWorkbook: (workbook: EffectivePathsLinkedWorkbook | null) => void
  setUwsWorkbookAccess: (access: WorkbookAccessState) => void
  setGuardiansWorkbook: (workbook: EffectivePathsLinkedWorkbook | null) => void
  setGuardiansWorkbookAccess: (access: WorkbookAccessState) => void
  setModulesWorkbook: (workbook: EffectivePathsLinkedWorkbook | null) => void
  setModulesWorkbookAccess: (access: WorkbookAccessState) => void
  setWorkbookAccess: (
    value: LinkedWorkbookAccess[] | null | ((prev: LinkedWorkbookAccess[] | null) => LinkedWorkbookAccess[] | null),
  ) => void
}

export function resetEffectivePathsWorkbookLoadState(setters: EffectivePathsWorkbookLoadSetters): void {
  setters.setWorkbooks?.(null)
  setters.setIdsTabTitle(null)
  setters.setRelicsWorkbook(null)
  setters.setRelicsWorkbookAccess(null)
  setters.setThemesWorkbook(null)
  setters.setThemesWorkbookAccess(null)
  setters.setCardsWorkbook(null)
  setters.setCardsWorkbookAccess(null)
  setters.setWorkshopWorkbook(null)
  setters.setWorkshopWorkbookAccess(null)
  setters.setBotsWorkbook(null)
  setters.setBotsWorkbookAccess(null)
  setters.setLaboratoryWorkbook(null)
  setters.setLaboratoryWorkbookAccess(null)
  setters.setUwsWorkbook(null)
  setters.setUwsWorkbookAccess(null)
  setters.setGuardiansWorkbook(null)
  setters.setGuardiansWorkbookAccess(null)
  setters.setModulesWorkbook(null)
  setters.setModulesWorkbookAccess(null)
  setters.setWorkbookAccess(null)
}

export function applyEffectivePathsGateway(
  gateway: EffectivePathsIdsGateway,
  setters: EffectivePathsWorkbookLoadSetters,
): void {
  setters.setWorkbooks?.(gateway.workbooks)
  setters.setIdsTabTitle(gateway.idsTabTitle)
  setters.setRelicsWorkbook(gateway.relicsWorkbook)
  setters.setThemesWorkbook(gateway.themesWorkbook)
  setters.setCardsWorkbook(gateway.cardsWorkbook)
  setters.setWorkshopWorkbook(gateway.workshopWorkbook)
  setters.setBotsWorkbook(gateway.botsWorkbook)
  setters.setLaboratoryWorkbook(gateway.laboratoryWorkbook)
  setters.setUwsWorkbook(gateway.uwsWorkbook)
  setters.setGuardiansWorkbook(gateway.guardiansWorkbook)
  setters.setModulesWorkbook(gateway.modulesWorkbook)
}

export function resolveLinkedCategoryWorkbook(
  dedicated: EffectivePathsLinkedWorkbook | null,
  dedicatedAccess: 'ok' | 'denied' | 'not_found' | null,
  workbookAccess: readonly LinkedWorkbookAccess[] | null,
  matches: (name: string) => boolean,
): {
  workbook: EffectivePathsLinkedWorkbook | null
  access: 'ok' | 'denied' | 'not_found' | null
} {
  if (dedicated) {
    return { workbook: dedicated, access: dedicatedAccess }
  }
  const row = workbookAccess?.find((workbook) => matches(workbook.name))
  if (!row) {
    return { workbook: null, access: null }
  }
  return {
    workbook: { name: row.name, spreadsheetId: row.spreadsheetId },
    access: row.access,
  }
}

export function applyEffectivePathsWorkbookAccessRow(
  row: LinkedWorkbookAccess,
  setters: EffectivePathsWorkbookLoadSetters,
): void {
  setters.setWorkbookAccess((prev) => [...(prev ?? []), row])
  applyLinkedWorkbookAccessRow(row, {
    setRelicsWorkbookAccess: setters.setRelicsWorkbookAccess,
    setThemesWorkbookAccess: setters.setThemesWorkbookAccess,
    setCardsWorkbookAccess: setters.setCardsWorkbookAccess,
    setWorkshopWorkbookAccess: setters.setWorkshopWorkbookAccess,
    setBotsWorkbookAccess: setters.setBotsWorkbookAccess,
    setLaboratoryWorkbookAccess: setters.setLaboratoryWorkbookAccess,
    setUwsWorkbookAccess: setters.setUwsWorkbookAccess,
    setGuardiansWorkbookAccess: setters.setGuardiansWorkbookAccess,
    setModulesWorkbookAccess: setters.setModulesWorkbookAccess,
  })
}
