import { describe, expect, it } from 'vitest'
import {
  botEpBotStatusRowIndex,
  botEpFarmingLevelRowIndex,
  botEpLevelKeyFromAttribute,
  botIdForSheetRow,
  botIdFromSheetName,
  botLabNameFromSheetName,
  isBotEpBotStatusRow,
} from './botSheetNames'

describe('botSheetNames', () => {
  it('maps bot block titles', () => {
    expect(botIdFromSheetName('Flame Bot')).toBe('flame')
    expect(botIdFromSheetName('Bot Bot')).toBe('botBot')
    expect(botIdFromSheetName('Locked')).toBeNull()
    expect(botIdFromSheetName('Unlocked')).toBeNull()
  })

  it('maps Locked/Unlocked and Sync to status rows 6/11/16/21/26', () => {
    expect(botEpBotStatusRowIndex('flame')).toBe(6)
    expect(botEpBotStatusRowIndex('thunder')).toBe(11)
    expect(botEpBotStatusRowIndex('golden')).toBe(16)
    expect(botEpBotStatusRowIndex('amplify')).toBe(21)
    expect(botEpBotStatusRowIndex('botBot')).toBe(26)
    expect(isBotEpBotStatusRow(6, 'flame')).toBe(true)
    expect(isBotEpBotStatusRow(7, 'flame')).toBe(false)
  })

  it('maps column G farming rows to bot bands', () => {
    expect(botEpFarmingLevelRowIndex('flame', 0)).toBe(3)
    expect(botEpFarmingLevelRowIndex('flame', 4)).toBe(7)
    expect(botEpFarmingLevelRowIndex('thunder', 0)).toBe(8)
    expect(botEpFarmingLevelRowIndex('thunder', 4)).toBe(12)
    expect(botEpFarmingLevelRowIndex('botBot', 4)).toBe(27)
    expect(botIdForSheetRow(3)).toBe('flame')
    expect(botIdForSheetRow(7)).toBe('flame')
    expect(botIdForSheetRow(8)).toBe('thunder')
    expect(botIdForSheetRow(12)).toBe('thunder')
    expect(botIdForSheetRow(13)).toBe('golden')
    expect(botIdForSheetRow(23)).toBe('botBot')
    expect(botIdForSheetRow(2)).toBeNull()
    expect(botIdForSheetRow(28)).toBeNull()
  })

  it('maps flame attributes including Wildfire and Damage R.', () => {
    expect(botEpLevelKeyFromAttribute('flame', 'Damage')).toBe('flameBotDamageLevel')
    expect(botEpLevelKeyFromAttribute('flame', 'Damage R.')).toBe('flameBotDamageReductionLevel')
    expect(botEpLevelKeyFromAttribute('flame', 'Duration')).toBeNull()
    expect(botEpLevelKeyFromAttribute('thunder', 'Duration')).toBe('thunderBotDurationLevel')
    expect(botEpLevelKeyFromAttribute('flame', 'Wildfire')).toBe('flameBotBurningGroundLevel')
    expect(botEpLevelKeyFromAttribute('flame', 'Locked')).toBeNull()
  })

  it('maps thunder Bonus to linger level', () => {
    expect(botEpLevelKeyFromAttribute('thunder', 'Bonus')).toBe('thunderBotLingerLevel')
    expect(botEpLevelKeyFromAttribute('thunder', 'Titan Shock')).toBe('thunderBotTitanShockLevel')
  })

  it('maps Bot Bot Maximum Power aliases', () => {
    expect(botEpLevelKeyFromAttribute('botBot', 'Maximum Power')).toBe('botBotMaximumPowerLevel')
    expect(botEpLevelKeyFromAttribute('botBot', 'Max Power')).toBe('botBotMaximumPowerLevel')
    expect(botEpLevelKeyFromAttribute('botBot', 'Bot+')).toBe('botBotMaximumPowerLevel')
  })

  it('maps laboratory aliases', () => {
    expect(botLabNameFromSheetName('Gold Bot - Duration')).toBe('Golden Bot - Duration')
    expect(botLabNameFromSheetName('Flame Bot - Cooldown')).toBe('Flame Bot - Cooldown')
    expect(botLabNameFromSheetName('Bot Bot - Duration')).toBe('Bot Bot - Duration')
  })
})
