import { describe, expect, it, vi, beforeEach } from 'vitest'
import {
  collectSpreadsheetIdsFromGateway,
  linkedWorkbookNamesFromGateway,
} from './grantEffectivePathsSpreadsheetAccess'
import type { EffectivePathsIdsGateway } from './assembleEffectivePathsListResult'
import {
  readCachedLinkedSpreadsheetIds,
  writeCachedLinkedSpreadsheetIds,
} from './effectivePathsLinkedSpreadsheetCache'

const gateway: EffectivePathsIdsGateway = {
  idsTabTitle: 'IDS',
  workbooks: [],
  relicsWorkbook: { name: 'Relics', spreadsheetId: 'relics-1' },
  themesWorkbook: null,
  cardsWorkbook: null,
  workshopWorkbook: { name: 'Workshop', spreadsheetId: 'shop-1' },
  botsWorkbook: null,
  laboratoryWorkbook: { name: 'Laboratory', spreadsheetId: 'lab-1' },
  uwsWorkbook: null,
  guardiansWorkbook: null,
  modulesWorkbook: null,
}

describe('collectSpreadsheetIdsFromGateway', () => {
  it('includes the master ID and every unique linked workbook ID', () => {
    expect(collectSpreadsheetIdsFromGateway(gateway, 'master-1').sort()).toEqual([
      'lab-1',
      'master-1',
      'relics-1',
      'shop-1',
    ])
  })
})

describe('linkedWorkbookNamesFromGateway', () => {
  it('returns IDS category names for linked workbooks', () => {
    expect(linkedWorkbookNamesFromGateway(gateway).sort()).toEqual([
      'Laboratory',
      'Relics',
      'Workshop',
    ])
  })
})

describe('effectivePathsLinkedSpreadsheetCache', () => {
  beforeEach(() => {
    const store = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem(key: string) {
        return store.get(key) ?? null
      },
      setItem(key: string, value: string) {
        store.set(key, value)
      },
      removeItem(key: string) {
        store.delete(key)
      },
    })
  })

  it('round-trips linked IDs per IDS Master', () => {
    writeCachedLinkedSpreadsheetIds('master-1', ['lab-1', 'relics-1', 'master-1'])
    expect(readCachedLinkedSpreadsheetIds('master-1')).toEqual(['lab-1', 'relics-1'])
    expect(readCachedLinkedSpreadsheetIds('other-master')).toEqual([])
  })
})
