import {
  WORKSHOP_GAME_CARD_ORDER,
  workshopGameCardTitleId,
  type WorkshopGameCardId,
} from '../data/workshopGameCards'
import { STRINGS_EN } from '../i18n/dictionary'
/** Card dropdown cols (D,H,L,P,T) plus legacy mistaken cols (M,Q,U) for label recovery. */
const PRESET_LABEL_SCAN_COLS = [3, 7, 11, 12, 15, 16, 19, 20] as const
const PRESET_LABEL_SCAN_START_ROW = 4
const PRESET_LABEL_SCAN_END_ROW = 32

/** Normalize card names for Effective Paths sheet matching. */
export function normalizeEffectivePathsCardName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/['']/g, '')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const NAME_TO_CARD_ID = new Map<string, WorkshopGameCardId>()

for (const id of WORKSHOP_GAME_CARD_ORDER) {
  const label = STRINGS_EN[workshopGameCardTitleId(id)]
  if (!label) continue
  const key = normalizeEffectivePathsCardName(label)
  if (!key || NAME_TO_CARD_ID.has(key)) continue
  NAME_TO_CARD_ID.set(key, id)
}

const EFFECTIVE_PATHS_CARD_NAME_ALIASES: Readonly<Record<string, WorkshopGameCardId>> = {
  [normalizeEffectivePathsCardName('Land Mine Stun')]: 'landMineStun',
  [normalizeEffectivePathsCardName('Landmine Stun')]: 'landMineStun',
  [normalizeEffectivePathsCardName('Area Of Effect')]: 'areaOfEffect',
}

for (const [alias, id] of Object.entries(EFFECTIVE_PATHS_CARD_NAME_ALIASES)) {
  if (!NAME_TO_CARD_ID.has(alias)) NAME_TO_CARD_ID.set(alias, id)
}

/** Map an Effective Paths card name cell to a TowerSmith card id, if known. */
export function workshopCardIdFromSheetName(sheetName: string): WorkshopGameCardId | null {
  const key = normalizeEffectivePathsCardName(sheetName)
  if (!key) return null
  return NAME_TO_CARD_ID.get(key) ?? null
}

export function isCardEquipSlotsSheetName(name: string): boolean {
  return /card\s*slot/i.test(name.trim())
}

function cellValueToString(raw: unknown): string {
  if (raw == null) return ''
  if (typeof raw === 'boolean') return raw ? 'TRUE' : 'FALSE'
  if (typeof raw === 'number') return String(raw)
  return String(raw).trim()
}

/** Collect exact card labels from name cells (for dropdown validation). */
export function effectivePathsCardSheetLabelsFromNameCells(
  rows: readonly (readonly unknown[])[],
  cells: readonly { row: number; col: number }[],
): ReadonlyMap<WorkshopGameCardId, string> {
  const out = new Map<WorkshopGameCardId, string>()
  for (const cell of cells) {
    const name = cellValueToString(rows[cell.row]?.[cell.col])
    const id = workshopCardIdFromSheetName(name)
    if (id && name) out.set(id, name)
  }
  return out
}

export function effectivePathsCardSheetLabelsFromCardRows(
  rows: readonly (readonly unknown[])[],
  cardRows: readonly { rowIndex: number; kind: 'card' | 'equip_slots' }[],
  nameCol: number,
): ReadonlyMap<WorkshopGameCardId, string> {
  const cells = cardRows
    .filter((row) => row.kind === 'card')
    .map((row) => ({ row: row.rowIndex - 1, col: nameCol }))
  return effectivePathsCardSheetLabelsFromNameCells(rows, cells)
}

export function effectivePathsCardSheetLabelsFromPresetGrid(
  rows: readonly (readonly unknown[])[],
): ReadonlyMap<WorkshopGameCardId, string> {
  const cells: { row: number; col: number }[] = []
  for (const col of PRESET_LABEL_SCAN_COLS) {
    for (let row = PRESET_LABEL_SCAN_START_ROW; row < PRESET_LABEL_SCAN_END_ROW; row++) {
      cells.push({ row, col })
    }
  }
  return effectivePathsCardSheetLabelsFromNameCells(rows, cells)
}

export function mergeEffectivePathsCardSheetLabels(
  ...sources: readonly ReadonlyMap<WorkshopGameCardId, string>[]
): ReadonlyMap<WorkshopGameCardId, string> {
  const out = new Map<WorkshopGameCardId, string>()
  for (const source of sources) {
    for (const [id, name] of source) out.set(id, name)
  }
  return out
}

/**
 * Cards v3.x Card Preset dropdown spellings (manual list on D/H/L/P/T cells).
 * Matches the Effective Paths workbook validation list A→Z.
 */
export function effectivePathsCardPresetDropdownLabels(): ReadonlyMap<
  WorkshopGameCardId,
  string
> {
  const out = new Map<WorkshopGameCardId, string>()
  for (const id of WORKSHOP_GAME_CARD_ORDER) {
    out.set(id, STRINGS_EN[workshopGameCardTitleId(id)])
  }
  return out
}

/** English Effective Paths label for a TowerSmith card id (matches Master Sheet / Card Preset). */
export function workshopCardSheetNameFromId(
  id: WorkshopGameCardId,
  sheetLabels?: ReadonlyMap<WorkshopGameCardId, string>,
): string {
  return sheetLabels?.get(id) ?? STRINGS_EN[workshopGameCardTitleId(id)]
}
