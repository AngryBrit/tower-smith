import { describe, expect, it } from 'vitest'
import { loadResearchFixture } from '../test/researchFixture'
import { buildLabSheetNameIndex } from './labSheetNames'
import { buildLabSheetUpdates } from './buildLabSheetUpdates'
import type { EffectivePathsLabSheetRow } from './labSheetLayout'

describe('buildLabSheetUpdates', () => {
  it('writes Level column cells from level overrides', () => {
    const data = loadResearchFixture()
    const index = buildLabSheetNameIndex(data)
    const golden = index.get('golden bot - cooldown')
    expect(golden).toBeDefined()

    const labRows: EffectivePathsLabSheetRow[] = [
      {
        rowIndex: 5,
        name: 'Golden Bot - Cooldown',
        levelCol: 37,
        itemRef: golden!,
      },
    ]

    const batch = buildLabSheetUpdates('Master Sheet', labRows, data, {
      [`${golden!.sectionIndex}-${golden!.itemIndex}`]: 3,
    })

    expect(batch).toEqual([
      {
        range: "'Master Sheet'!AL5",
        values: [[3]],
      },
    ])
  })
})
