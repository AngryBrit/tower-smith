import { describe, expect, it } from 'vitest'
import {
  WORKSHOP_FREE_UPGRADE_WORKSHOP_PERCENT_STEP,
  workshopDisplayedFreeUpgradesEnhancementWorkshopPercentPoints,
  workshopEnhanceFreeUpgradesMultiplier,
} from './workshopEnhanceFreeUpgrades'

describe('workshopDisplayedFreeUpgradesEnhancementWorkshopPercentPoints', () => {
  it('returns 0 when enhancements lab is locked or level is 0', () => {
    expect(
      workshopDisplayedFreeUpgradesEnhancementWorkshopPercentPoints(10, 49.5, 10, 6, 6, false),
    ).toBe(0)
    expect(
      workshopDisplayedFreeUpgradesEnhancementWorkshopPercentPoints(0, 49.5, 10, 6, 6, true),
    ).toBe(0)
  })

  it('calibrates enhance L10 on workshop L99 with card +10% (player save)', () => {
    const workshop = 49.5
    const card = 10
    const sub = 6

    const attackEnhance = workshopDisplayedFreeUpgradesEnhancementWorkshopPercentPoints(
      10,
      workshop,
      card,
      6,
      sub,
      true,
    )
    const defenseEnhance = workshopDisplayedFreeUpgradesEnhancementWorkshopPercentPoints(
      10,
      workshop,
      card,
      8,
      sub,
      true,
    )

    expect(attackEnhance).toBeCloseTo(4.8668, 3)
    expect(defenseEnhance).toBeCloseTo(4.30875, 4)
    expect((71.5 + attackEnhance).toFixed(2)).toBe('76.37')
    expect((73.5 + defenseEnhance).toFixed(2)).toBe('77.81')
  })

  it('uses completed tier L-1 like Cash Bonus +', () => {
    const workshop = 49.5
    const card = 10
    const sub = 6
    const enhance = workshopDisplayedFreeUpgradesEnhancementWorkshopPercentPoints(
      10,
      workshop,
      card,
      6,
      sub,
      true,
    )
    const multLm1 = workshopEnhanceFreeUpgradesMultiplier(9)
    const multL = workshopEnhanceFreeUpgradesMultiplier(10)
    const tierOnly = (multLm1 - 1) * workshop
    const marginal =
      (multL - multLm1) * workshop * (workshop / (workshop + card))
    expect(enhance).toBeCloseTo(tierOnly + marginal, 8)
  })

  it('reduces tier base when relic-only exceeds submodule', () => {
    const workshop = 49.5
    const sub = 6
    const relic = 8
    const excess = relic - sub
    const tierBase =
      workshop -
      (excess * (sub + WORKSHOP_FREE_UPGRADE_WORKSHOP_PERCENT_STEP)) / relic
    expect(tierBase).toBeCloseTo(47.875, 8)
    expect(
      workshopDisplayedFreeUpgradesEnhancementWorkshopPercentPoints(
        10,
        workshop,
        10,
        relic,
        sub,
        true,
      ),
    ).toBeCloseTo((workshopEnhanceFreeUpgradesMultiplier(9) - 1) * tierBase, 8)
  })
})
