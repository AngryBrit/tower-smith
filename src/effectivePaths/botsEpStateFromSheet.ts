import type { WorkshopBotId } from '../data/workshopBotsData'
import { WORKSHOP_BOT_ORDER } from '../data/workshopBotsData'
import type { BotsEpSyncState } from './botsEpStateFromPersisted'
import {
  BOT_EP_V31_FARMING_LEVEL_START_ROWS,
  BOT_EP_V31_LEVEL_KEY_ORDER,
  botEpBotStatusRowIndex,
  botLabNameFromSheetName,
} from './botSheetNames'
import type { BotSheetLayout, EffectivePathsBotLabRow } from './botSheetLayout'
import { BOT_FARMING_LEVEL_COL, BOT_NAME_COL } from './botSheetLayout'
import { farmingDropdownLevelFromLabel, parseSheetBoolCell, parseSheetLevelCell } from './epSheetCellParsing'

/** Read Bots workbook sync state from Master Sheet grid. */
export function botsEpStateFromSheetGrid(
  grid: readonly (readonly unknown[])[],
  labRows: readonly EffectivePathsBotLabRow[],
  layout: BotSheetLayout,
): BotsEpSyncState {
  const levels: Record<string, number> = {}
  const ownedByBotId = {} as Record<WorkshopBotId, boolean>
  const labLevels: Record<string, number> = {}

  for (const botId of WORKSHOP_BOT_ORDER) {
    const statusRow = botEpBotStatusRowIndex(botId)
    ownedByBotId[botId] = parseSheetBoolCell(grid[statusRow - 1]?.[BOT_NAME_COL])

    const startRow = BOT_EP_V31_FARMING_LEVEL_START_ROWS[botId]
    const levelKeys = BOT_EP_V31_LEVEL_KEY_ORDER[botId]
    levelKeys.forEach((levelKey, index) => {
      const label = String(grid[startRow - 1 + index]?.[BOT_FARMING_LEVEL_COL] ?? '')
      const level = farmingDropdownLevelFromLabel(label)
      if (level != null) levels[levelKey] = level
    })
  }

  for (const row of labRows) {
    const labName = botLabNameFromSheetName(row.name)
    if (!labName) continue
    const level = parseSheetLevelCell(grid[row.rowIndex - 1]?.[layout.labLevelCol])
    if (level != null) labLevels[labName] = level
  }

  return { levels, ownedByBotId, labLevels }
}
