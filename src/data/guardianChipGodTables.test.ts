import { describe, expect, it } from 'vitest'
import {
  GUARDIAN_ALLY_CHIP_TABLE,
  GUARDIAN_ATTACK_CHIP_TABLE,
  GUARDIAN_BOUNTY_CHIP_TABLE,
  GUARDIAN_FETCH_CHIP_TABLE,
  GUARDIAN_SCOUT_CHIP_TABLE,
  GUARDIAN_SUMMON_CHIP_TABLE,
  formatGuardianChipAllyValue,
  formatGuardianChipBountyValue,
  formatGuardianChipFetchValue,
  formatGuardianChipScoutValue,
  formatGuardianChipSummonValue,
  guardianChipAllyMarginalCost,
  guardianChipAllyTrackLevel,
  guardianChipAttackMarginalCost,
  guardianChipAttackTrackLevel,
  guardianChipAttackValueAtLevel,
  guardianChipBountyMarginalCost,
  guardianChipBountyTrackLevel,
  guardianChipFetchMarginalCost,
  guardianChipFetchTrackLevel,
  guardianChipScoutMarginalCost,
  guardianChipScoutTrackLevel,
  guardianChipSummonMarginalCost,
  guardianChipSummonTrackLevel,
} from './guardianChipGodTables'

describe('guardianChipGodTables — Attack chip', () => {
  it('defines percent, cooldown, and targets tracks', () => {
    expect(GUARDIAN_ATTACK_CHIP_TABLE.chipId).toBe('attack')
    expect(GUARDIAN_ATTACK_CHIP_TABLE.tracks.percent.maxLevel).toBe(20)
    expect(GUARDIAN_ATTACK_CHIP_TABLE.tracks.cooldown.maxLevel).toBe(91)
    expect(GUARDIAN_ATTACK_CHIP_TABLE.tracks.targets.maxLevel).toBe(10)
  })

  it('matches supplied percent and target rows', () => {
    expect(guardianChipAttackTrackLevel('percent', 1)).toEqual({
      level: 1,
      value: 1,
      totalCost: 0,
    })
    expect(guardianChipAttackTrackLevel('percent', 10)).toEqual({
      level: 10,
      value: 10,
      totalCost: 225,
    })
    expect(guardianChipAttackTrackLevel('percent', 20)).toEqual({
      level: 20,
      value: 20,
      totalCost: 475,
    })
    expect(guardianChipAttackTrackLevel('targets', 2)).toEqual({
      level: 2,
      value: 2,
      totalCost: 100,
    })
    expect(guardianChipAttackTrackLevel('targets', 10)).toEqual({
      level: 10,
      value: 10,
      totalCost: 900,
    })
  })

  it('matches supplied cooldown rows', () => {
    expect(guardianChipAttackValueAtLevel('cooldown', 1)).toBe(120)
    expect(guardianChipAttackTrackLevel('cooldown', 20)).toEqual({
      level: 20,
      value: 101,
      totalCost: 19,
    })
    expect(guardianChipAttackTrackLevel('cooldown', 21)).toEqual({
      level: 21,
      value: 100,
      totalCost: 20,
    })
    expect(guardianChipAttackTrackLevel('cooldown', 91)).toEqual({
      level: 91,
      value: 30,
      totalCost: 90,
    })
  })

  it('marginal costs match ladder deltas', () => {
    expect(guardianChipAttackMarginalCost('percent', 1)).toBe(25)
    expect(guardianChipAttackMarginalCost('percent', 19)).toBe(25)
    expect(guardianChipAttackMarginalCost('cooldown', 20)).toBe(1)
    expect(guardianChipAttackMarginalCost('targets', 5)).toBe(100)
  })
})

describe('guardianChipGodTables — Ally chip', () => {
  it('defines recovery, max recovery, and cooldown tracks', () => {
    expect(GUARDIAN_ALLY_CHIP_TABLE.chipId).toBe('ally')
    expect(GUARDIAN_ALLY_CHIP_TABLE.tracks.recovery.maxLevel).toBe(50)
    expect(GUARDIAN_ALLY_CHIP_TABLE.tracks.maxRecovery.maxLevel).toBe(90)
    expect(GUARDIAN_ALLY_CHIP_TABLE.tracks.cooldown.maxLevel).toBe(91)
  })

  it('matches supplied recovery and max recovery rows', () => {
    expect(guardianChipAllyTrackLevel('recovery', 1)).toEqual({
      level: 1,
      value: 1,
      totalCost: 0,
    })
    expect(guardianChipAllyTrackLevel('recovery', 2)).toEqual({
      level: 2,
      value: 2,
      totalCost: 10,
    })
    expect(guardianChipAllyTrackLevel('recovery', 50)).toEqual({
      level: 50,
      value: 50,
      totalCost: 250,
    })
    expect(guardianChipAllyTrackLevel('maxRecovery', 51)).toEqual({
      level: 51,
      value: 61,
      totalCost: 50,
    })
    expect(guardianChipAllyTrackLevel('maxRecovery', 90)).toEqual({
      level: 90,
      value: 100,
      totalCost: 89,
    })
    expect(formatGuardianChipAllyValue('maxRecovery', 1)).toBe('x1.10')
    expect(formatGuardianChipAllyValue('maxRecovery', 10)).toBe('x2.00')
    expect(formatGuardianChipAllyValue('maxRecovery', 90)).toBe('x10.00')
  })

  it('matches supplied cooldown rows', () => {
    expect(guardianChipAllyTrackLevel('cooldown', 91)).toEqual({
      level: 91,
      value: 30,
      totalCost: 90,
    })
  })

  it('marginal costs match ladder deltas', () => {
    expect(guardianChipAllyMarginalCost('recovery', 1)).toBe(10)
    expect(guardianChipAllyMarginalCost('recovery', 2)).toBe(5)
    expect(guardianChipAllyMarginalCost('maxRecovery', 50)).toBe(1)
    expect(guardianChipAllyMarginalCost('cooldown', 20)).toBe(1)
  })
})

describe('guardianChipGodTables — Bounty chip', () => {
  it('defines multiplier, cooldown, and targets tracks', () => {
    expect(GUARDIAN_BOUNTY_CHIP_TABLE.chipId).toBe('bounty')
    expect(GUARDIAN_BOUNTY_CHIP_TABLE.tracks.multiplier.maxLevel).toBe(100)
    expect(GUARDIAN_BOUNTY_CHIP_TABLE.tracks.cooldown.maxLevel).toBe(61)
    expect(GUARDIAN_BOUNTY_CHIP_TABLE.tracks.targets.maxLevel).toBe(10)
  })

  it('matches supplied multiplier, cooldown, and targets rows', () => {
    expect(guardianChipBountyTrackLevel('multiplier', 1)).toEqual({
      level: 1,
      value: 1,
      totalCost: 0,
    })
    expect(formatGuardianChipBountyValue('multiplier', 1)).toBe('x1.01')
    expect(guardianChipBountyTrackLevel('multiplier', 10)).toEqual({
      level: 10,
      value: 10,
      totalCost: 9,
    })
    expect(formatGuardianChipBountyValue('multiplier', 10)).toBe('x1.10')
    expect(formatGuardianChipBountyValue('multiplier', 45)).toBe('x1.45')
    expect(formatGuardianChipBountyValue('multiplier', 100)).toBe('x2.00')
    expect(guardianChipBountyTrackLevel('cooldown', 2)).toEqual({
      level: 2,
      value: 119,
      totalCost: 2,
    })
    expect(guardianChipBountyTrackLevel('cooldown', 61)).toEqual({
      level: 61,
      value: 60,
      totalCost: 120,
    })
    expect(guardianChipBountyTrackLevel('targets', 10)).toEqual({
      level: 10,
      value: 10,
      totalCost: 900,
    })
  })

  it('marginal costs match ladder deltas', () => {
    expect(guardianChipBountyMarginalCost('multiplier', 1)).toBe(1)
    expect(guardianChipBountyMarginalCost('cooldown', 1)).toBe(2)
    expect(guardianChipBountyMarginalCost('targets', 5)).toBe(100)
  })
})

describe('guardianChipGodTables — Fetch chip', () => {
  it('defines cooldown, find chance, and double find chance tracks', () => {
    expect(GUARDIAN_FETCH_CHIP_TABLE.chipId).toBe('fetch')
    expect(GUARDIAN_FETCH_CHIP_TABLE.tracks.cooldown.maxLevel).toBe(61)
    expect(GUARDIAN_FETCH_CHIP_TABLE.tracks.findChance.maxLevel).toBe(41)
    expect(GUARDIAN_FETCH_CHIP_TABLE.tracks.doubleFindChance.maxLevel).toBe(49)
  })

  it('matches supplied cooldown, find chance, and double find chance rows', () => {
    expect(guardianChipFetchTrackLevel('cooldown', 2)).toEqual({
      level: 2,
      value: 119,
      totalCost: 2,
    })
    expect(guardianChipFetchTrackLevel('cooldown', 61)).toEqual({
      level: 61,
      value: 60,
      totalCost: 120,
    })
    expect(guardianChipFetchTrackLevel('findChance', 2)).toEqual({
      level: 2,
      value: 11,
      totalCost: 20,
    })
    expect(guardianChipFetchTrackLevel('findChance', 41)).toEqual({
      level: 41,
      value: 50,
      totalCost: 215,
    })
    expect(formatGuardianChipFetchValue('findChance', 41)).toBe('50%')
    expect(guardianChipFetchTrackLevel('doubleFindChance', 49)).toEqual({
      level: 49,
      value: 50,
      totalCost: 245,
    })
    expect(formatGuardianChipFetchValue('doubleFindChance', 1)).toBe('2%')
  })

  it('marginal costs match ladder deltas', () => {
    expect(guardianChipFetchMarginalCost('cooldown', 1)).toBe(2)
    expect(guardianChipFetchMarginalCost('findChance', 1)).toBe(20)
    expect(guardianChipFetchMarginalCost('findChance', 2)).toBe(5)
    expect(guardianChipFetchMarginalCost('doubleFindChance', 1)).toBe(10)
    expect(guardianChipFetchMarginalCost('doubleFindChance', 2)).toBe(5)
  })
})

describe('guardianChipGodTables — Summon chip', () => {
  it('defines cooldown, duration, and cash bonus tracks', () => {
    expect(GUARDIAN_SUMMON_CHIP_TABLE.chipId).toBe('summon')
    expect(GUARDIAN_SUMMON_CHIP_TABLE.tracks.cooldown.maxLevel).toBe(71)
    expect(GUARDIAN_SUMMON_CHIP_TABLE.tracks.duration.maxLevel).toBe(31)
    expect(GUARDIAN_SUMMON_CHIP_TABLE.tracks.cashBonus.maxLevel).toBe(10)
  })

  it('matches supplied cooldown, duration, and cash bonus rows', () => {
    expect(guardianChipSummonTrackLevel('cooldown', 2)).toEqual({
      level: 2,
      value: 139,
      totalCost: 1,
    })
    expect(guardianChipSummonTrackLevel('cooldown', 71)).toEqual({
      level: 71,
      value: 70,
      totalCost: 139,
    })
    expect(guardianChipSummonTrackLevel('duration', 2)).toEqual({
      level: 2,
      value: 6,
      totalCost: 15,
    })
    expect(guardianChipSummonTrackLevel('duration', 31)).toEqual({
      level: 31,
      value: 35,
      totalCost: 305,
    })
    expect(formatGuardianChipSummonValue('cashBonus', 1)).toBe('x1.0')
    expect(guardianChipSummonTrackLevel('cashBonus', 10)).toEqual({
      level: 10,
      value: 100,
      totalCost: 900,
    })
    expect(formatGuardianChipSummonValue('cashBonus', 10)).toBe('x10.0')
  })

  it('marginal costs match ladder deltas', () => {
    expect(guardianChipSummonMarginalCost('cooldown', 1)).toBe(1)
    expect(guardianChipSummonMarginalCost('cooldown', 2)).toBe(2)
    expect(guardianChipSummonMarginalCost('duration', 1)).toBe(15)
    expect(guardianChipSummonMarginalCost('duration', 2)).toBe(10)
    expect(guardianChipSummonMarginalCost('cashBonus', 5)).toBe(100)
  })
})

describe('guardianChipGodTables — Scout chip', () => {
  it('defines cooldown, range bonus, and duration tracks', () => {
    expect(GUARDIAN_SCOUT_CHIP_TABLE.chipId).toBe('scout')
    expect(GUARDIAN_SCOUT_CHIP_TABLE.tracks.cooldown.maxLevel).toBe(71)
    expect(GUARDIAN_SCOUT_CHIP_TABLE.tracks.rangeBonus.maxLevel).toBe(41)
    expect(GUARDIAN_SCOUT_CHIP_TABLE.tracks.duration.maxLevel).toBe(31)
  })

  it('matches supplied cooldown, range bonus, and duration rows', () => {
    expect(guardianChipScoutTrackLevel('cooldown', 2)).toEqual({
      level: 2,
      value: 104,
      totalCost: 1,
    })
    expect(guardianChipScoutTrackLevel('cooldown', 71)).toEqual({
      level: 71,
      value: 35,
      totalCost: 139,
    })
    expect(formatGuardianChipScoutValue('rangeBonus', 1)).toBe('x2.0')
    expect(guardianChipScoutTrackLevel('rangeBonus', 40)).toEqual({
      level: 40,
      value: 59,
      totalCost: 200,
    })
    expect(formatGuardianChipScoutValue('rangeBonus', 41)).toBe('x6.0')
    expect(guardianChipScoutTrackLevel('duration', 31)).toEqual({
      level: 31,
      value: 35,
      totalCost: 300,
    })
  })

  it('marginal costs match ladder deltas', () => {
    expect(guardianChipScoutMarginalCost('cooldown', 1)).toBe(1)
    expect(guardianChipScoutMarginalCost('cooldown', 2)).toBe(2)
    expect(guardianChipScoutMarginalCost('rangeBonus', 1)).toBe(10)
    expect(guardianChipScoutMarginalCost('rangeBonus', 2)).toBe(5)
    expect(guardianChipScoutMarginalCost('duration', 1)).toBe(10)
    expect(guardianChipScoutMarginalCost('duration', 2)).toBe(10)
  })
})
