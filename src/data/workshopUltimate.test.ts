import { describe, expect, it } from 'vitest'
import { GAME_ULTIMATE_WEAPON_INDEX } from '../playerSave/gameUltimateWeaponMapping'
import {
  WORKSHOP_ULTIMATE_WEAPON_ORDER,
  workshopUltimateMaxLevel,
  workshopUltimateNextMarginalStones,
  workshopUltimateOwnedCount,
  workshopUltimateOwnedKey,
  workshopUltimateStatDisplay,
  workshopUltimateTotalStonesToMaxFrom,
  workshopUltimateUnlockCostForWeapon,
  workshopUltimateUnlockSpentStones,
  workshopUltimateUnlockToMaxStones,
  workshopUltimateWeaponIsOwned,
} from './workshopUltimate'

describe('workshop ultimate wiki spot checks', () => {
  it('WORKSHOP_ULTIMATE_WEAPON_ORDER matches in-game save array indices', () => {
    WORKSHOP_ULTIMATE_WEAPON_ORDER.forEach((weaponId, ui) => {
      expect(GAME_ULTIMATE_WEAPON_INDEX[weaponId]).toBe(ui)
    })
  })

  it('Chain Lightning chance L5 shows 12.50% with next cost 98', () => {
    expect(workshopUltimateStatDisplay('chainLightningChanceLevel', 5)).toBe('12.50%')
    expect(workshopUltimateNextMarginalStones('chainLightningChanceLevel', 5)).toBe(98)
  })

  it('Chain Lightning quantity L2 shows 3 with next cost 150', () => {
    expect(workshopUltimateStatDisplay('chainLightningQuantityLevel', 2)).toBe('3')
    expect(workshopUltimateNextMarginalStones('chainLightningQuantityLevel', 2)).toBe(150)
  })

  it('Chain Lightning basic upgrades match wiki totals (18,375 stones)', () => {
    expect(workshopUltimateMaxLevel('chainLightningDamageLevel')).toBe(31)
    expect(workshopUltimateMaxLevel('chainLightningQuantityLevel')).toBe(4)
    expect(workshopUltimateMaxLevel('chainLightningChanceLevel')).toBe(15)
    expect(workshopUltimateStatDisplay('chainLightningDamageLevel', 31)).toBe('x7961')
    expect(workshopUltimateStatDisplay('chainLightningDamageLevel', 27)).toBe('x3990')
    expect(workshopUltimateStatDisplay('chainLightningQuantityLevel', 4)).toBe('5')
    expect(workshopUltimateStatDisplay('chainLightningChanceLevel', 15)).toBe('27.50%')
    expect(workshopUltimateTotalStonesToMaxFrom('chainLightningDamageLevel', 0)).toBe(15_710)
    expect(workshopUltimateTotalStonesToMaxFrom('chainLightningQuantityLevel', 0)).toBe(655)
    expect(workshopUltimateTotalStonesToMaxFrom('chainLightningChanceLevel', 0)).toBe(2_010)
    expect(
      workshopUltimateTotalStonesToMaxFrom('chainLightningDamageLevel', 0) +
        workshopUltimateTotalStonesToMaxFrom('chainLightningQuantityLevel', 0) +
        workshopUltimateTotalStonesToMaxFrom('chainLightningChanceLevel', 0),
    ).toBe(18_375)
  })

  it('Inner Land Mines basic upgrades match wiki totals (13,522 stones)', () => {
    expect(workshopUltimateMaxLevel('innerLandMinesDamageLevel')).toBe(30)
    expect(workshopUltimateMaxLevel('innerLandMinesQuantityLevel')).toBe(3)
    expect(workshopUltimateMaxLevel('innerLandMinesCooldownLevel')).toBe(15)
    expect(workshopUltimateStatDisplay('innerLandMinesDamageLevel', 30)).toBe('x3021')
    expect(workshopUltimateStatDisplay('innerLandMinesDamageLevel', 0)).toBe('x10')
    expect(workshopUltimateStatDisplay('innerLandMinesQuantityLevel', 3)).toBe('6')
    expect(workshopUltimateStatDisplay('innerLandMinesCooldownLevel', 15)).toBe('50s')
    expect(workshopUltimateTotalStonesToMaxFrom('innerLandMinesDamageLevel', 0)).toBe(11_297)
    expect(workshopUltimateTotalStonesToMaxFrom('innerLandMinesQuantityLevel', 0)).toBe(425)
    expect(workshopUltimateTotalStonesToMaxFrom('innerLandMinesCooldownLevel', 0)).toBe(1_800)
    expect(
      workshopUltimateTotalStonesToMaxFrom('innerLandMinesDamageLevel', 0) +
        workshopUltimateTotalStonesToMaxFrom('innerLandMinesQuantityLevel', 0) +
        workshopUltimateTotalStonesToMaxFrom('innerLandMinesCooldownLevel', 0),
    ).toBe(13_522)
  })

  it('Chrono Field basic upgrades match wiki totals (9,946 stones)', () => {
    expect(workshopUltimateMaxLevel('chronoFieldDurationLevel')).toBe(35)
    expect(workshopUltimateMaxLevel('chronoFieldSlowLevel')).toBe(11)
    expect(workshopUltimateMaxLevel('chronoFieldCooldownLevel')).toBe(12)
    expect(workshopUltimateStatDisplay('chronoFieldDurationLevel', 35)).toBe('40s')
    expect(workshopUltimateStatDisplay('chronoFieldSlowLevel', 11)).toBe('75.00%')
    expect(workshopUltimateStatDisplay('chronoFieldCooldownLevel', 12)).toBe('60s')
    expect(workshopUltimateTotalStonesToMaxFrom('chronoFieldDurationLevel', 0)).toBe(5_530)
    expect(workshopUltimateTotalStonesToMaxFrom('chronoFieldSlowLevel', 0)).toBe(2_910)
    expect(workshopUltimateTotalStonesToMaxFrom('chronoFieldCooldownLevel', 0)).toBe(1_506)
    expect(
      workshopUltimateTotalStonesToMaxFrom('chronoFieldDurationLevel', 0) +
        workshopUltimateTotalStonesToMaxFrom('chronoFieldSlowLevel', 0) +
        workshopUltimateTotalStonesToMaxFrom('chronoFieldCooldownLevel', 0),
    ).toBe(9_946)
  })

  it('Smart Missiles basic upgrades match wiki totals (24,407 stones)', () => {
    expect(workshopUltimateMaxLevel('smartMissilesDamageLevel')).toBe(30)
    expect(workshopUltimateMaxLevel('smartMissilesQuantityLevel')).toBe(15)
    expect(workshopUltimateMaxLevel('smartMissilesCooldownLevel')).toBe(16)
    expect(workshopUltimateStatDisplay('smartMissilesDamageLevel', 30)).toBe('x3021')
    expect(workshopUltimateStatDisplay('smartMissilesQuantityLevel', 0)).toBe('5')
    expect(workshopUltimateStatDisplay('smartMissilesQuantityLevel', 15)).toBe('20')
    expect(workshopUltimateStatDisplay('smartMissilesCooldownLevel', 16)).toBe('20s')
    expect(workshopUltimateTotalStonesToMaxFrom('smartMissilesDamageLevel', 0)).toBe(14_891)
    expect(workshopUltimateTotalStonesToMaxFrom('smartMissilesQuantityLevel', 0)).toBe(6_966)
    expect(workshopUltimateTotalStonesToMaxFrom('smartMissilesCooldownLevel', 0)).toBe(2_550)
    expect(
      workshopUltimateTotalStonesToMaxFrom('smartMissilesDamageLevel', 0) +
        workshopUltimateTotalStonesToMaxFrom('smartMissilesQuantityLevel', 0) +
        workshopUltimateTotalStonesToMaxFrom('smartMissilesCooldownLevel', 0),
    ).toBe(24_407)
  })

  it('Death Wave quantity L2 shows 3 with next cost 850', () => {
    expect(workshopUltimateStatDisplay('deathWaveQuantityLevel', 2)).toBe('3')
    expect(workshopUltimateNextMarginalStones('deathWaveQuantityLevel', 2)).toBe(850)
  })

  it('Death Wave cooldown L10 shows 200s with next cost 168', () => {
    expect(workshopUltimateStatDisplay('deathWaveCooldownLevel', 10)).toBe('200s')
    expect(workshopUltimateNextMarginalStones('deathWaveCooldownLevel', 10)).toBe(168)
  })

  it('Death Wave basic upgrades match wiki totals (29,391 stones)', () => {
    expect(workshopUltimateMaxLevel('deathWaveDamageLevel')).toBe(30)
    expect(workshopUltimateMaxLevel('deathWaveQuantityLevel')).toBe(4)
    expect(workshopUltimateMaxLevel('deathWaveCooldownLevel')).toBe(25)
    expect(workshopUltimateStatDisplay('deathWaveDamageLevel', 30)).toBe('x9119')
    expect(workshopUltimateStatDisplay('deathWaveDamageLevel', 30, 0, 2)).toBe('x18238')
    expect(workshopUltimateStatDisplay('deathWaveCooldownLevel', 10, 0, 2)).toBe('200s')
    expect(workshopUltimateStatDisplay('deathWaveCooldownLevel', 25)).toBe('50s')
    expect(workshopUltimateTotalStonesToMaxFrom('deathWaveDamageLevel', 0)).toBe(17_591)
    expect(workshopUltimateTotalStonesToMaxFrom('deathWaveQuantityLevel', 0)).toBe(2_950)
    expect(workshopUltimateTotalStonesToMaxFrom('deathWaveCooldownLevel', 0)).toBe(8_850)
    expect(
      workshopUltimateTotalStonesToMaxFrom('deathWaveDamageLevel', 0) +
        workshopUltimateTotalStonesToMaxFrom('deathWaveQuantityLevel', 0) +
        workshopUltimateTotalStonesToMaxFrom('deathWaveCooldownLevel', 0),
    ).toBe(29_391)
  })

  it('Golden Tower bonus L16 shows x17.8 with next cost 950', () => {
    expect(workshopUltimateStatDisplay('goldenTowerBonusLevel', 16)).toBe('x17.8')
    expect(workshopUltimateNextMarginalStones('goldenTowerBonusLevel', 16)).toBe(950)
  })

  it('Poison Swamp basic upgrades match wiki totals (19,196 stones)', () => {
    expect(workshopUltimateMaxLevel('poisonSwampDamageLevel')).toBe(30)
    expect(workshopUltimateMaxLevel('poisonSwampDurationLevel')).toBe(14)
    expect(workshopUltimateMaxLevel('poisonSwampCooldownLevel')).toBe(15)
    expect(workshopUltimateStatDisplay('poisonSwampDamageLevel', 30)).toBe('x3021')
    expect(workshopUltimateStatDisplay('poisonSwampDurationLevel', 0)).toBe('30s')
    expect(workshopUltimateStatDisplay('poisonSwampDurationLevel', 14)).toBe('100s')
    expect(workshopUltimateStatDisplay('poisonSwampCooldownLevel', 15)).toBe('50s')
    expect(workshopUltimateTotalStonesToMaxFrom('poisonSwampDamageLevel', 0)).toBe(13_686)
    expect(workshopUltimateTotalStonesToMaxFrom('poisonSwampDurationLevel', 0)).toBe(3_500)
    expect(workshopUltimateTotalStonesToMaxFrom('poisonSwampCooldownLevel', 0)).toBe(2_010)
    expect(
      workshopUltimateTotalStonesToMaxFrom('poisonSwampDamageLevel', 0) +
        workshopUltimateTotalStonesToMaxFrom('poisonSwampDurationLevel', 0) +
        workshopUltimateTotalStonesToMaxFrom('poisonSwampCooldownLevel', 0),
    ).toBe(19_196)
  })

  it('Golden Tower basic upgrades match wiki totals (27,186 stones)', () => {
    expect(workshopUltimateMaxLevel('goldenTowerBonusLevel')).toBe(20)
    expect(workshopUltimateMaxLevel('goldenTowerDurationLevel')).toBe(38)
    expect(workshopUltimateMaxLevel('goldenTowerCooldownLevel')).toBe(20)
    expect(workshopUltimateStatDisplay('goldenTowerBonusLevel', 20)).toBe('x21')
    expect(workshopUltimateStatDisplay('goldenTowerDurationLevel', 38)).toBe('53s')
    expect(workshopUltimateStatDisplay('goldenTowerCooldownLevel', 20)).toBe('100s')
    expect(workshopUltimateTotalStonesToMaxFrom('goldenTowerBonusLevel', 0)).toBe(8_434)
    expect(workshopUltimateTotalStonesToMaxFrom('goldenTowerDurationLevel', 0)).toBe(14_052)
    expect(workshopUltimateTotalStonesToMaxFrom('goldenTowerCooldownLevel', 0)).toBe(4_700)
    expect(
      workshopUltimateTotalStonesToMaxFrom('goldenTowerBonusLevel', 0) +
        workshopUltimateTotalStonesToMaxFrom('goldenTowerDurationLevel', 0) +
        workshopUltimateTotalStonesToMaxFrom('goldenTowerCooldownLevel', 0),
    ).toBe(27_186)
  })

  it('Spotlight angle L0 shows 30°', () => {
    expect(workshopUltimateStatDisplay('spotlightAngleLevel', 0)).toBe('30°')
  })

  it('Spotlight basic upgrades match wiki totals (42,236 stones)', () => {
    expect(workshopUltimateMaxLevel('spotlightBonusLevel')).toBe(25)
    expect(workshopUltimateMaxLevel('spotlightAngleLevel')).toBe(60)
    expect(workshopUltimateMaxLevel('spotlightQuantityLevel')).toBe(3)
    expect(workshopUltimateStatDisplay('spotlightBonusLevel', 25)).toBe('x43')
    expect(workshopUltimateStatDisplay('spotlightAngleLevel', 60)).toBe('90°')
    expect(workshopUltimateStatDisplay('spotlightQuantityLevel', 3)).toBe('4')
    expect(workshopUltimateTotalStonesToMaxFrom('spotlightBonusLevel', 0)).toBe(8_821)
    expect(workshopUltimateTotalStonesToMaxFrom('spotlightAngleLevel', 0)).toBe(29_690)
    expect(workshopUltimateTotalStonesToMaxFrom('spotlightQuantityLevel', 0)).toBe(3_725)
    expect(
      workshopUltimateTotalStonesToMaxFrom('spotlightBonusLevel', 0) +
        workshopUltimateTotalStonesToMaxFrom('spotlightAngleLevel', 0) +
        workshopUltimateTotalStonesToMaxFrom('spotlightQuantityLevel', 0),
    ).toBe(42_236)
  })

  it('Black Hole size L7 shows 44.00m with next cost 64', () => {
    expect(workshopUltimateStatDisplay('blackHoleSizeLevel', 7)).toBe('44.00m')
    expect(workshopUltimateNextMarginalStones('blackHoleSizeLevel', 7)).toBe(64)
  })

  it('Black Hole cooldown L0 shows 200s with next cost 10', () => {
    expect(workshopUltimateStatDisplay('blackHoleCooldownLevel', 0)).toBe('200s')
    expect(workshopUltimateNextMarginalStones('blackHoleCooldownLevel', 0)).toBe(10)
  })

  it('Black Hole basic upgrades match wiki totals (9,723 stones)', () => {
    expect(workshopUltimateMaxLevel('blackHoleSizeLevel')).toBe(20)
    expect(workshopUltimateMaxLevel('blackHoleDurationLevel')).toBe(23)
    expect(workshopUltimateMaxLevel('blackHoleCooldownLevel')).toBe(15)
    expect(workshopUltimateStatDisplay('blackHoleSizeLevel', 20)).toBe('70.00m')
    expect(workshopUltimateStatDisplay('blackHoleDurationLevel', 23)).toBe('38s')
    expect(workshopUltimateStatDisplay('blackHoleCooldownLevel', 15)).toBe('50s')
    expect(workshopUltimateTotalStonesToMaxFrom('blackHoleSizeLevel', 0)).toBe(2_291)
    expect(workshopUltimateTotalStonesToMaxFrom('blackHoleDurationLevel', 0)).toBe(5_392)
    expect(workshopUltimateTotalStonesToMaxFrom('blackHoleCooldownLevel', 0)).toBe(2_040)
    expect(
      workshopUltimateTotalStonesToMaxFrom('blackHoleSizeLevel', 0) +
        workshopUltimateTotalStonesToMaxFrom('blackHoleDurationLevel', 0) +
        workshopUltimateTotalStonesToMaxFrom('blackHoleCooldownLevel', 0),
    ).toBe(9_723)
  })

  it('weapon unlock costs follow wiki order (9705 total)', () => {
    const empty = {}
    expect(workshopUltimateUnlockCostForWeapon(empty, 'goldenTower')).toBe(5)
    expect(workshopUltimateOwnedCount(empty)).toBe(0)

    const oneOwned = { goldenTowerOwned: true }
    expect(workshopUltimateWeaponIsOwned(oneOwned, 'goldenTower')).toBe(true)
    expect(workshopUltimateUnlockCostForWeapon(oneOwned, 'chainLightning')).toBe(50)
    expect(workshopUltimateUnlockSpentStones(oneOwned)).toBe(5)
    expect(workshopUltimateUnlockToMaxStones(oneOwned)).toBe(9700)

    const allOwned = Object.fromEntries(
      WORKSHOP_ULTIMATE_WEAPON_ORDER.map((id) => [workshopUltimateOwnedKey(id), true]),
    )
    expect(workshopUltimateOwnedCount(allOwned)).toBe(9)
    expect(workshopUltimateUnlockCostForWeapon(allOwned, 'spotlight')).toBeNull()
    expect(workshopUltimateUnlockSpentStones(allOwned)).toBe(9705)
    expect(workshopUltimateUnlockToMaxStones(allOwned)).toBe(0)
  })

  it('treats legacy upgrade levels as owned', () => {
    expect(workshopUltimateWeaponIsOwned({ goldenTowerBonusLevel: 1 }, 'goldenTower')).toBe(
      true,
    )
  })

  it('every ultimate row has a finite max level', () => {
    expect(workshopUltimateMaxLevel('spotlightAngleLevel')).toBeGreaterThan(0)
    expect(
      workshopUltimateNextMarginalStones(
        'spotlightAngleLevel',
        workshopUltimateMaxLevel('spotlightAngleLevel'),
      ),
    ).toBeUndefined()
  })
})
