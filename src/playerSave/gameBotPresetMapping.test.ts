import { describe, expect, it } from 'vitest'
import { BOT_SAVE_LEVEL_INDEX, botSaveLevelIndex } from './gameBotPresetMapping'

describe('botSaveLevelIndex', () => {
  it('uses [cooldown, range, weaponStat2, weaponStat4] for Golden Bot', () => {
    expect(botSaveLevelIndex('golden', 'goldenBotCooldownLevel', 1)).toBe(
      BOT_SAVE_LEVEL_INDEX.cooldown,
    )
    expect(botSaveLevelIndex('golden', 'goldenBotRangeLevel', 3)).toBe(BOT_SAVE_LEVEL_INDEX.range)
    expect(botSaveLevelIndex('golden', 'goldenBotBonusLevel', 2)).toBe(
      BOT_SAVE_LEVEL_INDEX.weaponStat2,
    )
    expect(botSaveLevelIndex('golden', 'goldenBotDurationLevel', 0)).toBe(
      BOT_SAVE_LEVEL_INDEX.weaponStat4,
    )
  })

  it('uses the same save layout for Amplify and Bot Bot', () => {
    expect(botSaveLevelIndex('amplify', 'amplifyBotRangeLevel', 3)).toBe(
      BOT_SAVE_LEVEL_INDEX.range,
    )
    expect(botSaveLevelIndex('amplify', 'amplifyBotBonusLevel', 2)).toBe(
      BOT_SAVE_LEVEL_INDEX.weaponStat2,
    )
    expect(botSaveLevelIndex('amplify', 'amplifyBotDurationLevel', 0)).toBe(
      BOT_SAVE_LEVEL_INDEX.weaponStat4,
    )
    expect(botSaveLevelIndex('botBot', 'botBotRangeLevel', 3)).toBe(BOT_SAVE_LEVEL_INDEX.range)
    expect(botSaveLevelIndex('botBot', 'botBotBonusLevel', 2)).toBe(
      BOT_SAVE_LEVEL_INDEX.weaponStat2,
    )
  })

  it('uses the same save layout for Flame and Thunder bots', () => {
    expect(botSaveLevelIndex('flame', 'flameBotCooldownLevel', 1)).toBe(
      BOT_SAVE_LEVEL_INDEX.cooldown,
    )
    expect(botSaveLevelIndex('flame', 'flameBotRangeLevel', 3)).toBe(BOT_SAVE_LEVEL_INDEX.range)
    expect(botSaveLevelIndex('flame', 'flameBotDamageLevel', 2)).toBe(
      BOT_SAVE_LEVEL_INDEX.weaponStat2,
    )
    expect(botSaveLevelIndex('flame', 'flameBotDamageReductionLevel', 0)).toBe(
      BOT_SAVE_LEVEL_INDEX.weaponStat4,
    )
    expect(botSaveLevelIndex('thunder', 'thunderBotDurationLevel', 0)).toBe(
      BOT_SAVE_LEVEL_INDEX.weaponStat4,
    )
    expect(botSaveLevelIndex('thunder', 'thunderBotLingerLevel', 2)).toBe(
      BOT_SAVE_LEVEL_INDEX.weaponStat2,
    )
    expect(botSaveLevelIndex('thunder', 'thunderBotRangeLevel', 3)).toBe(
      BOT_SAVE_LEVEL_INDEX.range,
    )
  })
})
