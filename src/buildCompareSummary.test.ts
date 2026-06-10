import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { defaultWorkshopPersisted } from './labPresetsStorage'
import {
  computeBuildCompareSummary,
  formatBuildStatPercentDelta,
} from './buildCompareSummary'
import {
  parseResearchManifest,
  parseResearchSection,
  type ResearchData,
} from './types/research'

const srcDir = dirname(fileURLToPath(import.meta.url))

function loadResearchDataSync(): ResearchData {
  const manifestRaw: unknown = JSON.parse(
    readFileSync(join(srcDir, '../public/research/manifest.json'), 'utf-8'),
  )
  const { sectionFiles } = parseResearchManifest(manifestRaw)
  const sections = sectionFiles.map((rel: string) => {
    const raw: unknown = JSON.parse(
      readFileSync(join(srcDir, '../public', rel.replace(/^\//, '')), 'utf-8'),
    )
    const slug = rel.split('/').pop()!.replace(/\.json$/i, '')
    return parseResearchSection(raw, slug)
  })
  return { sections }
}

describe('formatBuildStatPercentDelta', () => {
  it('formats signed percent change', () => {
    expect(formatBuildStatPercentDelta(100, 150)).toBe('+50.0%')
    expect(formatBuildStatPercentDelta(200, 100)).toBe('−50.0%')
    expect(formatBuildStatPercentDelta(100, 100)).toBe('0%')
  })
})

describe('computeBuildCompareSummary', () => {
  it('reports lab and relic differences', () => {
    const data = loadResearchDataSync()
    const wsA = defaultWorkshopPersisted()
    const wsB = {
      ...defaultWorkshopPersisted(),
      damageLevel: wsA.damageLevel + 5,
      relicOwnedIds: ['relic-only-b'],
    }
    const overridesA: Record<string, number> = { '0-0': 3 }
    const overridesB: Record<string, number> = { '0-0': 10 }

    const summary = computeBuildCompareSummary(data, overridesA, wsA, overridesB, wsB)

    expect(summary.topLabDiffs.length).toBeGreaterThan(0)
    expect(summary.topLabDiffs[0]?.levelA).toBe(3)
    expect(summary.topLabDiffs[0]?.levelB).toBe(10)
    expect(summary.relicsOnlyB).toEqual(['relic-only-b'])
    expect(summary.displayedDamageB).toBeGreaterThan(summary.displayedDamageA)
    expect(summary.workshopSpentB).toBeGreaterThanOrEqual(summary.workshopSpentA)
  })
})
