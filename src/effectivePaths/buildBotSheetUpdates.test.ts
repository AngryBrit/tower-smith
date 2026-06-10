import { describe, expect, it } from 'vitest'
import {
  BOT_EP_STONES_SYMBOL,
  botEpFarmingLevelDropdownLabel,
  botEpFarmingLevelSheetValue,
  buildBotFarmingLevelCellUpdates,
  buildBotSheetUpdates,
} from './buildBotSheetUpdates'

const layout = {
  botNameCol: 2,
  attributeCol: 4,
  farmingLevelCol: 6,
  farmingSyncCol: 7,
  labNameCol: 19,
  labLevelCol: 23,
  startRow: 2,
  endRow: 28,
}

const state = {
  levels: {
    flameBotDamageReductionLevel: 10,
    flameBotCooldownLevel: 3,
    flameBotDamageLevel: 12,
    flameBotRangeLevel: 6,
    flameBotBurningGroundLevel: 2,
    goldenBotDurationLevel: 6,
    goldenBotCooldownLevel: 0,
    goldenBotBonusLevel: 0,
    goldenBotRangeLevel: 6,
    goldenBotBonusCellsLevel: 0,
  },
  ownedByBotId: { flame: true, thunder: false, golden: true, amplify: false, botBot: false },
  labLevels: { 'Flame Bot - Cooldown': 8 },
}

describe('botEpFarmingLevelDropdownLabel', () => {
  it('matches Flame Bot Wildfire (Bot+) dropdown spelling from Bots v3.1', () => {
    const s = BOT_EP_STONES_SYMBOL
    expect(botEpFarmingLevelDropdownLabel('flameBotBurningGroundLevel', 0)).toBe(
      `00 | x1.5 | Cost 0 ${s} | Next 100 ${s}`,
    )
  })

  it('matches Flame Bot Damage R. dropdown spelling from Bots v3.1', () => {
    const s = BOT_EP_STONES_SYMBOL
    expect(botEpFarmingLevelDropdownLabel('flameBotDamageReductionLevel', 0)).toBe(
      `00 | 20% | Cost 0 ${s} | Next 100 ${s}`,
    )
  })

  it('matches Flame Bot Damage mult dropdown spelling from Bots v3.1', () => {
    const s = BOT_EP_STONES_SYMBOL
    expect(botEpFarmingLevelDropdownLabel('flameBotDamageLevel', 0)).toBe(
      `00 | x50 | Cost 0 ${s} | Next 100 ${s}`,
    )
  })

  it('matches Golden Bot Duration dropdown spelling from Bots v3.1', () => {
    const s = BOT_EP_STONES_SYMBOL
    expect(botEpFarmingLevelDropdownLabel('goldenBotDurationLevel', 0)).toBe(
      `00 | 20.0s | Cost 0 ${s} | Next 100 ${s}`,
    )
    expect(botEpFarmingLevelDropdownLabel('goldenBotDurationLevel', 6)).toBe(
      `06 | 23.0s | Cost 300 ${s} | Next 340 ${s}`,
    )
    expect(botEpFarmingLevelDropdownLabel('goldenBotDurationLevel', 30)).toBe(
      `30 | 35.0s | Cost 1260 ${s} | Maxed`,
    )
    expect(botEpFarmingLevelDropdownLabel('goldenBotDurationLevel', 18)).toBe(
      `18 | 29.0s | Cost 780 ${s} | Next 820 ${s}`,
    )
  })

  it('matches Golden Bot Range dropdown spelling from Bots v3.1', () => {
    const s = BOT_EP_STONES_SYMBOL
    expect(botEpFarmingLevelDropdownLabel('goldenBotRangeLevel', 0)).toBe(
      `00 | 20m | Cost 0 ${s} | Next 100 ${s}`,
    )
    expect(botEpFarmingLevelDropdownLabel('goldenBotRangeLevel', 6)).toBe(
      `06 | 32m | Cost 300 ${s} | Next 340 ${s}`,
    )
  })

  it('matches Amplify Bot Range level 0 dropdown spelling from Bots v3.1', () => {
    const s = BOT_EP_STONES_SYMBOL
    expect(botEpFarmingLevelDropdownLabel('amplifyBotRangeLevel', 0)).toBe(
      `00 | 25m | Cost 0 ${s} | Next 100 ${s}`,
    )
  })

  it('matches Bot Bot Range level 0 dropdown spelling from Bots v3.1', () => {
    const s = BOT_EP_STONES_SYMBOL
    expect(botEpFarmingLevelDropdownLabel('botBotRangeLevel', 0)).toBe(
      `00 | 20m | Cost 0 ${s} | Next 100 ${s}`,
    )
  })

  it('matches Thunder Bot Range dropdown spelling from Bots v3.1', () => {
    const s = BOT_EP_STONES_SYMBOL
    expect(botEpFarmingLevelDropdownLabel('thunderBotRangeLevel', 0)).toBe(
      `00 | 25m | Cost 0 ${s} | Next 100 ${s}`,
    )
    expect(botEpFarmingLevelDropdownLabel('thunderBotRangeLevel', 7)).toBe(
      `07 | 46m | Cost 340 ${s} | Next 380 ${s}`,
    )
    expect(botEpFarmingLevelDropdownLabel('thunderBotRangeLevel', 9)).toBe(
      `09 | 52m | Cost 420 ${s} | Next 460 ${s}`,
    )
  })

  it('matches Golden Bot Bonus mult dropdown spelling from Bots v3.1', () => {
    const s = BOT_EP_STONES_SYMBOL
    expect(botEpFarmingLevelDropdownLabel('goldenBotBonusLevel', 10)).toBe(
      `10 | x4.0 | Cost 460 ${s} | Next 500 ${s}`,
    )
  })

  it('matches Golden Bot Cooldown dropdown spelling from Bots v3.1', () => {
    const s = BOT_EP_STONES_SYMBOL
    expect(botEpFarmingLevelDropdownLabel('goldenBotCooldownLevel', 4)).toBe(
      `04 | 108s | Cost 220 ${s} | Next 260 ${s}`,
    )
  })

  it('matches Bot Bot Bonus mult dropdown spelling from Bots v3.1', () => {
    const s = BOT_EP_STONES_SYMBOL
    expect(botEpFarmingLevelDropdownLabel('botBotBonusLevel', 10)).toBe(
      `10 | x1.55 | Cost 460 ${s} | Next 500 ${s}`,
    )
  })

  it('matches Bot Bot Maximum Power dropdown spelling from Bots v3.1', () => {
    const s = BOT_EP_STONES_SYMBOL
    expect(botEpFarmingLevelDropdownLabel('botBotMaximumPowerLevel', 19)).toBe(
      `19 | x2.20 | Cost 1000 ${s} | Next 1050 ${s}`,
    )
  })
})

describe('botEpFarmingLevelSheetValue', () => {
  it('returns clamped numeric levels', () => {
    expect(botEpFarmingLevelSheetValue('flameBotCooldownLevel', 6)).toBe(6)
    expect(botEpFarmingLevelSheetValue('flameBotCooldownLevel', 99)).toBe(15)
    expect(botEpFarmingLevelSheetValue('goldenBotDurationLevel', 99)).toBe(30)
  })
})

describe('buildBotFarmingLevelCellUpdates', () => {
  it('writes all five bot bands when the sheet is detected (not only parsed bots)', () => {
    const cells = buildBotFarmingLevelCellUpdates(
      [{ rowIndex: 3, botId: 'flame', attribute: 'Damage R.', levelKey: 'flameBotDamageReductionLevel' }],
      state,
    )
    expect(cells.find((cell) => cell.rowIndex === 26)).toEqual({
      rowIndex: 26,
      label: expect.stringMatching(/^00 \| 20m \|/),
    })
  })

  it('maps flame bot levels to G3–G7 dropdown labels', () => {
    const cells = buildBotFarmingLevelCellUpdates(
      [{ rowIndex: 3, botId: 'flame', attribute: 'Damage R.', levelKey: 'flameBotDamageReductionLevel' }],
      state,
    )

    expect(cells).toHaveLength(25)
    expect(cells.find((cell) => cell.rowIndex === 3)).toEqual({
      rowIndex: 3,
      label: expect.stringMatching(/^10 \|/),
    })
    expect(cells.find((cell) => cell.rowIndex === 6)).toEqual({
      rowIndex: 6,
      label: expect.stringMatching(/^06 \|/),
    })
  })

  it('maps Golden Bot Duration to G13', () => {
    const s = BOT_EP_STONES_SYMBOL
    const cells = buildBotFarmingLevelCellUpdates(
      [{ rowIndex: 13, botId: 'golden', attribute: 'Duration', levelKey: 'goldenBotDurationLevel' }],
      state,
    )

    expect(cells.find((cell) => cell.rowIndex === 13)).toEqual({
      rowIndex: 13,
      label: `06 | 23.0s | Cost 300 ${s} | Next 340 ${s}`,
    })
  })

  it('writes Bot Bot Range to G26', () => {
    const s = BOT_EP_STONES_SYMBOL
    const cells = buildBotFarmingLevelCellUpdates(
      [{ rowIndex: 26, botId: 'botBot', attribute: 'Range', levelKey: 'botBotRangeLevel' }],
      {
        ...state,
        ownedByBotId: { ...state.ownedByBotId, botBot: true },
        levels: { ...state.levels, botBotRangeLevel: 0 },
      },
    )

    expect(cells).toContainEqual({
      rowIndex: 26,
      label: `00 | 20m | Cost 0 ${s} | Next 100 ${s}`,
    })
  })

  it('writes Bot Bot Range to G26 even when botBot is not marked owned', () => {
    const s = BOT_EP_STONES_SYMBOL
    const cells = buildBotFarmingLevelCellUpdates(
      [{ rowIndex: 26, botId: 'botBot', attribute: 'Range', levelKey: 'botBotRangeLevel' }],
      state,
    )
    expect(cells.find((cell) => cell.rowIndex === 26)).toEqual({
      rowIndex: 26,
      label: `00 | 20m | Cost 0 ${s} | Next 100 ${s}`,
    })
  })
})

describe('buildBotSheetUpdates', () => {
  it('writes unlocked, sync flags, and lab levels (G via dropdown labels)', () => {
    const batch = buildBotSheetUpdates(
      'Master Sheet',
      [{ rowIndex: 3, botId: 'flame', attribute: 'Damage R.', levelKey: 'flameBotDamageReductionLevel' }],
      [{ rowIndex: 3, botId: 'flame' }],
      [{ rowIndex: 3, name: 'Flame Bot - Cooldown' }],
      state,
      layout,
    )

    expect(batch).toEqual(
      expect.arrayContaining([
        { range: "'Master Sheet'!C6", values: [['TRUE']] },
        { range: "'Master Sheet'!C26", values: [['FALSE']] },
        { range: "'Master Sheet'!H6", values: [['TRUE']] },
        { range: "'Master Sheet'!X3", values: [[8]] },
      ]),
    )
    expect(batch.some((entry) => entry.range.includes('!G'))).toBe(false)
  })
})
