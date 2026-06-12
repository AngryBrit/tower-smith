import {
  isBotsWorkbookName,
  isCardsWorkbookName,
  isLaboratoryWorkbookName,
  isGuardiansWorkbookName,
  isModulesWorkbookName,
  isRelicsWorkbookName,
  isThemesWorkbookName,
  isUwsWorkbookName,
  isWorkshopWorkbookName,
} from './effectivePathsCategoryNames'
import { filterKnownIdsWorkbooks, isKnownIdsWorkbookName } from './effectivePathsIdsWorkbooks'
import type { EffectivePathsLinkedWorkbook } from './parseIdsMasterWorkbooks'

export type LinkedWorkbookAccess = {
  name: string
  spreadsheetId: string
  access: 'ok' | 'denied' | 'not_found'
}

export type EffectivePathsIdsGateway = {
  idsTabTitle: string
  workbooks: EffectivePathsLinkedWorkbook[]
  relicsWorkbook: EffectivePathsLinkedWorkbook | null
  themesWorkbook: EffectivePathsLinkedWorkbook | null
  cardsWorkbook: EffectivePathsLinkedWorkbook | null
  workshopWorkbook: EffectivePathsLinkedWorkbook | null
  botsWorkbook: EffectivePathsLinkedWorkbook | null
  laboratoryWorkbook: EffectivePathsLinkedWorkbook | null
  uwsWorkbook: EffectivePathsLinkedWorkbook | null
  guardiansWorkbook: EffectivePathsLinkedWorkbook | null
  modulesWorkbook: EffectivePathsLinkedWorkbook | null
}

export type EffectivePathsListResult = {
  ok: true
} & EffectivePathsIdsGateway & {
  relicsWorkbookAccess: 'ok' | 'denied' | 'not_found' | null
  themesWorkbookAccess: 'ok' | 'denied' | 'not_found' | null
  cardsWorkbookAccess: 'ok' | 'denied' | 'not_found' | null
  workshopWorkbookAccess: 'ok' | 'denied' | 'not_found' | null
  botsWorkbookAccess: 'ok' | 'denied' | 'not_found' | null
  laboratoryWorkbookAccess: 'ok' | 'denied' | 'not_found' | null
  uwsWorkbookAccess: 'ok' | 'denied' | 'not_found' | null
  guardiansWorkbookAccess: 'ok' | 'denied' | 'not_found' | null
  modulesWorkbookAccess: 'ok' | 'denied' | 'not_found' | null
  workbookAccess: LinkedWorkbookAccess[]
}

export function workbooksToAuthorizeFromGateway(
  gateway: EffectivePathsIdsGateway,
): EffectivePathsLinkedWorkbook[] {
  const merged = filterKnownIdsWorkbooks([
    ...gateway.workbooks,
    ...(gateway.relicsWorkbook ? [gateway.relicsWorkbook] : []),
    ...(gateway.themesWorkbook ? [gateway.themesWorkbook] : []),
    ...(gateway.cardsWorkbook ? [gateway.cardsWorkbook] : []),
    ...(gateway.workshopWorkbook ? [gateway.workshopWorkbook] : []),
    ...(gateway.botsWorkbook ? [gateway.botsWorkbook] : []),
    ...(gateway.laboratoryWorkbook ? [gateway.laboratoryWorkbook] : []),
    ...(gateway.uwsWorkbook ? [gateway.uwsWorkbook] : []),
    ...(gateway.guardiansWorkbook ? [gateway.guardiansWorkbook] : []),
    ...(gateway.modulesWorkbook ? [gateway.modulesWorkbook] : []),
  ])
  const seen = new Set<string>()
  const out: EffectivePathsLinkedWorkbook[] = []
  for (const workbook of merged) {
    const key = `${workbook.name}:${workbook.spreadsheetId}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(workbook)
  }
  return out
}

function categoryAccess(
  workbookAccess: readonly LinkedWorkbookAccess[],
  matches: (name: string) => boolean,
): 'ok' | 'denied' | 'not_found' | null {
  const access = workbookAccess.find((row) => matches(row.name))?.access
  return access === 'ok' || access === 'denied' || access === 'not_found' ? access : null
}

export function assembleEffectivePathsListResult(
  gateway: EffectivePathsIdsGateway,
  workbookAccess: readonly LinkedWorkbookAccess[],
): EffectivePathsListResult {
  const knownAccess = workbookAccess.filter((row) => isKnownIdsWorkbookName(row.name))
  return {
    ok: true,
    workbooks: filterKnownIdsWorkbooks(gateway.workbooks),
    idsTabTitle: gateway.idsTabTitle,
    relicsWorkbook: gateway.relicsWorkbook,
    relicsWorkbookAccess: categoryAccess(knownAccess, isRelicsWorkbookName),
    themesWorkbook: gateway.themesWorkbook,
    themesWorkbookAccess: categoryAccess(knownAccess, isThemesWorkbookName),
    cardsWorkbook: gateway.cardsWorkbook,
    cardsWorkbookAccess: categoryAccess(knownAccess, isCardsWorkbookName),
    workshopWorkbook: gateway.workshopWorkbook,
    workshopWorkbookAccess: categoryAccess(knownAccess, isWorkshopWorkbookName),
    botsWorkbook: gateway.botsWorkbook,
    botsWorkbookAccess: categoryAccess(knownAccess, isBotsWorkbookName),
    laboratoryWorkbook: gateway.laboratoryWorkbook,
    laboratoryWorkbookAccess: categoryAccess(knownAccess, isLaboratoryWorkbookName),
    uwsWorkbook: gateway.uwsWorkbook,
    uwsWorkbookAccess: categoryAccess(knownAccess, isUwsWorkbookName),
    guardiansWorkbook: gateway.guardiansWorkbook,
    guardiansWorkbookAccess: categoryAccess(knownAccess, isGuardiansWorkbookName),
    modulesWorkbook: gateway.modulesWorkbook,
    modulesWorkbookAccess: categoryAccess(knownAccess, isModulesWorkbookName),
    workbookAccess: [...knownAccess],
  }
}
