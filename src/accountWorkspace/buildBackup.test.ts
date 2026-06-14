import { describe, expect, it } from 'vitest'
import { defaultTowerWorkspace } from '../towerWorkspaceStorage'
import {
  hasMeaningfulWorkspaceData,
  hasNonEmptyPresetLabelsInBuild,
} from './buildBackup'

describe('hasNonEmptyPresetLabelsInBuild', () => {
  it('detects custom card or module preset labels', () => {
    const workspace = defaultTowerWorkspace()
    workspace.build.cards.cardPresetLabels[0] = 'Farming'
    expect(hasNonEmptyPresetLabelsInBuild(workspace.build)).toBe(true)

    const modulesOnly = defaultTowerWorkspace()
    modulesOnly.build.modules.modulePresetLabels[2] = 'Raid'
    expect(hasNonEmptyPresetLabelsInBuild(modulesOnly.build)).toBe(true)
  })
})

describe('hasMeaningfulWorkspaceData', () => {
  it('treats preset labels alone as syncable workspace data', () => {
    const workspace = defaultTowerWorkspace()
    workspace.build.cards.cardPresetLabels[1] = 'Tourney'
    expect(hasMeaningfulWorkspaceData(workspace, defaultTowerWorkspace())).toBe(true)
  })
})
