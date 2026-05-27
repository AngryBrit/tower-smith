import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { decodePlayerInfoFile } from './decodePlayerInfo'
import { mapPlayerSaveToTower, researchLevelsToOverrides } from './mapPlayerDataToTower'
import { importPlayerInfoDat } from './importPlayerInfo'
import {
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

const SAMPLE = 'h:/The Tower/playerInfo.dat'

function minimalResearchData(): ResearchData {
  return {
    sections: [
      {
        title: 'Main',
        sectionSlug: 'main-research',
        items: [
          { name: 'Game Speed', level: '0', benefit: '', time: '', cost: '', state: 'default' },
          { name: 'Starting Cash', level: '0', benefit: '', time: '', cost: '', state: 'default' },
        ],
      },
      {
        title: 'Attack',
        sectionSlug: 'attack-research',
        items: [
          { name: 'Damage', level: '0', benefit: '', time: '', cost: '', state: 'default' },
        ],
      },
    ],
  }
}

describe('importPlayerInfo', () => {
  it('decodes sample save when present', async () => {
    if (!existsSync(SAMPLE)) return
    const save = await decodePlayerInfoFile(new Uint8Array(readFileSync(SAMPLE)))
    expect(save.researchLevel.length).toBe(250)
    expect(save.upgradeWorkshopLevel.length).toBe(20)
    expect(save.upgradeWorkshopLevel[0]).toBeGreaterThan(0)
  })

  it('maps research and workshop from sample save', async () => {
    if (!existsSync(SAMPLE)) return
    const data = loadResearchDataSync()
    const save = await decodePlayerInfoFile(new Uint8Array(readFileSync(SAMPLE)))
    expect(save?.researchLevel?.length).toBe(250)
    expect(save.researchLevel[30]).toBe(7)
    expect(save.researchLevel[0]).toBe(46)
    const overrides = researchLevelsToOverrides(data, save.researchLevel)
    expect(overrides['0-0']).toBe(7)
    expect(overrides['1-0']).toBe(46)
    const { workshop: ws } = mapPlayerSaveToTower(data, save)
    expect(ws.damageLevel).toBe(save.upgradeWorkshopLevel[0])
  })

  it('does not import card mastery from researchLevel', async () => {
    if (!existsSync(SAMPLE)) return
    const data = loadResearchDataSync()
    const save = await decodePlayerInfoFile(new Uint8Array(readFileSync(SAMPLE)))
    const overrides = researchLevelsToOverrides(data, save.researchLevel)
    const masterySi = data.sections.findIndex((s) => s.sectionSlug === 'card-mastery')
    expect(masterySi).toBeGreaterThanOrEqual(0)
    expect(overrides[`${masterySi}-0`]).toBeUndefined()
  })

  it('importPlayerInfoDat returns ok for sample', async () => {
    if (!existsSync(SAMPLE)) return
    const r = await importPlayerInfoDat(new Uint8Array(readFileSync(SAMPLE)), minimalResearchData())
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.overrides['0-0']).toBeGreaterThan(0)
      expect(r.workshop.damageLevel).toBeGreaterThan(0)
      expect(r.themes.ownedIds.length).toBeGreaterThan(0)
      expect(r.themes.selection?.tower).toBeTruthy()
    }
  })

  it('maps relics, bots, and ultimates from sample save', async () => {
    if (!existsSync(SAMPLE)) return
    const data = loadResearchDataSync()
    const save = await decodePlayerInfoFile(new Uint8Array(readFileSync(SAMPLE)))
    const { workshop: ws, themes } = mapPlayerSaveToTower(data, save)
    expect(ws.relicOwnedIds.length).toBeGreaterThan(0)
    expect(save.botsLevel.length).toBeGreaterThan(0)
    expect(save.ultimateWeaponLevel.length).toBeGreaterThan(0)
    expect(themes.selection?.tower).toBeTruthy()
  })
})
