import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defaultTowerWorkspace } from '../towerWorkspaceStorage'
import {
  buildEmptyAccountWorkspaceBackup,
  hasMeaningfulWorkspaceData,
  hasNonEmptyPresetLabelsInBuild,
} from './buildBackup'
import { hasMeaningfulCloudWorkspaceBackup } from './reconcile'

beforeEach(() => {
  vi.stubGlobal('window', {
    dispatchEvent: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })
})

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

describe('buildEmptyAccountWorkspaceBackup', () => {
  it('produces a cloud backup reconcile treats as empty', () => {
    const backup = buildEmptyAccountWorkspaceBackup('2026-06-18T12:00:00.000Z')
    const workspace = defaultTowerWorkspace()
    expect(hasMeaningfulCloudWorkspaceBackup(backup)).toBe(false)
    expect(hasMeaningfulWorkspaceData(workspace, defaultTowerWorkspace())).toBe(false)
    expect(backup.updatedAt).toBe('2026-06-18T12:00:00.000Z')
  })
})
