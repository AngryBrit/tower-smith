import { CHASSIS_MODULE_ORDERS, workshopChassisModuleDefForSlot } from '../data/workshopChassisModuleSelection'
import type { WorkshopAssistModuleSlot } from '../data/workshopSimModules'
import {
  MODULE_EP_INVENTORY_SUBSTAT_BANDS,
  moduleEpInventoryAssistLevelRow,
} from './moduleEpInventoryLayout'
import { padSheetRowsToWidth } from './relicSheetLayout'

export type ModuleEpResolvedModuleColumn = {
  moduleId: string
  /** 0-based column index for rarity (level = +1, stat = +2). */
  baseCol: number
}

export type ModuleEpSheetCell = {
  /** 1-based sheet row. */
  row: number
  /** 0-based column index. */
  col: number
}

export type ModuleEpResolvedSection = {
  slot: WorkshopAssistModuleSlot
  /** 1-based sheet row with rarity / level / stat. */
  dataRow: number
  /** Sidebar “Highest Level” value cell; null when not present on this layout. */
  highestPrimaryLevelCell: ModuleEpSheetCell | null
  /** Sidebar “Assist Level” value cell; null when not present on this layout. */
  highestAssistLevelCell: ModuleEpSheetCell | null
  /** 1-based sheet row for first substat name; null when no substat band exists. */
  substatStartRow: number | null
  /** 1-based last row (inclusive) for substat writes in this section. */
  substatEndRow: number
  /** 1-based spare-row label for assist / unlisted modules; null to skip. */
  spareRow: number | null
  /** Column stride between module blocks (3 = v6.1.2 grid, 5 = compact Inventory). */
  blockStride: number
  modules: readonly ModuleEpResolvedModuleColumn[]
}

export type ModuleEpResolvedLayout = {
  variant: 'v612' | 'compact' | 'fallback'
  sections: Record<WorkshopAssistModuleSlot, ModuleEpResolvedSection>
}

const SECTION_SLOTS: WorkshopAssistModuleSlot[] = ['cannon', 'armor', 'generator', 'core']

const SECTION_ROW_MARKERS: Record<WorkshopAssistModuleSlot, RegExp> = {
  cannon: /cannon/i,
  armor: /armor/i,
  generator: /generator/i,
  core: /core/i,
}

const MERGE_TIER_CELL =
  /^(none|common|rare|rare\+|epic|epic\+|legendary|legendary\+|mythic|mythic\+|ancestral(\s+\d\*)?)$/i

function cell(rows: string[][], row: number, col: number): string {
  return (rows[row]?.[col] ?? '').trim()
}

function rowText(rows: string[][], row: number, maxCol = 8): string {
  return (rows[row] ?? []).slice(0, maxCol).join(' ').trim()
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

function isSectionLabel(text: string): boolean {
  return SECTION_SLOTS.some((slot) => SECTION_ROW_MARKERS[slot].test(text))
}

function isSidebarLabel(text: string): boolean {
  const lower = text.trim().toLowerCase()
  return (
    lower === 'highest level' ||
    lower === 'assist level' ||
    /^tower /.test(lower) ||
    /^coin /.test(lower) ||
    /^uw /.test(lower)
  )
}

function findFirstModuleBaseCol(dataRow: string[]): number {
  for (let c = 2; c < dataRow.length - 2; c += 1) {
    const value = dataRow[c]?.trim() ?? ''
    if (MERGE_TIER_CELL.test(value)) return c
  }
  return 5
}

function detectBlockStride(dataRow: string[], firstCol: number): number {
  for (let c = firstCol + 1; c < dataRow.length; c += 1) {
    const value = dataRow[c]?.trim() ?? ''
    if (MERGE_TIER_CELL.test(value)) return c - firstCol
  }
  return 3
}

function labelAtModuleColumn(
  slot: WorkshopAssistModuleSlot,
  nameRow: string[],
  col: number,
): string | null {
  const raw = nameRow[col]?.trim() ?? ''
  if (!raw) return null
  if (/^rarity$/i.test(raw)) return null

  const stripped = raw.replace(/\s+Rarity$/i, '').trim()
  if (sheetLabelToModuleId(slot, stripped)) return stripped
  if (/any other 2/i.test(raw)) return 'Any Other 2'
  if (/any other/i.test(raw)) return 'Any Other'

  for (const moduleId of CHASSIS_MODULE_ORDERS[slot]) {
    const name = workshopChassisModuleDefForSlot(slot, moduleId).name
    if (raw.includes(name)) return name
  }
  return null
}

function collectNameRowLabels(nameRow: string[]): string[] {
  const labels: string[] = []
  for (let c = 2; c < nameRow.length; c += 1) {
    const text = nameRow[c]?.trim() ?? ''
    if (!text) continue
    if (isSectionLabel(text)) continue
    if (isSidebarLabel(text)) continue
    if (/^[🔵🟥▲🔶]/.test(text)) continue
    if (/^rarity$/i.test(text)) continue
    labels.push(text)
  }
  return labels
}

function parseModuleColumns(
  slot: WorkshopAssistModuleSlot,
  nameRow: string[],
  dataRow: string[],
): { modules: ModuleEpResolvedModuleColumn[]; blockStride: number } {
  const firstCol = findFirstModuleBaseCol(dataRow)
  const blockStride = detectBlockStride(dataRow, firstCol)
  const modules: ModuleEpResolvedModuleColumn[] = []

  if (blockStride === 3) {
    const labels = collectNameRowLabels(nameRow)
    for (let i = 0; i < labels.length; i += 1) {
      const moduleId = sheetLabelToModuleId(slot, labels[i]!)
      if (!moduleId) continue
      modules.push({ moduleId, baseCol: firstCol + i * blockStride })
    }
    return { modules, blockStride }
  }

  for (let c = firstCol; c < Math.max(nameRow.length, dataRow.length); c += blockStride) {
    const label = labelAtModuleColumn(slot, nameRow, c)
    if (!label) continue
    const moduleId = sheetLabelToModuleId(slot, label)
    if (!moduleId) continue
    modules.push({ moduleId, baseCol: c })
  }

  return { modules, blockStride }
}

function findSectionNameRows(rows: string[][]): Partial<Record<WorkshopAssistModuleSlot, number>> {
  const bands: Partial<Record<WorkshopAssistModuleSlot, number>> = {}

  for (let r = 0; r < rows.length; r += 1) {
    const marker = rowText(rows, r, 4)
    for (const slot of SECTION_SLOTS) {
      if (bands[slot] != null) continue
      if (!SECTION_ROW_MARKERS[slot].test(marker)) continue
      bands[slot] = r
    }
  }

  return bands
}

const SIDEBAR_STAT_LABEL =
  /^(tower (damage|health)|coin bonus|uw damage)$/i

function findHighestPrimaryLevelCell(
  rows: string[][],
  nameRowIdx: number,
  dataRowIdx: number,
): ModuleEpSheetCell | null {
  const dataRow = rows[dataRowIdx] ?? []
  for (let c = 0; c < 6; c += 1) {
    const label = dataRow[c]?.trim() ?? ''
    if (!SIDEBAR_STAT_LABEL.test(label)) continue
    for (let v = c + 1; v <= c + 2; v += 1) {
      const val = dataRow[v]?.trim() ?? ''
      if (/^\d+$/.test(val)) {
        return { row: dataRowIdx + 1, col: v }
      }
    }
  }

  for (let r = nameRowIdx; r <= dataRowIdx; r += 1) {
    const row = rows[r] ?? []
    for (let c = 0; c < 8; c += 1) {
      if (row[c]?.trim().toLowerCase() !== 'highest level') continue
      return { row: dataRowIdx + 1, col: c }
    }
  }

  return null
}

function findHighestAssistLevelCell(
  rows: string[][],
  dataRowIdx: number,
  nextNameRowIdx: number,
  primaryCell: ModuleEpSheetCell | null,
  spareRow: number | null,
): ModuleEpSheetCell | null {
  const nextIdx = nextNameRowIdx - 1
  for (let r = dataRowIdx + 1; r < nextIdx; r += 1) {
    const marker = cell(rows, r, 1).toLowerCase()
    if (marker !== 'assist level') continue
    const valueRow = rows[r + 1] ?? []
    const val = valueRow[1]?.trim() ?? ''
    if (/^\d+$/.test(val)) {
      return { row: r + 2, col: 1 }
    }
  }

  if (spareRow != null && primaryCell != null) {
    return { row: spareRow, col: primaryCell.col }
  }

  return null
}

function findDataRowIndex(rows: string[][], nameRowIndex: number): number {
  for (let r = nameRowIndex + 1; r <= nameRowIndex + 3 && r < rows.length; r += 1) {
    const row = rows[r] ?? []
    const col = findFirstModuleBaseCol(row)
    if (MERGE_TIER_CELL.test(row[col]?.trim() ?? '')) return r
  }
  return nameRowIndex + 1
}

function findSubstatBounds(
  rows: string[][],
  dataRow: number,
  nextSectionNameRow: number,
): { substatStartRow: number | null; substatEndRow: number; spareRow: number | null } {
  const dataIdx = dataRow - 1
  const nextIdx = nextSectionNameRow - 1

  for (let r = dataIdx + 1; r < nextIdx; r += 1) {
    if (cell(rows, r, 1).toLowerCase().includes('assist level')) {
      return {
        substatStartRow: r + 1,
        substatEndRow: Math.max(r + 1, nextIdx - 1),
        spareRow: r > dataIdx ? r : null,
      }
    }
  }

  if (nextIdx > dataIdx + 1) {
    const substatStartRow = dataIdx + 2
    return {
      substatStartRow,
      substatEndRow: Math.max(substatStartRow, nextIdx - 1),
      spareRow: substatStartRow,
    }
  }

  return { substatStartRow: null, substatEndRow: dataRow, spareRow: null }
}

function detectLayoutVariant(
  rows: string[][],
  sections: Record<WorkshopAssistModuleSlot, ModuleEpResolvedSection>,
): ModuleEpResolvedLayout['variant'] {
  const cannon = sections.cannon
  if (!cannon) return 'fallback'
  if (cannon.blockStride === 5) return 'compact'
  if (/module inventory/i.test(cell(rows, 0, 0)) && !SECTION_ROW_MARKERS.cannon.test(cell(rows, 0, 0))) {
    return 'v612'
  }
  if (SECTION_ROW_MARKERS.cannon.test(cell(rows, 2, 1))) return 'v612'
  return cannon.blockStride === 3 ? 'v612' : 'compact'
}

/** Parse Inventory tab layout from live sheet rows. */
export function parseModuleEpInventoryLayoutFromSheet(rows: string[][]): ModuleEpResolvedLayout {
  const nameRows = findSectionNameRows(rows)
  const sectionOrder = SECTION_SLOTS.filter((slot) => nameRows[slot] != null)

  const sections = {} as Record<WorkshopAssistModuleSlot, ModuleEpResolvedSection>
  for (let i = 0; i < sectionOrder.length; i += 1) {
    const slot = sectionOrder[i]!
    const nameRowIdx = nameRows[slot]!
    const dataRowIdx = findDataRowIndex(rows, nameRowIdx)
    const { modules, blockStride } = parseModuleColumns(
      slot,
      rows[nameRowIdx] ?? [],
      rows[dataRowIdx] ?? [],
    )
    const nextNameRow =
      i + 1 < sectionOrder.length ? nameRows[sectionOrder[i + 1]!]! + 1 : rows.length + 1
    const { substatStartRow, substatEndRow, spareRow } = findSubstatBounds(
      rows,
      dataRowIdx + 1,
      nextNameRow,
    )
    const highestPrimaryLevelCell = findHighestPrimaryLevelCell(rows, nameRowIdx, dataRowIdx)
    const highestAssistLevelCell = findHighestAssistLevelCell(
      rows,
      dataRowIdx,
      nextNameRow,
      highestPrimaryLevelCell,
      spareRow,
    )

    sections[slot] = {
      slot,
      dataRow: dataRowIdx + 1,
      highestPrimaryLevelCell,
      highestAssistLevelCell,
      substatStartRow,
      substatEndRow,
      spareRow,
      blockStride,
      modules,
    }
  }

  for (const slot of SECTION_SLOTS) {
    if (!sections[slot]) {
      sections[slot] = fallbackSection(slot)
    }
  }

  const variant = detectLayoutVariant(rows, sections)
  if (variant === 'compact') {
    applyInventorySubstatBands(sections, true)
    applyCompactAssistLevelCells(sections)
  }

  return { variant, sections }
}

/** Compact stacks section headers; Assist Level uses v6.1.2 absolute sidebar rows (e.g. armor D21). */
function applyCompactAssistLevelCells(
  sections: Record<WorkshopAssistModuleSlot, ModuleEpResolvedSection>,
): void {
  for (const slot of SECTION_SLOTS) {
    const section = sections[slot]
    const primaryCol = section?.highestPrimaryLevelCell?.col
    if (!section || primaryCol == null) continue
    sections[slot] = {
      ...section,
      highestAssistLevelCell: {
        row: moduleEpInventoryAssistLevelRow(slot),
        col: primaryCol,
      },
    }
  }
}

/** Compact Inventory uses stacked data rows; substat dropdowns stay at v6.1.2 absolute rows. */
function applyInventorySubstatBands(
  sections: Record<WorkshopAssistModuleSlot, ModuleEpResolvedSection>,
  keepParsedSpareRow: boolean,
): void {
  for (const slot of SECTION_SLOTS) {
    const band = MODULE_EP_INVENTORY_SUBSTAT_BANDS[slot]
    const section = sections[slot]
    if (!section) continue
    sections[slot] = {
      ...section,
      substatStartRow: band.substatStartRow,
      substatEndRow: band.substatEndRow,
      spareRow: keepParsedSpareRow ? section.spareRow : band.spareRow,
    }
  }
}

function fallbackSection(slot: WorkshopAssistModuleSlot): ModuleEpResolvedSection {
  const legacy = FALLBACK_SECTIONS[slot]
  return {
    slot,
    dataRow: legacy.dataRow,
    highestPrimaryLevelCell: { row: legacy.dataRow, col: 3 },
    highestAssistLevelCell: {
      row: moduleEpInventoryAssistLevelRow(slot),
      col: 3,
    },
    substatStartRow: legacy.substatStartRow,
    substatEndRow: legacy.substatEndRow,
    spareRow: legacy.spareRow,
    blockStride: legacy.blockStride,
    modules: legacy.modules,
  }
}

const FALLBACK_SECTIONS: Record<
  WorkshopAssistModuleSlot,
  {
    dataRow: number
    substatStartRow: number
    substatEndRow: number
    spareRow: number
    blockStride: number
    modules: ModuleEpResolvedModuleColumn[]
  }
> = {
  cannon: {
    dataRow: 2,
    substatStartRow: 3,
    substatEndRow: 7,
    spareRow: 3,
    blockStride: 5,
    modules: [
      { moduleId: 'astralDeliverance', baseCol: 5 },
      { moduleId: 'beingAnnihilator', baseCol: 10 },
      { moduleId: 'deathPenalty', baseCol: 15 },
      { moduleId: 'havocBringer', baseCol: 20 },
      { moduleId: 'shrinkRay', baseCol: 25 },
      { moduleId: 'amplifyingStrike', baseCol: 30 },
      { moduleId: '__anyOther1', baseCol: 35 },
      { moduleId: '__anyOther2', baseCol: 40 },
    ],
  },
  armor: {
    dataRow: 6,
    substatStartRow: 7,
    substatEndRow: 7,
    spareRow: 7,
    blockStride: 5,
    modules: [
      { moduleId: 'antiCubePortal', baseCol: 5 },
      { moduleId: 'negativeMassProjector', baseCol: 10 },
      { moduleId: 'spaceDisplacer', baseCol: 15 },
      { moduleId: 'wormholeRedirector', baseCol: 20 },
      { moduleId: 'sharpFortitude', baseCol: 25 },
      { moduleId: 'orbitalAugment', baseCol: 30 },
      { moduleId: '__anyOther1', baseCol: 35 },
      { moduleId: '__anyOther2', baseCol: 40 },
    ],
  },
  generator: {
    dataRow: 10,
    substatStartRow: 11,
    substatEndRow: 11,
    spareRow: 11,
    blockStride: 5,
    modules: [
      { moduleId: 'blackHoleDigestor', baseCol: 5 },
      { moduleId: 'galaxyCompressor', baseCol: 10 },
      { moduleId: 'singularityHarness', baseCol: 15 },
      { moduleId: 'pulsarHarvester', baseCol: 20 },
      { moduleId: 'projectFunding', baseCol: 25 },
      { moduleId: 'restorativeBonus', baseCol: 30 },
      { moduleId: '__anyOther1', baseCol: 35 },
      { moduleId: '__anyOther2', baseCol: 40 },
    ],
  },
  core: {
    dataRow: 14,
    substatStartRow: 15,
    substatEndRow: 15,
    spareRow: 15,
    blockStride: 5,
    modules: [
      { moduleId: 'multiverseNexus', baseCol: 5 },
      { moduleId: 'dimensionCore', baseCol: 10 },
      { moduleId: 'harmonyConductor', baseCol: 15 },
      { moduleId: 'omChip', baseCol: 20 },
      { moduleId: 'magneticHook', baseCol: 25 },
      { moduleId: 'primordialCollapse', baseCol: 30 },
      { moduleId: '__anyOther1', baseCol: 35 },
      { moduleId: '__anyOther2', baseCol: 40 },
    ],
  },
}

/** @deprecated Use parseModuleEpInventoryLayoutFromSheet when sheet rows are available. */
export function legacyModuleEpInventoryLayout(): ModuleEpResolvedLayout {
  const sections = {} as Record<WorkshopAssistModuleSlot, ModuleEpResolvedSection>
  for (const slot of SECTION_SLOTS) {
    sections[slot] = fallbackSection(slot)
  }
  return { variant: 'fallback', sections }
}

/** @deprecated Alias for v612 tests — prefer parseModuleEpInventoryLayoutFromSheet. */
export function parseModuleEpInventoryLayoutV612(rows: string[][]): ModuleEpResolvedLayout {
  return parseModuleEpInventoryLayoutFromSheet(rows)
}

export function resolveModuleEpInventoryLayout(rows: readonly (readonly unknown)[]): ModuleEpResolvedLayout {
  const padded = padSheetRowsToWidth(rows, 50)
  const hasContent = padded.some((row) => row.some((cell) => cell.trim() !== ''))
  if (!hasContent) return legacyModuleEpInventoryLayout()
  return parseModuleEpInventoryLayoutFromSheet(padded)
}

export function moduleEpResolvedColumnForModule(
  section: ModuleEpResolvedSection,
  moduleId: string,
): ModuleEpResolvedModuleColumn | null {
  return section.modules.find((entry) => entry.moduleId === moduleId) ?? null
}

export function moduleEpResolvedAnyOtherColumn(
  section: ModuleEpResolvedSection,
  which: 1 | 2 = 1,
): ModuleEpResolvedModuleColumn | null {
  const moduleId = which === 1 ? '__anyOther1' : '__anyOther2'
  return section.modules.find((entry) => entry.moduleId === moduleId) ?? null
}
