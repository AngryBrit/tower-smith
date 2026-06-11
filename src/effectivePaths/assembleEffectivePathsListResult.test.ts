import { describe, expect, it } from 'vitest'
import {
  assembleEffectivePathsListResult,
  workbooksToAuthorizeFromGateway,
  type EffectivePathsIdsGateway,
} from './assembleEffectivePathsListResult'

const gateway: EffectivePathsIdsGateway = {
  idsTabTitle: 'IDS',
  workbooks: [{ name: 'Laboratory', spreadsheetId: 'lab-id' }],
  relicsWorkbook: { name: 'Relics', spreadsheetId: 'relic-id' },
  themesWorkbook: null,
  cardsWorkbook: null,
  workshopWorkbook: null,
  botsWorkbook: null,
  laboratoryWorkbook: { name: 'Laboratory', spreadsheetId: 'lab-id' },
  uwsWorkbook: null,
  modulesWorkbook: null,
}

describe('workbooksToAuthorizeFromGateway', () => {
  it('dedupes category workbooks by name and spreadsheet id', () => {
    const workbooks = workbooksToAuthorizeFromGateway(gateway)
    expect(workbooks).toHaveLength(2)
    expect(workbooks.map((row) => row.spreadsheetId).sort()).toEqual(['lab-id', 'relic-id'])
  })
})

describe('assembleEffectivePathsListResult', () => {
  it('maps per-category access from probed rows', () => {
    const result = assembleEffectivePathsListResult(gateway, [
      { name: 'Relics', spreadsheetId: 'relic-id', access: 'ok' },
      { name: 'Laboratory', spreadsheetId: 'lab-id', access: 'denied' },
    ])
    expect(result.relicsWorkbookAccess).toBe('ok')
    expect(result.laboratoryWorkbookAccess).toBe('denied')
    expect(result.workbookAccess).toHaveLength(2)
  })
})
