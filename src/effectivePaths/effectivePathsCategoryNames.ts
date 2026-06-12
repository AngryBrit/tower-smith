import type { EffectivePathsLinkedWorkbook } from './parseIdsMasterWorkbooks'
import {
  EFFECTIVE_PATHS_BOTS_WORKBOOK_NAME,
  EFFECTIVE_PATHS_CARDS_WORKBOOK_NAME,
  EFFECTIVE_PATHS_LABORATORY_WORKBOOK_NAME,
  EFFECTIVE_PATHS_UWS_WORKBOOK_NAME,
  EFFECTIVE_PATHS_GUARDIANS_WORKBOOK_NAME,
  EFFECTIVE_PATHS_MODULES_WORKBOOK_NAME,
  EFFECTIVE_PATHS_RELICS_WORKBOOK_NAME,
  EFFECTIVE_PATHS_THEMES_WORKBOOK_NAME,
  EFFECTIVE_PATHS_WORKSHOP_WORKBOOK_NAME,
} from './effectivePathsWorkbooks'

/** Strip leading emoji/icons and normalize for IDS Master category labels. */
export function categoryNameKey(name: string): string {
  return name
    .trim()
    .replace(/^[\s\p{Extended_Pictographic}\p{Emoji_Presentation}\p{Emoji}]+/gu, '')
    .replace(/^[^a-zA-Z0-9]+/, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

/** Display-friendly category label (emoji kept, extra whitespace trimmed). */
export function cleanEffectivePathsCategoryName(name: string): string {
  const trimmed = name.trim().replace(/\s+/g, ' ')
  if (isUwsWorkbookName(trimmed)) {
    return EFFECTIVE_PATHS_UWS_WORKBOOK_NAME
  }
  if (isModulesWorkbookName(trimmed)) {
    return EFFECTIVE_PATHS_MODULES_WORKBOOK_NAME
  }
  return trimmed
}

export function isLaboratoryWorkbookName(name: string): boolean {
  const key = categoryNameKey(name)
  return key === 'laboratory' || key.endsWith(' laboratory')
}

export function findLaboratoryWorkbook(
  workbooks: readonly EffectivePathsLinkedWorkbook[],
): EffectivePathsLinkedWorkbook | null {
  const byAlias = workbooks.find((workbook) => isLaboratoryWorkbookName(workbook.name))
  if (byAlias) return byAlias
  const norm = categoryNameKey(EFFECTIVE_PATHS_LABORATORY_WORKBOOK_NAME)
  return (
    workbooks.find((workbook) => categoryNameKey(workbook.name) === norm) ??
    workbooks.find((workbook) => categoryNameKey(workbook.name).includes(norm)) ??
    null
  )
}

export function isRelicsWorkbookName(name: string): boolean {
  const key = categoryNameKey(name)
  return key === 'relics' || key === 'relic' || key.endsWith(' relics')
}

export function findRelicsWorkbook(
  workbooks: readonly EffectivePathsLinkedWorkbook[],
): EffectivePathsLinkedWorkbook | null {
  const byAlias = workbooks.find((workbook) => isRelicsWorkbookName(workbook.name))
  if (byAlias) return byAlias
  const norm = categoryNameKey(EFFECTIVE_PATHS_RELICS_WORKBOOK_NAME)
  return (
    workbooks.find((workbook) => categoryNameKey(workbook.name) === norm) ??
    workbooks.find((workbook) => categoryNameKey(workbook.name).includes(norm)) ??
    null
  )
}

export function isThemesWorkbookName(name: string): boolean {
  const key = categoryNameKey(name)
  return (
    key === 'themes songs' ||
    key === 'themes & songs' ||
    key.endsWith(' themes songs') ||
    key.includes('themes songs')
  )
}

export function findThemesWorkbook(
  workbooks: readonly EffectivePathsLinkedWorkbook[],
): EffectivePathsLinkedWorkbook | null {
  const byAlias = workbooks.find((workbook) => isThemesWorkbookName(workbook.name))
  if (byAlias) return byAlias
  const norm = categoryNameKey(EFFECTIVE_PATHS_THEMES_WORKBOOK_NAME)
  return (
    workbooks.find((workbook) => categoryNameKey(workbook.name) === norm) ??
    workbooks.find((workbook) => categoryNameKey(workbook.name).includes(norm)) ??
    null
  )
}

export function isCardsWorkbookName(name: string): boolean {
  const key = categoryNameKey(name)
  return key === 'cards' || key.endsWith(' cards')
}

export function findCardsWorkbook(
  workbooks: readonly EffectivePathsLinkedWorkbook[],
): EffectivePathsLinkedWorkbook | null {
  const byAlias = workbooks.find((workbook) => isCardsWorkbookName(workbook.name))
  if (byAlias) return byAlias
  const norm = categoryNameKey(EFFECTIVE_PATHS_CARDS_WORKBOOK_NAME)
  return (
    workbooks.find((workbook) => categoryNameKey(workbook.name) === norm) ??
    workbooks.find((workbook) => categoryNameKey(workbook.name).includes(norm)) ??
    null
  )
}

export function isWorkshopWorkbookName(name: string): boolean {
  const key = categoryNameKey(name)
  return key === 'workshop' || key.endsWith(' workshop')
}

export function findWorkshopWorkbook(
  workbooks: readonly EffectivePathsLinkedWorkbook[],
): EffectivePathsLinkedWorkbook | null {
  const byAlias = workbooks.find((workbook) => isWorkshopWorkbookName(workbook.name))
  if (byAlias) return byAlias
  const norm = categoryNameKey(EFFECTIVE_PATHS_WORKSHOP_WORKBOOK_NAME)
  return (
    workbooks.find((workbook) => categoryNameKey(workbook.name) === norm) ??
    workbooks.find((workbook) => categoryNameKey(workbook.name).includes(norm)) ??
    null
  )
}

export function isBotsWorkbookName(name: string): boolean {
  const key = categoryNameKey(name)
  return key === 'bots' || key.endsWith(' bots')
}

export function findBotsWorkbook(
  workbooks: readonly EffectivePathsLinkedWorkbook[],
): EffectivePathsLinkedWorkbook | null {
  const byAlias = workbooks.find((workbook) => isBotsWorkbookName(workbook.name))
  if (byAlias) return byAlias
  const norm = categoryNameKey(EFFECTIVE_PATHS_BOTS_WORKBOOK_NAME)
  return (
    workbooks.find((workbook) => categoryNameKey(workbook.name) === norm) ??
    workbooks.find((workbook) => categoryNameKey(workbook.name).includes(norm)) ??
    null
  )
}

export function isUwsWorkbookName(name: string): boolean {
  const key = categoryNameKey(name)
  return (
    key === 'uws' ||
    key.startsWith('uws ') ||
    key === 'ultimate weapon' ||
    key === 'ultimate weapons' ||
    key.endsWith(' uws') ||
    key.includes('ultimate weapon')
  )
}

export function findUwsWorkbook(
  workbooks: readonly EffectivePathsLinkedWorkbook[],
): EffectivePathsLinkedWorkbook | null {
  const byAlias = workbooks.find((workbook) => isUwsWorkbookName(workbook.name))
  if (byAlias) return byAlias
  const norm = categoryNameKey(EFFECTIVE_PATHS_UWS_WORKBOOK_NAME)
  return (
    workbooks.find((workbook) => categoryNameKey(workbook.name) === norm) ??
    workbooks.find((workbook) => categoryNameKey(workbook.name).includes(norm)) ??
    null
  )
}

export function isModulesWorkbookName(name: string): boolean {
  const key = categoryNameKey(name)
  return key === 'modules' || key.startsWith('modules ')
}

export function findModulesWorkbook(
  workbooks: readonly EffectivePathsLinkedWorkbook[],
): EffectivePathsLinkedWorkbook | null {
  const byAlias = workbooks.find((workbook) => isModulesWorkbookName(workbook.name))
  if (byAlias) return byAlias
  const norm = categoryNameKey(EFFECTIVE_PATHS_MODULES_WORKBOOK_NAME)
  return (
    workbooks.find((workbook) => categoryNameKey(workbook.name) === norm) ??
    workbooks.find((workbook) => categoryNameKey(workbook.name).includes(norm)) ??
    null
  )
}

export function isGuardiansWorkbookName(name: string): boolean {
  const key = categoryNameKey(name)
  return key === 'guardians' || key.startsWith('guardians ')
}

export function findGuardiansWorkbook(
  workbooks: readonly EffectivePathsLinkedWorkbook[],
): EffectivePathsLinkedWorkbook | null {
  const byAlias = workbooks.find((workbook) => isGuardiansWorkbookName(workbook.name))
  if (byAlias) return byAlias
  const norm = categoryNameKey(EFFECTIVE_PATHS_GUARDIANS_WORKBOOK_NAME)
  return (
    workbooks.find((workbook) => categoryNameKey(workbook.name) === norm) ??
    workbooks.find((workbook) => categoryNameKey(workbook.name).includes(norm)) ??
    null
  )
}
