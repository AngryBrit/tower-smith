import { describe, expect, it } from 'vitest'
import {
  buildBugReport,
  buildBugReportMailtoUrl,
  buildGitHubIssueUrl,
  BUG_REPORT_SUPPORT_EMAIL,
} from './bugReport'

describe('buildBugReport', () => {
  const env = {
    version: '2.8.11',
    mainPanel: 'relics' as const,
    locale: 'en',
    colorScheme: 'dark',
    url: 'https://www.towersmith.com/',
    wikiDataAlignedAt: '2026-05-01T00:00:00.000Z',
    userAgent: 'TestAgent',
    online: true,
    viewport: '800×600',
    labOverrideCount: 3,
    galleryBackendConfigured: true,
    signedIn: false,
  }

  it('includes category, description, and environment', () => {
    const report = buildBugReport(
      {
        category: 'wrong_stat',
        categoryLabel: 'Wrong stat',
        description: 'Damage looks too low',
        steps: 'Open workshop',
        mainPanel: 'workshop',
        mainPanelLabel: 'WORKSHOP',
      },
      env,
    )
    expect(report).toContain('TowerSmith bug report')
    expect(report).toContain('Wrong stat (wrong_stat)')
    expect(report).toContain('Damage looks too low')
    expect(report).toContain('Open workshop')
    expect(report).toContain('TowerSmith v2.8.11')
    expect(report).toContain('Active tab: WORKSHOP (workshop)')
    expect(report).not.toContain('SHA-256')
  })

  it('includes save metadata when attached', () => {
    const report = buildBugReport(
      {
        category: 'import',
        categoryLabel: 'Save import',
        description: 'Import failed',
        saveAttachment: {
          fileName: 'playerInfo.dat',
          sizeBytes: 1024,
          gzip: true,
          sha256Hex: 'a'.repeat(64),
        },
      },
      env,
    )
    expect(report).toContain('Save attachment (metadata)')
    expect(report).toContain('playerInfo.dat')
    expect(report).toContain('a'.repeat(64))
  })

  it('includes error block when provided', () => {
    const report = buildBugReport(
      {
        category: 'crash',
        categoryLabel: 'Crash',
        description: 'Tab crashed',
        errorContext: {
          error: new Error('boom'),
          componentStack: ' at RelicCard',
          panelId: 'relics',
          panelLabel: 'RELICS',
        },
      },
      env,
    )
    expect(report).toContain('Error: boom')
    expect(report).toContain('Crash panel: RELICS')
    expect(report).toContain('at RelicCard')
  })
})

describe('buildGitHubIssueUrl', () => {
  it('prefills title and body query params', () => {
    const url = buildGitHubIssueUrl(
      {
        category: 'ui',
        categoryLabel: 'UI',
        description: 'Button misaligned',
      },
      {
        version: '2.8.11',
        mainPanel: 'research',
        locale: 'en',
        colorScheme: 'dark',
        url: 'https://example.com/',
        wikiDataAlignedAt: null,
        userAgent: 'ua',
        online: true,
        viewport: '1×1',
        labOverrideCount: 0,
        galleryBackendConfigured: false,
        signedIn: false,
      },
    )
    expect(url).toContain('github.com/AngryBrit/tower-smith/issues/new?')
    const decoded = decodeURIComponent(url).replace(/\+/g, ' ')
    expect(decoded).toContain('[ui]')
    expect(decoded).toContain('Button misaligned')
  })
})

describe('buildBugReportMailtoUrl', () => {
  it('targets support email with subject and body', () => {
    const url = buildBugReportMailtoUrl({
      category: 'other',
      categoryLabel: 'Other',
      description: 'Something broke',
    })
    expect(url.startsWith(`mailto:${BUG_REPORT_SUPPORT_EMAIL}?`)).toBe(true)
    const decoded = decodeURIComponent(url).replace(/\+/g, ' ')
    expect(decoded).toContain('Something broke')
    expect(decoded).toContain('[TowerSmith]')
  })
})
