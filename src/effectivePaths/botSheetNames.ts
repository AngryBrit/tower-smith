import type { WorkshopBotId, WorkshopBotSpecialLevelKey, WorkshopBotUpgradeKey } from '../data/workshopBotsData'
import { WORKSHOP_BOT_ORDER } from '../data/workshopBotsData'
import { BOT_LAB_NAMES } from '../playerSave/gameBotLabMapping'

export type BotEpLevelKey = WorkshopBotUpgradeKey | WorkshopBotSpecialLevelKey

const EP_BOT_SHEET_NAMES: Record<WorkshopBotId, string> = {
  flame: 'Flame Bot',
  thunder: 'Thunder Bot',
  golden: 'Golden Bot',
  amplify: 'Amplify Bot',
  botBot: 'Bot Bot',
}

/** Bots v3.1 Master Sheet — five farming preset level rows (column G) per bot. */
export const BOT_EP_V31_STATS_PER_BOT = 5 as const

/** Column G farming block (all bots): rows 3–27 inclusive. */
export const BOT_EP_V31_FARMING_LEVEL_FIRST_ROW = 3 as const
export const BOT_EP_V31_FARMING_LEVEL_LAST_ROW = 27 as const

/** First Google Sheet row (1-based) for column G farming levels per bot. */
export const BOT_EP_V31_FARMING_LEVEL_START_ROWS: Record<WorkshopBotId, number> = {
  flame: 3,
  thunder: 8,
  golden: 13,
  amplify: 18,
  botBot: 23,
}

/** Medal + Bot+ level keys in Master Sheet row order (G start row + offset). */
export const BOT_EP_V31_LEVEL_KEY_ORDER: Record<WorkshopBotId, readonly BotEpLevelKey[]> = {
  flame: [
    'flameBotDamageReductionLevel',
    'flameBotCooldownLevel',
    'flameBotDamageLevel',
    'flameBotRangeLevel',
    'flameBotBurningGroundLevel',
  ],
  thunder: [
    'thunderBotDurationLevel',
    'thunderBotCooldownLevel',
    'thunderBotLingerLevel',
    'thunderBotRangeLevel',
    'thunderBotTitanShockLevel',
  ],
  golden: [
    'goldenBotDurationLevel',
    'goldenBotCooldownLevel',
    'goldenBotBonusLevel',
    'goldenBotRangeLevel',
    'goldenBotBonusCellsLevel',
  ],
  amplify: [
    'amplifyBotDurationLevel',
    'amplifyBotCooldownLevel',
    'amplifyBotBonusLevel',
    'amplifyBotRangeLevel',
    'amplifyBotEchoingShotLevel',
  ],
  botBot: [
    'botBotDurationLevel',
    'botBotCooldownLevel',
    'botBotBonusLevel',
    'botBotRangeLevel',
    'botBotMaximumPowerLevel',
  ],
}

/** First row of each bot block (same as first G farming row). */
export const BOT_EP_V31_HEADER_ROWS: readonly { rowIndex: number; botId: WorkshopBotId }[] =
  WORKSHOP_BOT_ORDER.map((botId) => ({
    rowIndex: BOT_EP_V31_FARMING_LEVEL_START_ROWS[botId],
    botId,
  }))

const EP_BOT_ATTR_LEVEL_KEYS: Record<WorkshopBotId, Record<string, BotEpLevelKey>> = {
  flame: {
    damage: 'flameBotDamageLevel',
    cooldown: 'flameBotCooldownLevel',
    range: 'flameBotRangeLevel',
    'damage reduction': 'flameBotDamageReductionLevel',
    'damage r': 'flameBotDamageReductionLevel',
    'damage r.': 'flameBotDamageReductionLevel',
    wildfire: 'flameBotBurningGroundLevel',
    'burning ground': 'flameBotBurningGroundLevel',
  },
  thunder: {
    duration: 'thunderBotDurationLevel',
    cooldown: 'thunderBotCooldownLevel',
    bonus: 'thunderBotLingerLevel',
    linger: 'thunderBotLingerLevel',
    range: 'thunderBotRangeLevel',
    'titan shock': 'thunderBotTitanShockLevel',
  },
  golden: {
    duration: 'goldenBotDurationLevel',
    cooldown: 'goldenBotCooldownLevel',
    bonus: 'goldenBotBonusLevel',
    range: 'goldenBotRangeLevel',
    'bonus cell': 'goldenBotBonusCellsLevel',
    'bonus cells': 'goldenBotBonusCellsLevel',
  },
  amplify: {
    duration: 'amplifyBotDurationLevel',
    cooldown: 'amplifyBotCooldownLevel',
    bonus: 'amplifyBotBonusLevel',
    range: 'amplifyBotRangeLevel',
    'echoing shot': 'amplifyBotEchoingShotLevel',
  },
  botBot: {
    duration: 'botBotDurationLevel',
    cooldown: 'botBotCooldownLevel',
    bonus: 'botBotBonusLevel',
    range: 'botBotRangeLevel',
    'maximum power': 'botBotMaximumPowerLevel',
    'max power': 'botBotMaximumPowerLevel',
    'bot+': 'botBotMaximumPowerLevel',
    'bot +': 'botBotMaximumPowerLevel',
  },
}

const EP_BOT_LAB_ALIASES: Record<string, string> = {
  'gold bot - cooldown': 'Golden Bot - Cooldown',
  'gold bot - duration': 'Golden Bot - Duration',
  'amp bot - cooldown': 'Amplify Bot - Cooldown',
  'amp bot - duration': 'Amplify Bot - Duration',
}

function normalizeSheetLabel(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[✓✔]/g, '')
    .replace(/[.]+$/g, '')
    .replace(/\s+locked$/g, '')
    .replace(/\s+unlocked$/g, '')
}

const BOT_STATUS_LABELS = new Set(['locked', 'unlocked', 'true', 'false'])

/** EP sheet status text in C/D — not a medal attribute. */
export function isBotSheetStatusLabel(value: string): boolean {
  const key = normalizeSheetLabel(value)
  return !key || BOT_STATUS_LABELS.has(key)
}

/** EP template filler rows — no TowerSmith medal (do not sync or warn). */
export function isBotEpIgnoredAttribute(botId: WorkshopBotId, attributeName: string): boolean {
  const key = normalizeSheetLabel(attributeName)
  if (botId === 'flame' && key === 'duration') return true
  return false
}

/** Map Effective Paths bot block title to workshop bot id. */
export function botIdFromSheetName(name: string): WorkshopBotId | null {
  const key = normalizeSheetLabel(name)
  if (!key || BOT_STATUS_LABELS.has(key)) return null
  for (const botId of WORKSHOP_BOT_ORDER) {
    const label = normalizeSheetLabel(EP_BOT_SHEET_NAMES[botId])
    if (key === label || key === botId || key.includes(label)) return botId
  }
  return null
}

/** Infer bot id from Bots v3.1 column G farming level row bands. */
export function botIdForSheetRow(rowIndex1Based: number): WorkshopBotId | null {
  for (const botId of WORKSHOP_BOT_ORDER) {
    const start = BOT_EP_V31_FARMING_LEVEL_START_ROWS[botId]
    if (rowIndex1Based >= start && rowIndex1Based < start + BOT_EP_V31_STATS_PER_BOT) {
      return botId
    }
  }
  return null
}

export function isBotEpV31HeaderRow(rowIndex1Based: number): boolean {
  return WORKSHOP_BOT_ORDER.some(
    (botId) => rowIndex1Based === BOT_EP_V31_FARMING_LEVEL_START_ROWS[botId],
  )
}

/** Google Sheet row (1-based) for column G farming level slot 0–4. */
export function botEpFarmingLevelRowIndex(botId: WorkshopBotId, statIndex0: number): number {
  return BOT_EP_V31_FARMING_LEVEL_START_ROWS[botId] + statIndex0
}

/** Rows 6/11/16/21/26 — Locked/Unlocked (C) and Farming Sync (H) on Bots v3.1. */
export const BOT_EP_V31_STATUS_ROW_OFFSET = 3 as const

export function botEpBotStatusRowIndex(botId: WorkshopBotId): number {
  return BOT_EP_V31_FARMING_LEVEL_START_ROWS[botId] + BOT_EP_V31_STATUS_ROW_OFFSET
}

/** Row 6/11/16/21/26 — C/H checkboxes (G on the same row is still a farming level). */
export function isBotEpBotStatusRow(rowIndex1Based: number, botId: WorkshopBotId): boolean {
  return botEpBotStatusRowIndex(botId) === rowIndex1Based
}

/** @deprecated Use botEpBotStatusRowIndex — same row as Locked/Unlocked. */
export function botEpFarmingSyncRowIndex(botId: WorkshopBotId): number {
  return botEpBotStatusRowIndex(botId)
}

/** Map attribute label within a bot block to persisted level key. */
export function botEpLevelKeyFromAttribute(
  botId: WorkshopBotId,
  attributeName: string,
): BotEpLevelKey | null {
  const key = normalizeSheetLabel(attributeName)
  if (!key || isBotSheetStatusLabel(attributeName) || isBotEpIgnoredAttribute(botId, attributeName)) {
    return null
  }
  return EP_BOT_ATTR_LEVEL_KEYS[botId][key] ?? null
}

/** Map OTHERS-section laboratory row label to canonical BOTS lab name. */
export function botLabNameFromSheetName(name: string): string | null {
  const trimmed = name.trim()
  if (!trimmed) return null
  const key = normalizeSheetLabel(trimmed)
  const alias = EP_BOT_LAB_ALIASES[key]
  if (alias) return alias
  for (const labName of BOT_LAB_NAMES) {
    if (normalizeSheetLabel(labName) === key) return labName
  }
  if (normalizeSheetLabel('Amplify Bot - Duration') === key) return 'Amplify Bot - Duration'
  if (normalizeSheetLabel('Bot Bot - Duration') === key) return 'Bot Bot - Duration'
  return null
}
