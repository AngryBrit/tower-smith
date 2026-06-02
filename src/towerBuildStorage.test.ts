import { describe, expect, it } from 'vitest'
import { maxWorkshopBots, maxWorkshopCardStars, defaultWorkshopPersisted } from './labPresetsStorage'
import { workshopBotIsOwned } from './data/workshopBots'
import {
  clearTowerBuild,
  defaultTowerBuild,
  flattenTowerBuild,
  sanitizeTowerBuild,
  splitTowerBuild,
} from './towerBuildStorage'

describe('towerBuildStorage', () => {
  it('round-trips flat workshop through split and flatten', () => {
    const flat = maxWorkshopBots(maxWorkshopCardStars(defaultWorkshopPersisted()))
    const build = splitTowerBuild(flat)
    expect(flattenTowerBuild(build)).toEqual(flat)
  })

  it('round-trips ultimate plus levels through split and flatten', () => {
    const flat = {
      ...defaultWorkshopPersisted(),
      ultimatePlusSpotlightLightRangeLevel: 0,
      ultimatePlusDeathWaveKillWallLevel: 3,
    }
    const build = splitTowerBuild(flat)
    expect(build.ultimates.ultimatePlusSpotlightLightRangeLevel).toBe(0)
    expect(build.ultimates.ultimatePlusDeathWaveKillWallLevel).toBe(3)
    expect(flattenTowerBuild(build).ultimatePlusSpotlightLightRangeLevel).toBe(0)
    expect(flattenTowerBuild(build).ultimatePlusDeathWaveKillWallLevel).toBe(3)
  })

  it('accepts nested build payloads', () => {
    const build = defaultTowerBuild()
    expect(sanitizeTowerBuild(build)).toEqual(build)
  })

  it('clearTowerBuild resets each domain', () => {
    const before = splitTowerBuild(
      maxWorkshopBots(
        maxWorkshopCardStars({
          ...defaultWorkshopPersisted(),
          relicOwnedIds: ['relic-a'],
          damageLevel: 42,
        }),
      ),
    )
    const after = clearTowerBuild({
      ...before,
      workshop: { ...before.workshop, mainTab: 'cards', hideMaxed: true },
    })
    expect(after.workshop.mainTab).toBe('cards')
    expect(after.workshop.hideMaxed).toBe(true)
    expect(after.workshop.damageLevel).toBe(0)
    expect(after.cards.cardStars.damage).toBe(0)
    expect(after.relics.relicOwnedIds).toEqual([])
    expect(workshopBotIsOwned(flattenTowerBuild(after), 'flame')).toBe(false)
  })
})
