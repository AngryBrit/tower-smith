import { describe, expect, it } from 'vitest'
import { loadResearchFixture } from '../test/researchFixture'
import { buildLabSheetNameIndex, labSheetItemRefFromName } from './labSheetNames'

describe('labSheetNames', () => {
  it('maps Laboratory sheet aliases to research manifest rows', () => {
    const data = loadResearchFixture()
    const index = buildLabSheetNameIndex(data)

    const superCrit = labSheetItemRefFromName('Super Crit Multi', index)
    expect(superCrit?.canonicalName).toBe('Super Crit Mult')

    const swampRend = labSheetItemRefFromName('Swamp Rend', index)
    expect(swampRend?.canonicalName).toBe('Swamp Rend - Basic Enemies')

    const swampRendPlus = labSheetItemRefFromName('Swamp Rend+', index)
    expect(swampRendPlus?.canonicalName).toBe('Swamp Rend - Additional Enemies')
  })
})
