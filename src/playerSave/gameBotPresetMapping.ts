import {
  WORKSHOP_BOT_ORDER,
  WORKSHOP_BOT_SPECIAL_BY_BOT,
  WORKSHOP_BOT_SPECIAL_LEVEL_BY_BOT,
  WORKSHOP_BOT_WEAPON_STATS,
  type WorkshopBotId,
  type WorkshopBotUpgradeKey,
} from '../data/workshopBotsData'

/**
 * Per-bot medal upgrade state: `List<UserBotData>` (4 entries = bot presets 0–3).
 * Each `UserBotData`: `unlocked`, `active`, `levels[4]`, `selectedLevels[4]`, `plusUnlocked`, `plusLevel`.
 * Import uses `currentBotPreset` to pick the slot for every bot at once.
 */
export const BOT_PRESET_LIST_FIELD_BY_BOT_ID = {
  flame: 'flameBotPresets',
  thunder: 'thunderBotPresets',
  golden: 'goldenBotPresets',
  amplify: 'amplifyBotPresets',
  botBot: 'botBotPresets',
} as const satisfies Record<WorkshopBotId, string>

/** `levels[]` index order matches `WORKSHOP_BOT_WEAPON_STATS[botId]` (UI stat order). */
export const BOT_SAVE_LEVEL_INDEX_BY_WORKSHOP_KEY: Partial<
  Record<WorkshopBotId, Partial<Record<WorkshopBotUpgradeKey, number>>>
> = {
  flame: {
    flameBotDamageReductionLevel: 0,
    flameBotCooldownLevel: 1,
    flameBotDamageLevel: 2,
    flameBotRangeLevel: 3,
  },
  thunder: {
    thunderBotDurationLevel: 0,
    thunderBotCooldownLevel: 1,
    thunderBotLingerLevel: 2,
    thunderBotRangeLevel: 3,
  },
  amplify: {
    amplifyBotDurationLevel: 0,
    amplifyBotCooldownLevel: 1,
    amplifyBotBonusLevel: 2,
    amplifyBotRangeLevel: 3,
  },
  botBot: {
    botBotDurationLevel: 0,
    botBotCooldownLevel: 1,
    botBotBonusLevel: 2,
    botBotRangeLevel: 3,
  },
  /** Save order differs from UI: [cooldown, range, bonus, duration] (bonus/range swapped vs Amplify). */
  golden: {
    goldenBotCooldownLevel: 0,
    goldenBotRangeLevel: 1,
    goldenBotBonusLevel: 2,
    goldenBotDurationLevel: 3,
  },
}

export function botSaveLevelIndex(
  botId: WorkshopBotId,
  workshopKey: WorkshopBotUpgradeKey,
  statIndexInWeaponStats: number,
): number {
  const byBot = BOT_SAVE_LEVEL_INDEX_BY_WORKSHOP_KEY[botId]
  const idx = byBot?.[workshopKey as keyof typeof byBot]
  if (idx != null) return idx
  return statIndexInWeaponStats
}

export function workshopKeysForBot(botId: WorkshopBotId): readonly WorkshopBotUpgradeKey[] {
  return WORKSHOP_BOT_WEAPON_STATS[botId].map((s) => s.key)
}

export { WORKSHOP_BOT_ORDER, WORKSHOP_BOT_SPECIAL_BY_BOT, WORKSHOP_BOT_SPECIAL_LEVEL_BY_BOT }
