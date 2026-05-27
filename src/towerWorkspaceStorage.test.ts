import { describe, expect, it } from 'vitest'
import { defaultTowerWorkspace, clearTowerWorkspace, sanitizeTowerWorkspace } from './towerWorkspaceStorage'
import { maxWorkshopCardStars, defaultWorkshopPersisted } from './labPresetsStorage'
import { splitTowerBuild } from './towerBuildStorage'

describe('towerWorkspaceStorage', () => {
  it('defaults include empty lab and build', () => {
    const ws = defaultTowerWorkspace()
    expect(ws.lab.levelOverrides).toEqual({})
    expect(ws.build.workshop.damageLevel).toBe(0)
    expect(ws.themes.ownedIds).toEqual([])
  })

  it('clearTowerWorkspace resets lab, build, and themes', () => {
    const before = {
      ...defaultTowerWorkspace(),
      lab: { levelOverrides: { '0-0': 5 } },
      build: splitTowerBuild(maxWorkshopCardStars(defaultWorkshopPersisted())),
      themes: { ownedIds: ['theme-a'], selection: defaultTowerWorkspace().themes.selection },
    }
    const after = clearTowerWorkspace(before)
    expect(after.lab.levelOverrides).toEqual({})
    expect(after.build.cards.cardStars.damage).toBe(0)
    expect(after.themes.ownedIds).toEqual([])
  })

  it('accepts nested workspace payloads', () => {
    const ws = defaultTowerWorkspace()
    expect(sanitizeTowerWorkspace(ws)).toEqual(ws)
  })
})
