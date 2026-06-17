import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { parseResearchManifest, parseResearchSection } from '../types/research'
import { gameResearchIdForManifest } from './gameResearchIndex'

const srcDir = dirname(fileURLToPath(import.meta.url))

function loadResearchDataSync() {
  const manifestRaw: unknown = JSON.parse(
    readFileSync(join(srcDir, '../../public/research/manifest.json'), 'utf-8'),
  )
  const { sectionFiles } = parseResearchManifest(manifestRaw)
  const sections = sectionFiles.map((rel: string) => {
    const raw: unknown = JSON.parse(
      readFileSync(join(srcDir, '../../public', rel.replace(/^\//, '')), 'utf-8'),
    )
    const slug = rel.split('/').pop()!.replace(/\.json$/i, '')
    return parseResearchSection(raw, slug)
  })
  return { sections }
}

describe('gameResearchIndex', () => {
  it('maps main and attack labs to known game research ids', () => {
    const data = loadResearchDataSync()
    expect(data.sections[0]!.sectionSlug).toBe('main-research')
    expect(data.sections[1]!.sectionSlug).toBe('attack-research')
    expect(gameResearchIdForManifest(data, 0, 0)).toBe(30)
    expect(gameResearchIdForManifest(data, 1, 0)).toBe(0)
  })

  it('maps Dissonant Echo Attack/Defense/Utility to game research ids 239/240/238', () => {
    const data = loadResearchDataSync()
    const main = data.sections.find((s) => s.sectionSlug === 'main-research')!
    const si = data.sections.indexOf(main)
    const attackIi = main.items.findIndex((i) => i.name === 'Dissonant Echo - Attack')
    const defenseIi = main.items.findIndex((i) => i.name === 'Dissonant Echo - Defense')
    const utilityIi = main.items.findIndex((i) => i.name === 'Dissonant Echo - Utility')
    expect(gameResearchIdForManifest(data, si, attackIi)).toBe(239)
    expect(gameResearchIdForManifest(data, si, defenseIi)).toBe(240)
    expect(gameResearchIdForManifest(data, si, utilityIi)).toBe(238)
  })
})
