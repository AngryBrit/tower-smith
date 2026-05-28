import type { DecodedPlayerSave } from './decodePlayerInfo'

/**
 * Bot cooldown labs are stored outside `researchLevel[]` on PlayerData.
 * See SaveLoad.PlayerData `*BotLevelCooldownSelected` (Lab.cs mirrors these).
 */
export const BOT_COOLDOWN_LAB_SAVE_FIELD = {
  'Flame Bot - Cooldown': 'flameBotLevelCooldownSelected',
  'Thunder Bot - Cooldown': 'thunderBotLevelCooldownSelected',
  'Golden Bot - Cooldown': 'goldenBotLevelCooldownSelected',
  'Amplify Bot - Cooldown': 'amplifyBotLevelCooldownSelected',
  'Bot Bot - Cooldown': 'botBotLevelCooldownSelected',
} as const satisfies Record<string, keyof DecodedPlayerSave>

export type BotCooldownLabName = keyof typeof BOT_COOLDOWN_LAB_SAVE_FIELD

/**
 * All ten bot labs use sequential `researchLevel[102..111]` (UI order).
 * Cooldown labs also mirror `*CooldownSelected` ints — import uses the higher level.
 */
export const BOT_COOLDOWN_RESEARCH_LEVEL_ID_BY_LAB_NAME = {
  'Flame Bot - Cooldown': 102,
  'Thunder Bot - Cooldown': 103,
  'Golden Bot - Cooldown': 104,
  'Amplify Bot - Cooldown': 105,
  'Bot Bot - Cooldown': 106,
} as const satisfies Record<BotCooldownLabName, number>

export const BOT_RESEARCH_LEVEL_ID_BY_LAB_NAME = {
  'Flame Bot - Burn Stack': 107,
  'Thunder Bot - Linger Time': 108,
  'Golden Bot - Duration': 109,
  'Amplify Bot - Duration': 110,
  'Bot Bot - Duration': 111,
} as const satisfies Record<string, number>

export type BotResearchLabName = keyof typeof BOT_RESEARCH_LEVEL_ID_BY_LAB_NAME

export const BOT_LAB_NAMES = [
  ...Object.keys(BOT_COOLDOWN_LAB_SAVE_FIELD),
  ...Object.keys(BOT_RESEARCH_LEVEL_ID_BY_LAB_NAME),
] as const

export type BotLabName = (typeof BOT_LAB_NAMES)[number]
