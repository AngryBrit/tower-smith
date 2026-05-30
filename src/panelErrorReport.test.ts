import { describe, expect, it } from 'vitest'
import { buildPanelErrorReport } from './panelErrorReport'

describe('buildPanelErrorReport', () => {
  it('includes version, panel, and error message', () => {
    const report = buildPanelErrorReport({
      panelId: 'relics',
      panelLabel: 'RELICS',
      error: new Error('boom'),
      componentStack: ' at RelicCard',
    })
    expect(report).toContain('TowerSmith v')
    expect(report).toContain('Panel: RELICS (relics)')
    expect(report).toContain('Error: boom')
    expect(report).toContain('Component stack:')
    expect(report).toContain('at RelicCard')
  })
})
