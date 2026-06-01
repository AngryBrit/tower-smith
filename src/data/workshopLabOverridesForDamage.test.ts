import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { damageLabMultiplierFromSave } from './workshopLabOverridesForDamage'
import {
  damageStyleLabMultiplier,
  parseResearchManifest,
  parseResearchSection,
  type ResearchData,
} from '../types/research'

const srcDir = dirname(fileURLToPath(import.meta.url))

function loadResearchDataSync(): ResearchData {
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

describe('damageLabMultiplierFromSave', () => {
  it('reads Damage lab from gameResearchLevel when overrides are empty', () => {
    const data = loadResearchDataSync()
    const mult = damageLabMultiplierFromSave(data, {}, [46])
    expect(mult).toBeCloseTo(damageStyleLabMultiplier(46, 100), 6)
  })

  it('returns 1 when save has no Damage research', () => {
    const data = loadResearchDataSync()
    expect(damageLabMultiplierFromSave(data, {}, [0])).toBe(1)
    expect(damageLabMultiplierFromSave(data, {}, undefined)).toBe(1)
  })
})
