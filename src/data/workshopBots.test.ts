import { describe, expect, it } from 'vitest'
import { buildWorkshopBotLabDisplayOpts } from './workshopLabDisplayOpts'
import {
  botsResearchCooldownSecondsReduction,
  botsResearchDurationBonusSeconds,
  botsResearchThunderLingerLabPercentPoints,
  parseResearchManifest,
  parseResearchSection,
} from '../types/research'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  WORKSHOP_BOT_ORDER,
  WORKSHOP_BOT_SPECIAL_UNLOCK_STONES,
  WORKSHOP_BOT_TRACKS,
  WORKSHOP_BOT_UNLOCK_MEDAL_TOTAL,
  workshopAllBotsOwnedForPlus,
  workshopBotIsOwned,
  workshopBotMaxLevel,
  workshopBotNextMarginalMedals,
  workshopBotOwnedKey,
  workshopBotSpecialIsUnlocked,
  workshopBotSpecialLevel,
  workshopBotSpecialStonePurchased,
  workshopBotSpecialMaxLevel,
  workshopBotSpecialNextMarginalMedals,
  workshopBotSpecialStatDisplay,
  workshopBotSpecialUnlockStones,
  workshopBotStatDisplay,
  workshopBotUnlockCostForBot,
  workshopBotUnlockSpentMedals,
} from './workshopBots'
import { workshopUltimateTrackTotalStonesToMax } from './workshopUltimateTable'

describe('workshopBots unlock', () => {
  it('unlock costs follow event shop order (3100 total for 5 bots)', () => {
    const empty = {}
    expect(workshopBotUnlockCostForBot(empty, 'flame')).toBe(100)
    expect(workshopBotUnlockCostForBot(empty, 'thunder')).toBe(100)

    const oneOwned = { flameOwned: true }
    expect(workshopBotIsOwned(oneOwned, 'flame')).toBe(true)
    expect(workshopBotUnlockCostForBot(oneOwned, 'thunder')).toBe(300)
    expect(workshopBotUnlockCostForBot(oneOwned, 'flame')).toBeNull()

    const fourOwned = {
      flameOwned: true,
      thunderOwned: true,
      goldenOwned: true,
      amplifyOwned: true,
    }
    expect(workshopBotUnlockCostForBot(fourOwned, 'botBot')).toBe(1200)

    const allOwned = Object.fromEntries(
      WORKSHOP_BOT_ORDER.map((id) => [workshopBotOwnedKey(id), true]),
    )
    expect(workshopBotUnlockCostForBot(allOwned, 'botBot')).toBeNull()
    expect(WORKSHOP_BOT_UNLOCK_MEDAL_TOTAL).toBe(3100)
  })

  it('sums unlock medals spent from explicit owned flags', () => {
    expect(workshopBotUnlockSpentMedals({})).toBe(0)
    expect(workshopBotUnlockSpentMedals({ flameOwned: true })).toBe(100)
    expect(
      workshopBotUnlockSpentMedals({
        flameOwned: true,
        thunderOwned: true,
        goldenOwned: true,
      }),
    ).toBe(100 + 300 + 600)
  })

  it('treats legacy upgrade levels as owned', () => {
    expect(workshopBotIsOwned({ flameBotDamageLevel: 1 }, 'flame')).toBe(true)
  })
})

const srcDir = dirname(fileURLToPath(import.meta.url))

function loadBotsResearch() {
  const manifestRaw: unknown = JSON.parse(
    readFileSync(join(srcDir, '../../public/research/manifest.json'), 'utf-8'),
  )
  const { sectionFiles } = parseResearchManifest(manifestRaw)
  const rel = sectionFiles.find((f) => f.endsWith('bots.json'))
  if (!rel) throw new Error('bots.json missing')
  const raw: unknown = JSON.parse(
    readFileSync(join(srcDir, '../../public', rel.replace(/^\//, '')), 'utf-8'),
  )
  return { sections: [parseResearchSection(raw, 'bots')] }
}

describe('workshopBots BOTS lab display', () => {
  const research = loadBotsResearch()
  const overrides = {
    '0-0': 5,
    '0-6': 4,
    '0-7': 10,
  }

  it('applies cooldown reduction, duration bonus, and linger percent', () => {
    expect(
      botsResearchCooldownSecondsReduction(research, overrides, 'Flame Bot - Cooldown'),
    ).toBe(5)
    expect(
      botsResearchDurationBonusSeconds(research, overrides, 'Golden Bot - Duration'),
    ).toBe(5)
    expect(botsResearchThunderLingerLabPercentPoints(research, overrides)).toBe(5)

    const opts = buildWorkshopBotLabDisplayOpts(research, overrides)!
    expect(workshopBotStatDisplay('flameBotCooldownLevel', 0, opts)).toBe('70s')
    expect(workshopBotStatDisplay('goldenBotDurationLevel', 0, opts)).toBe('25s')
    expect(workshopBotStatDisplay('thunderBotLingerLevel', 0, opts)).toBe('25.00%')
  })

  it('max linger lab adds +13% to workshop linger', () => {
    const maxLinger = { '0-6': 20 }
    const opts = buildWorkshopBotLabDisplayOpts(research, maxLinger)!
    expect(workshopBotStatDisplay('thunderBotLingerLevel', 0, opts)).toBe('33.00%')
    expect(workshopBotStatDisplay('thunderBotLingerLevel', 20, opts)).toBe('93.00%')
  })

  it('without lab opts matches workshop-only values', () => {
    expect(workshopBotStatDisplay('flameBotCooldownLevel', 0)).toBe('75s')
    expect(workshopBotStatDisplay('goldenBotDurationLevel', 0)).toBe('20s')
    expect(workshopBotStatDisplay('thunderBotLingerLevel', 0)).toBe('20.00%')
  })
})

describe('workshopBots Golden Bot basic upgrades', () => {
  it('matches wiki table (max levels, spot values, medal totals)', () => {
    expect(workshopBotMaxLevel('goldenBotDurationLevel')).toBe(30)
    expect(workshopBotMaxLevel('goldenBotCooldownLevel')).toBe(15)
    expect(workshopBotMaxLevel('goldenBotBonusLevel')).toBe(30)
    expect(workshopBotMaxLevel('goldenBotRangeLevel')).toBe(20)

    expect(workshopBotStatDisplay('goldenBotDurationLevel', 0)).toBe('20s')
    expect(workshopBotStatDisplay('goldenBotDurationLevel', 30)).toBe('35s')
    expect(workshopBotStatDisplay('goldenBotCooldownLevel', 15)).toBe('75s')
    expect(workshopBotStatDisplay('goldenBotBonusLevel', 0)).toBe('x2.00')
    expect(workshopBotStatDisplay('goldenBotBonusLevel', 30)).toBe('x8.00')
    expect(workshopBotStatDisplay('goldenBotRangeLevel', 20)).toBe('60.00m')

    expect(workshopBotNextMarginalMedals('goldenBotDurationLevel', 0)).toBe(100)
    expect(workshopBotNextMarginalMedals('goldenBotDurationLevel', 29)).toBe(1260)
    expect(workshopBotNextMarginalMedals('goldenBotBonusLevel', 29)).toBe(1260)
    expect(workshopBotNextMarginalMedals('goldenBotRangeLevel', 19)).toBe(860)
    expect(workshopBotNextMarginalMedals('goldenBotRangeLevel', 20)).toBeUndefined()

    expect(
      workshopUltimateTrackTotalStonesToMax(
        WORKSHOP_BOT_TRACKS.goldenBotDurationLevel,
        0,
      ),
    ).toBe(20_400)
    expect(
      workshopUltimateTrackTotalStonesToMax(
        WORKSHOP_BOT_TRACKS.goldenBotCooldownLevel,
        0,
      ),
    ).toBe(5_700)
    expect(
      workshopUltimateTrackTotalStonesToMax(WORKSHOP_BOT_TRACKS.goldenBotBonusLevel, 0),
    ).toBe(20_400)
    expect(
      workshopUltimateTrackTotalStonesToMax(WORKSHOP_BOT_TRACKS.goldenBotRangeLevel, 0),
    ).toBe(9_600)
  })
})

describe('workshopBots Amplify Bot basic upgrades', () => {
  it('matches wiki table (max levels, spot values, medal totals)', () => {
    expect(workshopBotMaxLevel('amplifyBotDurationLevel')).toBe(30)
    expect(workshopBotMaxLevel('amplifyBotCooldownLevel')).toBe(15)
    expect(workshopBotMaxLevel('amplifyBotBonusLevel')).toBe(30)
    expect(workshopBotMaxLevel('amplifyBotRangeLevel')).toBe(18)

    expect(workshopBotStatDisplay('amplifyBotDurationLevel', 30)).toBe('35s')
    expect(workshopBotStatDisplay('amplifyBotCooldownLevel', 15)).toBe('75s')
    expect(workshopBotStatDisplay('amplifyBotBonusLevel', 0)).toBe('x3.50')
    expect(workshopBotStatDisplay('amplifyBotBonusLevel', 30)).toBe('x15.50')
    expect(workshopBotStatDisplay('amplifyBotRangeLevel', 18)).toBe('61.00m')

    expect(
      workshopUltimateTrackTotalStonesToMax(
        WORKSHOP_BOT_TRACKS.amplifyBotDurationLevel,
        0,
      ),
    ).toBe(20_400)
    expect(
      workshopUltimateTrackTotalStonesToMax(
        WORKSHOP_BOT_TRACKS.amplifyBotCooldownLevel,
        0,
      ),
    ).toBe(5_700)
    expect(
      workshopUltimateTrackTotalStonesToMax(WORKSHOP_BOT_TRACKS.amplifyBotBonusLevel, 0),
    ).toBe(20_400)
    expect(
      workshopUltimateTrackTotalStonesToMax(WORKSHOP_BOT_TRACKS.amplifyBotRangeLevel, 0),
    ).toBe(7_920)
  })
})

describe('workshopBots Bot Bot basic upgrades', () => {
  it('matches wiki table (max levels, spot values, medal totals)', () => {
    expect(workshopBotMaxLevel('botBotDurationLevel')).toBe(30)
    expect(workshopBotMaxLevel('botBotCooldownLevel')).toBe(15)
    expect(workshopBotMaxLevel('botBotBonusLevel')).toBe(30)
    expect(workshopBotMaxLevel('botBotRangeLevel')).toBe(18)

    expect(workshopBotStatDisplay('botBotDurationLevel', 30)).toBe('35s')
    expect(workshopBotStatDisplay('botBotCooldownLevel', 15)).toBe('75s')
    expect(workshopBotStatDisplay('botBotBonusLevel', 0)).toBe('x1.00')
    expect(workshopBotStatDisplay('botBotBonusLevel', 1)).toBe('x1.05')
    expect(workshopBotStatDisplay('botBotBonusLevel', 30)).toBe('x2.50')
    expect(workshopBotStatDisplay('botBotRangeLevel', 18)).toBe('61.00m')

    expect(
      workshopUltimateTrackTotalStonesToMax(WORKSHOP_BOT_TRACKS.botBotDurationLevel, 0),
    ).toBe(20_400)
    expect(
      workshopUltimateTrackTotalStonesToMax(WORKSHOP_BOT_TRACKS.botBotCooldownLevel, 0),
    ).toBe(5_700)
    expect(
      workshopUltimateTrackTotalStonesToMax(WORKSHOP_BOT_TRACKS.botBotBonusLevel, 0),
    ).toBe(20_400)
    expect(
      workshopUltimateTrackTotalStonesToMax(WORKSHOP_BOT_TRACKS.botBotRangeLevel, 0),
    ).toBe(7_920)
  })
})

describe('workshopBots Bot+', () => {
  it('requires all five base bots before Bot+ unlocks', () => {
    const fourOwned = {
      flameOwned: true,
      thunderOwned: true,
      goldenOwned: true,
      amplifyOwned: true,
    }
    expect(workshopAllBotsOwnedForPlus(fourOwned)).toBe(false)

    const allOwned = Object.fromEntries(
      WORKSHOP_BOT_ORDER.map((id) => [workshopBotOwnedKey(id), true]),
    )
    expect(workshopAllBotsOwnedForPlus(allOwned)).toBe(true)
  })

  it('Bot+ unlock costs 1250 power stones each', () => {
    expect(WORKSHOP_BOT_SPECIAL_UNLOCK_STONES).toBe(1250)
    expect(workshopBotSpecialUnlockStones()).toBe(1250)
  })

  it('stone purchase flag gates Bot+ UI; level alone does not', () => {
    expect(
      workshopBotSpecialStonePurchased({ flameBotBurningGroundUnlocked: true }, 'flame'),
    ).toBe(true)
    expect(workshopBotSpecialLevel({ flameBotBurningGroundUnlocked: true }, 'flame')).toBe(0)
    expect(workshopBotSpecialIsUnlocked({ flameBotBurningGroundLevel: 0 }, 'flame')).toBe(false)
    expect(workshopBotSpecialLevel({ flameBotBurningGroundLevel: 0 }, 'flame')).toBe(-1)
  })

  it('Bot+ medal upgrades follow wiki Events table', () => {
    expect(workshopBotSpecialMaxLevel('flame')).toBe(20)
    expect(workshopBotSpecialStatDisplay('flame', 0)).toBe('x1.50')
    expect(workshopBotSpecialStatDisplay('flame', 20)).toBe('x3.50')
    expect(workshopBotSpecialNextMarginalMedals('flame', 0)).toBe(100)
    expect(workshopBotSpecialNextMarginalMedals('flame', 18)).toBe(1000)
    expect(workshopBotSpecialNextMarginalMedals('flame', 19)).toBe(1050)
    expect(workshopBotSpecialNextMarginalMedals('flame', 20)).toBeUndefined()
    expect(workshopBotSpecialMaxLevel('thunder')).toBe(20)
    expect(workshopBotSpecialStatDisplay('thunder', 0)).toBe('5.00%')
    expect(workshopBotSpecialStatDisplay('thunder', 20)).toBe('25.00%')
    expect(workshopBotSpecialNextMarginalMedals('thunder', 0)).toBe(100)
    expect(workshopBotSpecialNextMarginalMedals('thunder', 18)).toBe(1000)
    expect(workshopBotSpecialNextMarginalMedals('thunder', 19)).toBe(1050)
    expect(workshopBotSpecialMaxLevel('golden')).toBe(25)
    expect(workshopBotSpecialStatDisplay('golden', 0)).toBe('x1.25')
    expect(workshopBotSpecialStatDisplay('golden', 25)).toBe('x2.50')
    expect(workshopBotSpecialNextMarginalMedals('golden', 0)).toBe(100)
    expect(workshopBotSpecialNextMarginalMedals('golden', 17)).toBe(950)
    expect(workshopBotSpecialNextMarginalMedals('golden', 18)).toBe(100)
    expect(workshopBotSpecialNextMarginalMedals('golden', 24)).toBe(130)
    expect(workshopBotSpecialNextMarginalMedals('golden', 25)).toBeUndefined()
    expect(workshopBotSpecialMaxLevel('amplify')).toBe(9)
    expect(workshopBotSpecialStatDisplay('amplify', 0)).toBe('3')
    expect(workshopBotSpecialStatDisplay('amplify', 9)).toBe('12')
    expect(workshopBotSpecialNextMarginalMedals('amplify', 0)).toBe(100)
    expect(workshopBotSpecialNextMarginalMedals('amplify', 1)).toBe(300)
    expect(workshopBotSpecialNextMarginalMedals('amplify', 8)).toBe(1700)
    expect(workshopBotSpecialNextMarginalMedals('amplify', 9)).toBeUndefined()
    expect(workshopBotSpecialMaxLevel('botBot')).toBe(20)
    expect(workshopBotSpecialStatDisplay('botBot', 0)).toBe('x1.25')
    expect(workshopBotSpecialStatDisplay('botBot', 20)).toBe('x2.25')
    expect(workshopBotSpecialNextMarginalMedals('botBot', 0)).toBe(100)
    expect(workshopBotSpecialNextMarginalMedals('botBot', 18)).toBe(1000)
    expect(workshopBotSpecialNextMarginalMedals('botBot', 19)).toBe(1050)
    expect(workshopBotSpecialNextMarginalMedals('botBot', 20)).toBeUndefined()
  })
})
