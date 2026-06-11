import { describe, expect, it } from 'vitest'
import {
  effectivePathsSyncProgressPercent,
  syncWorkbookNameForTarget,
} from './effectivePathsSyncProgressLabel'

describe('effectivePathsSyncProgressLabel', () => {
  it('uses linked workbook name when available', () => {
    expect(syncWorkbookNameForTarget('uws', 'UWs v3.1.2')).toBe('UWs v3.1.2')
  })

  it('falls back to canonical category label', () => {
    expect(syncWorkbookNameForTarget('labs', '')).toBe('Laboratory')
  })

  it('computes percent from completed steps', () => {
    expect(
      effectivePathsSyncProgressPercent({
        direction: 'import',
        completed: 2,
        total: 8,
        currentWorkbookName: 'Cards',
      }),
    ).toBe(25)
  })
})
