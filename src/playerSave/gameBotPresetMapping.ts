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

/**
 * `levels[]` / `selectedLevels[]` order for every bot (not workshop UI row order):
 * `[cooldown, range, weaponStat2, weaponStat4]`.
 */
export const BOT_SAVE_LEVEL_INDEX = {
  cooldown: 0,
  range: 1,
  weaponStat2: 2,
  weaponStat4: 3,
} as const

/** Map workshop upgrade keys → save array index (all bots share the layout above). */
export const BOT_SAVE_LEVEL_INDEX_BY_WORKSHOP_KEY: Record<
  WorkshopBotId,
  Partial<Record<WorkshopBotUpgradeKey, number>>
> = {
  flame: {
    flameBotCooldownLevel: BOT_SAVE_LEVEL_INDEX.cooldown,
    flameBotRangeLevel: BOT_SAVE_LEVEL_INDEX.range,
    flameBotDamageLevel: BOT_SAVE_LEVEL_INDEX.weaponStat2,
    flameBotDamageReductionLevel: BOT_SAVE_LEVEL_INDEX.weaponStat4,
  },
  thunder: {
    thunderBotCooldownLevel: BOT_SAVE_LEVEL_INDEX.cooldown,
    thunderBotRangeLevel: BOT_SAVE_LEVEL_INDEX.range,
    thunderBotLingerLevel: BOT_SAVE_LEVEL_INDEX.weaponStat2,
    thunderBotDurationLevel: BOT_SAVE_LEVEL_INDEX.weaponStat4,
  },
  golden: {
    goldenBotCooldownLevel: BOT_SAVE_LEVEL_INDEX.cooldown,
    goldenBotRangeLevel: BOT_SAVE_LEVEL_INDEX.range,
    goldenBotBonusLevel: BOT_SAVE_LEVEL_INDEX.weaponStat2,
    goldenBotDurationLevel: BOT_SAVE_LEVEL_INDEX.weaponStat4,
  },
  amplify: {
    amplifyBotCooldownLevel: BOT_SAVE_LEVEL_INDEX.cooldown,
    amplifyBotRangeLevel: BOT_SAVE_LEVEL_INDEX.range,
    amplifyBotBonusLevel: BOT_SAVE_LEVEL_INDEX.weaponStat2,
    amplifyBotDurationLevel: BOT_SAVE_LEVEL_INDEX.weaponStat4,
  },
  botBot: {
    botBotCooldownLevel: BOT_SAVE_LEVEL_INDEX.cooldown,
    botBotRangeLevel: BOT_SAVE_LEVEL_INDEX.range,
    botBotBonusLevel: BOT_SAVE_LEVEL_INDEX.weaponStat2,
    botBotDurationLevel: BOT_SAVE_LEVEL_INDEX.weaponStat4,
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
