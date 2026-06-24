import { describe, expect, it } from 'vitest'
import { parseResearchManifest, parseResearchSection } from '../types/research'
import { readFileSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  EXTRA_ORB_ADJUSTER_MAX_DISTANCE,
  workshopCardDetailLabEnhancements,
} from './workshopCardDetailLabEnhancements'

const srcDir = dirname(fileURLToPath(import.meta.url))

function loadResearchData() {
  const manifestRaw: unknown = JSON.parse(
    readFileSync(join(srcDir, '../../public/research/manifest.json'), 'utf-8'),
  )
  const { sectionFiles } = parseResearchManifest(manifestRaw)
  const sections = sectionFiles.map((rel: string) => {
    const raw: unknown = JSON.parse(
      readFileSync(join(srcDir, '../../public', rel.replace(/^\//, '')), 'utf-8'),
    )
    return parseResearchSection(raw, basename(rel, '.json'))
  })
  return { sections }
}

describe('workshopCardDetailLabEnhancements', () => {
  const data = loadResearchData()

  it('returns Extra Orb lab rows with simulator levels', () => {
    const cardsSi = data.sections.findIndex((s) => s.sectionSlug === 'cards-research')
    expect(cardsSi).toBeGreaterThanOrEqual(0)
    const overrides = { [`${cardsSi}-2`]: 1, [`${cardsSi}-3`]: 2 }
    const rows = workshopCardDetailLabEnhancements('extraOrb', data, overrides)
    expect(rows).toHaveLength(2)
    expect(rows[0]?.titleId).toBe('ws_cards_detail_lab_extra_orb_distance_title')
    expect(rows[0]?.value).toBe(String(EXTRA_ORB_ADJUSTER_MAX_DISTANCE))
    expect(rows[1]?.titleId).toBe('ws_cards_detail_lab_extra_orb_additional_title')
    expect(rows[1]?.value).toBe('2')
  })

  it('returns zero values when cards labs are not unlocked', () => {
    const rows = workshopCardDetailLabEnhancements('extraOrb', data, {})
    expect(rows[0]?.value).toBe('0')
    expect(rows[1]?.value).toBe('0')
  })

  it('returns no rows for cards without lab enhancements', () => {
    expect(workshopCardDetailLabEnhancements('damage', data, {})).toEqual([])
  })
})
