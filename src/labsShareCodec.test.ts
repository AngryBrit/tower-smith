import { describe, expect, it } from 'vitest'
import { buildLabsShareFile, isLabsShareFile } from './labsShareCodec'
import { defaultWorkshopPersisted } from './labPresetsStorage'

describe('buildLabsShareFile', () => {
  it('builds v4 file with workshop and name', () => {
    const file = buildLabsShareFile(
      { '2-2': 4 },
      defaultWorkshopPersisted(),
      'My build',
      { ownedIds: ['skin-a'] },
    )
    expect(isLabsShareFile(file)).toBe(true)
    expect(file.o['2-2']).toBe(4)
    expect(file.n).toBe('My build')
    expect(file.t?.owned).toEqual(['skin-a'])
    expect(file.w).toBeDefined()
  })
})
