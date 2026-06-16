import { quoteSheetTitleForRange } from './buildRelicUnlockedUpdates'
import {
  legacyModuleEpInventoryLayout,
  moduleEpResolvedAnyOtherColumn,
  moduleEpResolvedColumnForModule,
  type ModuleEpResolvedLayout,
  type ModuleEpResolvedSection,
} from './moduleEpInventoryLayoutFromSheet'
import {
  MODULE_EP_EMPTY_RARITY_SHEET_LABEL,
  moduleEpMergeTierSheetLabel,
  moduleEpSubmoduleRaritySheetLabel,
  moduleEpSubmoduleSheetLabel,
} from './moduleEpSheetNames'
import type { ModulesEpEquippedModule, ModulesEpSyncState } from './modulesEpStateFromPersisted'
import { WORKSHOP_ASSIST_MODULE_SLOTS } from '../data/workshopSimModules'
import { columnIndexToA1Letter } from './relicSheetLayout'

export type ModuleSheetBatchUpdate = {
  range: string
  values: (string | number)[][]
}

const MODULE_EP_INVENTORY_SUBSTAT_ROWS = 8

function pushCell(
  out: ModuleSheetBatchUpdate[],
  quoted: string,
  col: number,
  row: number,
  value: string | number,
): void {
  const letter = columnIndexToA1Letter(col)
  out.push({
    range: `${quoted}!${letter}${row}`,
    values: [[value]],
  })
}

type ResolvedTarget = {
  section: ModuleEpResolvedSection
  baseCol: number
}

function resolveWriteTarget(
  layout: ModuleEpResolvedLayout,
  equipped: ModulesEpEquippedModule,
): ResolvedTarget | null {
  const section = layout.sections[equipped.hubSlot]
  if (!section) return null

  if (equipped.role === 'assist') {
    const dedicated = moduleEpResolvedColumnForModule(section, equipped.moduleId)
    if (dedicated) {
      return { section, baseCol: dedicated.baseCol }
    }
    const column = moduleEpResolvedAnyOtherColumn(section, 1)
    if (!column) return null
    return { section, baseCol: column.baseCol }
  }

  const dedicated = moduleEpResolvedColumnForModule(section, equipped.moduleId)
  if (dedicated) {
    return { section, baseCol: dedicated.baseCol }
  }

  if (equipped.hubEquipped) {
    const anyOther = moduleEpResolvedAnyOtherColumn(section, 1)
    if (!anyOther) return null
    return { section, baseCol: anyOther.baseCol }
  }

  return null
}

function clearModuleColumn(
  out: ModuleSheetBatchUpdate[],
  quoted: string,
  section: ModuleEpResolvedSection,
  baseCol: number,
): void {
  const { dataRow, substatStartRow, substatEndRow } = section
  // Data row: Rarity only (e.g. F5). Level/Stat (G5, H5) are sheet formulas — never touch.
  pushCell(out, quoted, baseCol, dataRow, MODULE_EP_EMPTY_RARITY_SHEET_LABEL)

  if (substatStartRow == null) return

  // Substat band (e.g. F7–F14 names, G7–G14 rarities): clear empty — not "None".
  for (let i = 0; i < MODULE_EP_INVENTORY_SUBSTAT_ROWS; i += 1) {
    const row = substatStartRow + i
    if (row > substatEndRow || row <= dataRow) break
    pushCell(out, quoted, baseCol, row, '')
    pushCell(out, quoted, baseCol + 1, row, '')
  }
}

function clearSectionModuleColumns(
  out: ModuleSheetBatchUpdate[],
  quoted: string,
  layout: ModuleEpResolvedLayout,
  state: ModulesEpSyncState,
): void {
  const cleared = new Set<string>()

  for (const slot of WORKSHOP_ASSIST_MODULE_SLOTS) {
    const section = layout.sections[slot]
    if (!section) continue
    for (const column of section.modules) {
      const key = `${slot}:${column.baseCol}`
      if (cleared.has(key)) continue
      clearModuleColumn(out, quoted, section, column.baseCol)
      cleared.add(key)
    }
  }

  for (const mod of state.modules) {
    const target = resolveWriteTarget(layout, mod)
    if (!target) continue
    const key = `${mod.hubSlot}:${target.baseCol}`
    if (cleared.has(key)) continue
    clearModuleColumn(out, quoted, target.section, target.baseCol)
    cleared.add(key)
  }
}

function writeEquippedModule(
  out: ModuleSheetBatchUpdate[],
  quoted: string,
  layout: ModuleEpResolvedLayout,
  equipped: ModulesEpEquippedModule,
): void {
  const target = resolveWriteTarget(layout, equipped)
  if (!target) return

  const { section, baseCol } = target
  const { dataRow, substatStartRow, substatEndRow, spareRow } = section
  const isAssist = equipped.role === 'assist'

  pushCell(out, quoted, baseCol, dataRow, moduleEpMergeTierSheetLabel(equipped.mergeTier))

  if (substatStartRow == null) return

  // Embedded layout: substat band starts on the spare row (e.g. row 3). v6.1.2 bands start lower (row 7+).
  const substatRowStart =
    isAssist && spareRow != null && substatStartRow <= spareRow ? spareRow + 1 : substatStartRow

  for (let i = 0; i < MODULE_EP_INVENTORY_SUBSTAT_ROWS; i += 1) {
    const row = substatRowStart + i
    if (row > substatEndRow) break

    const substat = equipped.substats[i]
    if (!substat) continue

    pushCell(out, quoted, baseCol, row, moduleEpSubmoduleSheetLabel(substat.catalogLabel))
    pushCell(
      out,
      quoted,
      baseCol + 1,
      row,
      moduleEpSubmoduleRaritySheetLabel(substat.rarity),
    )
  }
}

function resetSectionSidebarLevels(
  out: ModuleSheetBatchUpdate[],
  quoted: string,
  layout: ModuleEpResolvedLayout,
): void {
  for (const slot of WORKSHOP_ASSIST_MODULE_SLOTS) {
    const section = layout.sections[slot]
    if (!section) continue

    const { highestPrimaryLevelCell, highestAssistLevelCell } = section
    if (highestPrimaryLevelCell) {
      pushCell(
        out,
        quoted,
        highestPrimaryLevelCell.col,
        highestPrimaryLevelCell.row,
        0,
      )
    }
    if (highestAssistLevelCell) {
      pushCell(
        out,
        quoted,
        highestAssistLevelCell.col,
        highestAssistLevelCell.row,
        0,
      )
    }
  }
}

function writeSectionSidebarLevels(
  out: ModuleSheetBatchUpdate[],
  quoted: string,
  layout: ModuleEpResolvedLayout,
  state: ModulesEpSyncState,
): void {
  for (const slot of WORKSHOP_ASSIST_MODULE_SLOTS) {
    const section = layout.sections[slot]
    const levels = state.sectionLevels[slot]
    if (!section || !levels) continue

    const { highestPrimaryLevelCell, highestAssistLevelCell } = section
    if (highestPrimaryLevelCell) {
      pushCell(
        out,
        quoted,
        highestPrimaryLevelCell.col,
        highestPrimaryLevelCell.row,
        levels.highestPrimaryLevel,
      )
    }
    if (highestAssistLevelCell) {
      pushCell(
        out,
        quoted,
        highestAssistLevelCell.col,
        highestAssistLevelCell.row,
        levels.highestAssistLevel,
      )
    }
  }
}

/**
 * Modules Inventory tab — sync owned inventory modules using a resolved sheet layout.
 */
export function buildModuleSheetUpdates(
  sheetTitle: string,
  state: ModulesEpSyncState,
  layout: ModuleEpResolvedLayout = legacyModuleEpInventoryLayout(),
): ModuleSheetBatchUpdate[] {
  const quoted = quoteSheetTitleForRange(sheetTitle)
  const out: ModuleSheetBatchUpdate[] = []

  resetSectionSidebarLevels(out, quoted, layout)
  writeSectionSidebarLevels(out, quoted, layout, state)
  clearSectionModuleColumns(out, quoted, layout, state)

  for (const equipped of state.modules) {
    writeEquippedModule(out, quoted, layout, equipped)
  }

  return out
}

export function countModulesEpEquippedSlots(state: ModulesEpSyncState): number {
  return state.modules.length
}

export function countModulesEpHubEquippedSlots(state: ModulesEpSyncState): number {
  return state.modules.filter((mod) => mod.hubEquipped).length
}

export function countModulesEpEquippedSubstats(state: ModulesEpSyncState): number {
  let total = 0
  for (const equipped of state.modules) {
    total += equipped.substats.length
  }
  return total
}
