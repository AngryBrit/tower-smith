import { CHASSIS_MODULE_ORDERS, workshopChassisModuleDefForSlot } from '../data/workshopChassisModuleSelection'
import {
  WORKSHOP_SUBMODULE_SECTIONS,
  submoduleEffectId,
} from '../data/workshopSubmoduleCatalog'
import { WORKSHOP_ASSIST_MODULE_SLOTS, type WorkshopAssistModuleSlot } from '../data/workshopSimModules'
import type {
  ModuleEpResolvedLayout,
  ModuleEpResolvedModuleColumn,
  ModuleEpResolvedSection,
} from './moduleEpInventoryLayoutFromSheet'
import {
  MODULE_EP_EMPTY_RARITY_SHEET_LABEL,
  moduleEpMergeTierFromSheetLabel,
  moduleEpSubmoduleRarityFromSheetLabel,
  moduleEpSubmoduleSheetLabel,
} from './moduleEpSheetNames'
import {
  modulesEpDefaultSectionLevels,
  type ModulesEpEquippedModule,
  type ModulesEpEquippedSubstat,
  type ModulesEpSyncState,
} from './modulesEpStateFromPersisted'

function cellAt(grid: readonly (readonly unknown[])[], row1: number, col0: number): string {
  const raw = grid[row1 - 1]?.[col0]
  if (raw == null) return ''
  return String(raw).trim()
}

function parseSidebarLevel(grid: readonly (readonly unknown[])[], row1: number, col0: number): number {
  const text = cellAt(grid, row1, col0)
  const n = Number(text)
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.trunc(n))
}

function sheetLabelToModuleId(slot: WorkshopAssistModuleSlot, label: string): string | null {
  const normalized = label.trim().toLowerCase()
  if (!normalized) return null
  if (normalized === 'any other') return '__anyOther1'
  if (normalized === 'any other 2') return '__anyOther2'
  for (const moduleId of CHASSIS_MODULE_ORDERS[slot]) {
    const def = workshopChassisModuleDefForSlot(slot, moduleId)
    if (def.name.trim().toLowerCase() === normalized) return moduleId
  }
  return null
}

function submoduleFromSheetLabel(
  slot: WorkshopAssistModuleSlot,
  sheetLabel: string,
): ModulesEpEquippedSubstat | null {
  const trimmed = sheetLabel.trim()
  if (!trimmed) return null
  const section = WORKSHOP_SUBMODULE_SECTIONS[slot]
  for (const row of section.rows) {
    if (moduleEpSubmoduleSheetLabel(row.label) !== trimmed) continue
    const effectId = submoduleEffectId(row.label)
    return { effectId, catalogLabel: row.label, rarity: 'common' }
  }
  return null
}

type EquippedCandidate = {
  moduleId: string
  column: ModuleEpResolvedModuleColumn
  mergeTier: NonNullable<ReturnType<typeof moduleEpMergeTierFromSheetLabel>>
  substats: ModulesEpEquippedSubstat[]
}

function readSubstats(
  grid: readonly (readonly unknown[])[],
  section: ModuleEpResolvedSection,
  baseCol: number,
  slot: WorkshopAssistModuleSlot,
  isAssist: boolean,
): ModulesEpEquippedSubstat[] {
  const { substatStartRow, substatEndRow, spareRow, dataRow } = section
  if (substatStartRow == null) return []

  const substatRowStart =
    isAssist && spareRow != null && substatStartRow <= spareRow ? spareRow + 1 : substatStartRow

  const out: ModulesEpEquippedSubstat[] = []
  for (let row = substatRowStart; row <= substatEndRow; row += 1) {
    if (row <= dataRow) continue
    const name = cellAt(grid, row, baseCol)
    const rarityLabel = cellAt(grid, row, baseCol + 1)
    if (!name && !rarityLabel) continue
    const base = submoduleFromSheetLabel(slot, name)
    if (!base) continue
    const rarity = moduleEpSubmoduleRarityFromSheetLabel(rarityLabel)
    if (!rarity) continue
    out.push({ ...base, rarity })
  }
  return out
}

function readEquippedCandidates(
  grid: readonly (readonly unknown[])[],
  section: ModuleEpResolvedSection,
  slot: WorkshopAssistModuleSlot,
): EquippedCandidate[] {
  const nameRow = section.dataRow - 1
  const out: EquippedCandidate[] = []

  for (const column of section.modules) {
    const rarityLabel = cellAt(grid, section.dataRow, column.baseCol)
    if (!rarityLabel || rarityLabel === MODULE_EP_EMPTY_RARITY_SHEET_LABEL) continue
    const mergeTier = moduleEpMergeTierFromSheetLabel(rarityLabel)
    if (!mergeTier) continue

    const nameLabel = cellAt(grid, nameRow, column.baseCol)
    const moduleId =
      sheetLabelToModuleId(slot, nameLabel) ??
      (column.moduleId.startsWith('__') ? null : column.moduleId)
    if (!moduleId || moduleId.startsWith('__')) continue

    out.push({
      moduleId,
      column,
      mergeTier,
      substats: readSubstats(grid, section, column.baseCol, slot, false),
    })
  }

  return out
}

function assignMainAssist(
  candidates: EquippedCandidate[],
): { main?: EquippedCandidate; assist?: EquippedCandidate } {
  if (candidates.length === 0) return {}
  if (candidates.length === 1) return { main: candidates[0] }

  const sorted = [...candidates].sort((a, b) => a.column.baseCol - b.column.baseCol)
  const anyOtherIdx = sorted.findIndex((c) => c.column.moduleId.startsWith('__'))
  if (anyOtherIdx >= 0 && sorted.length >= 2) {
    const assist = sorted[anyOtherIdx]!
    const main = sorted.find((c) => c !== assist)
    return { main, assist }
  }
  return { main: sorted[0], assist: sorted[1] }
}

/** Read equipped modules and sidebar levels from Modules Inventory sheet grid. */
export function modulesEpStateFromSheetGrid(
  grid: readonly (readonly unknown[])[],
  layout: ModuleEpResolvedLayout,
): ModulesEpSyncState {
  const sectionLevels = modulesEpDefaultSectionLevels()
  const modules: ModulesEpEquippedModule[] = []

  for (const slot of WORKSHOP_ASSIST_MODULE_SLOTS) {
    const section = layout.sections[slot]
    if (!section) continue

    const { highestPrimaryLevelCell, highestAssistLevelCell } = section
    if (highestPrimaryLevelCell) {
      sectionLevels[slot]!.highestPrimaryLevel = parseSidebarLevel(
        grid,
        highestPrimaryLevelCell.row,
        highestPrimaryLevelCell.col,
      )
    }
    if (highestAssistLevelCell) {
      sectionLevels[slot]!.highestAssistLevel = parseSidebarLevel(
        grid,
        highestAssistLevelCell.row,
        highestAssistLevelCell.col,
      )
    }

    const candidates = readEquippedCandidates(grid, section, slot)
    const { main, assist } = assignMainAssist(candidates)

    if (main) {
      modules.push({
        moduleId: main.moduleId,
        hubSlot: slot,
        role: 'main',
        mergeTier: main.mergeTier,
        level: sectionLevels[slot]!.highestPrimaryLevel,
        substats: readSubstats(grid, section, main.column.baseCol, slot, false),
      })
    }
    if (assist) {
      modules.push({
        moduleId: assist.moduleId,
        hubSlot: slot,
        role: 'assist',
        mergeTier: assist.mergeTier,
        level: sectionLevels[slot]!.highestAssistLevel,
        substats: readSubstats(grid, section, assist.column.baseCol, slot, true),
      })
    }
  }

  return { modules, sectionLevels }
}
