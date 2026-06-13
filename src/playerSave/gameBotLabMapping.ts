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

/** Cooldown labs use ids 102–106 (UI order). */
export const BOT_COOLDOWN_RESEARCH_LEVEL_ID_BY_LAB_NAME = {
  'Flame Bot - Cooldown': 102,
  'Thunder Bot - Cooldown': 103,
  'Golden Bot - Cooldown': 104,
  'Amplify Bot - Cooldown': 105,
  'Bot Bot - Cooldown': 106,
} as const satisfies Record<BotCooldownLabName, number>

/**
 * Bot secondary labs in save order: burn stack 107, Golden duration 108, Thunder linger 109.
 * Amplify duration uses id 100 (lab-order 147); Bot Bot duration uses id 213 (lab-order 213).
 * Ids 110–111 are enemies (see gameEnemiesResearchMapping.ts).
 */
export const BOT_RESEARCH_LEVEL_ID_BY_LAB_NAME = {
  'Flame Bot - Burn Stack': 107,
  'Golden Bot - Duration': 108,
  'Thunder Bot - Linger Time': 109,
  'Amplify Bot - Duration': 100,
  'Bot Bot - Duration': 213,
} as const satisfies Record<string, number>

export type BotResearchLabName = keyof typeof BOT_RESEARCH_LEVEL_ID_BY_LAB_NAME

export const BOT_LAB_NAMES = [
  ...Object.keys(BOT_COOLDOWN_LAB_SAVE_FIELD),
  ...Object.keys(BOT_RESEARCH_LEVEL_ID_BY_LAB_NAME),
] as const

export type BotLabName = (typeof BOT_LAB_NAMES)[number]
