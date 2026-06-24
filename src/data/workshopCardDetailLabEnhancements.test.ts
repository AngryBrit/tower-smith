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

  it('returns Death Ray Double Death Ray lab row with simulator level', () => {
    const cardsSi = data.sections.findIndex((s) => s.sectionSlug === 'cards-research')
    expect(cardsSi).toBeGreaterThanOrEqual(0)
    const overrides = { [`${cardsSi}-1`]: 9 }
    const rows = workshopCardDetailLabEnhancements('deathRay', data, overrides)
    expect(rows).toHaveLength(1)
    expect(rows[0]?.titleId).toBe('ws_cards_detail_lab_death_ray_double_title')
    expect(rows[0]?.descId).toBe('ws_cards_detail_lab_death_ray_double_desc')
    expect(rows[0]?.value).toBe('9.00%')
  })

  it('returns 0.00% Double Death Ray when lab level is zero', () => {
    const rows = workshopCardDetailLabEnhancements('deathRay', data, {})
    expect(rows[0]?.value).toBe('0.00%')
  })

  it('returns Super Tower Bonus lab row with simulator level', () => {
    const cardsSi = data.sections.findIndex((s) => s.sectionSlug === 'cards-research')
    expect(cardsSi).toBeGreaterThanOrEqual(0)
    const overrides = { [`${cardsSi}-5`]: 2 }
    const rows = workshopCardDetailLabEnhancements('superTower', data, overrides)
    expect(rows).toHaveLength(1)
    expect(rows[0]?.titleId).toBe('ws_cards_detail_lab_super_tower_bonus_title')
    expect(rows[0]?.descId).toBe('ws_cards_detail_lab_super_tower_bonus_desc')
    expect(rows[0]?.value).toBe('x1.06')
  })

  it('returns x1.00 Super Tower Bonus when lab level is zero', () => {
    const rows = workshopCardDetailLabEnhancements('superTower', data, {})
    expect(rows[0]?.value).toBe('x1.00')
  })

  it('returns Second Wind lab rows with simulator levels', () => {
    const cardsSi = data.sections.findIndex((s) => s.sectionSlug === 'cards-research')
    expect(cardsSi).toBeGreaterThanOrEqual(0)
    const overrides = { [`${cardsSi}-0`]: 4, [`${cardsSi}-6`]: 2 }
    const rows = workshopCardDetailLabEnhancements('secondWind', data, overrides)
    expect(rows).toHaveLength(2)
    expect(rows[0]?.titleId).toBe('ws_cards_detail_lab_second_wind_blast_title')
    expect(rows[0]?.descId).toBe('ws_cards_detail_lab_second_wind_blast_desc')
    expect(rows[0]?.value).toBe('100%')
    expect(rows[1]?.titleId).toBe('ws_cards_detail_lab_second_wind_recharge_title')
    expect(rows[1]?.descId).toBe('ws_cards_detail_lab_second_wind_recharge_desc')
    expect(rows[1]?.value).toBe('1500')
  })

  it('returns zero Second Wind lab values when labs are not unlocked', () => {
    const rows = workshopCardDetailLabEnhancements('secondWind', data, {})
    expect(rows[0]?.value).toBe('0%')
    expect(rows[1]?.value).toBe('0')
  })
})
