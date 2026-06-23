import { readFileSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { parseResearchManifest, parseResearchSection } from '../types/research'
import {
  cardMasterySectionIndex,
  clearWorkshopCardMasteryOverrides,
  parseCardMasteryTierMultiplier,
  workshopCardMasteryLevel,
  workshopCardMasteryMultiplier,
  workshopCardMasteryUnlocked,
} from './workshopCardMastery'
import { formatWorkshopGameCardStarEffectWithMastery } from './workshopGameCardWiki'

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

describe('workshopCardMastery', () => {
  const data = loadResearchData()

  it('maps card ids to card-mastery section rows', () => {
    const si = cardMasterySectionIndex(data)
    expect(si).toBe(10)
    expect(data.sections[si]?.sectionSlug).toBe('card-mastery')
    expect(data.sections[si]?.items[0]?.name).toBe('Damage Mastery')
    expect(data.sections[si]?.items[27]?.name).toBe('Berserker Mastery')
  })

  it('treats mastery as unlocked when simulator level is above 0', () => {
    const si = cardMasterySectionIndex(data)
    const overrides = { [`${si}-0`]: 2 }
    expect(workshopCardMasteryLevel('damage', data, overrides)).toBe(2)
    expect(workshopCardMasteryUnlocked('damage', data, overrides)).toBe(true)
    expect(workshopCardMasteryUnlocked('attackSpeed', data, overrides)).toBe(false)
  })

  it('parses tier labels and scales card effects', () => {
    expect(parseCardMasteryTierMultiplier('x5')).toBe(5)
    const si = cardMasterySectionIndex(data)
    const overrides = { [`${si}-0`]: 9 }
    expect(workshopCardMasteryMultiplier('damage', data, overrides)).toBe(5)
    expect(formatWorkshopGameCardStarEffectWithMastery('damage', 7, 5)).toBe('×20')
  })

  it('clears card mastery lab overrides', () => {
    const si = cardMasterySectionIndex(data)
    const overrides = { [`${si}-0`]: 3, [`${si}-5`]: 1, '4-2': 7 }
    const cleared = clearWorkshopCardMasteryOverrides(data, overrides)
    expect(cleared[`${si}-0`]).toBe(0)
    expect(cleared[`${si}-5`]).toBe(0)
    expect(cleared['4-2']).toBe(7)
    expect(workshopCardMasteryUnlocked('damage', data, cleared)).toBe(false)
  })
})
