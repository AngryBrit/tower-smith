import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  workshopBotIsActive,
  workshopBotIsOwned,
} from '../data/workshopBots'
import {
  parseResearchManifest,
  parseResearchSection,
  type ResearchData,
} from '../types/research'
import { decodePlayerInfoFile } from './decodePlayerInfo'
import { mapPlayerSaveToTower } from './mapPlayerDataToTower'

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

const JETHRO_SAVE = 'H:/The Tower/SaveGames/Jethro Tan.dat'

describe('hydrateLegacyBotPresetFlatFields', () => {
  it('imports medal bots from legacy bots*Presets arrays (Jethro save)', async () => {
    if (!existsSync(JETHRO_SAVE)) return

    const save = await decodePlayerInfoFile(new Uint8Array(readFileSync(JETHRO_SAVE)))
    expect(save.botPresets.flame?.length ?? 0).toBe(0)
    expect(save.botsUnlocked[0]).toBe(true)
    expect(save.botsActive[0]).toBe(true)
    expect(save.botsLevel[4]).toBe(18)
    expect(save.botsLevel[5]).toBe(15)
    expect(save.botsLevel[10]).toBe(13)
    expect(save.botsLevel[14]).toBe(10)

    const data = loadResearchDataSync()
    const { workshop: ws } = mapPlayerSaveToTower(data, save)
    expect(workshopBotIsOwned(ws, 'flame')).toBe(true)
    expect(workshopBotIsActive(ws, 'flame')).toBe(true)
    expect(workshopBotIsOwned(ws, 'golden')).toBe(true)
    expect(ws.goldenBotBonusLevel).toBe(13)
    expect(ws.thunderBotDurationLevel).toBe(18)
    expect(ws.thunderBotCooldownLevel).toBe(15)
  })
})
