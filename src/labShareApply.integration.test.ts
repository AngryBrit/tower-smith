import { describe, expect, it } from 'vitest'
import { applyLabsShareFileToWorkspace } from './lab/labShareActions'
import { defaultWorkshopPersisted } from './labPresetsStorage'
import { encodeLabsShareQueryValue } from './labsShareCodec'
import { parseLabLevelsPayload } from './parseLabLevelsPayload'
import { defaultTowerWorkspace } from './towerWorkspaceStorage'
import { loadResearchFixture } from './test/researchFixture'
import { serializeTowerUnifiedCsv } from './towerUnifiedCsv'

describe('lab share apply integration', () => {
  const data = loadResearchFixture()

  it('applyLabsShareFileToWorkspace sets overrides from share file', () => {
    const overrides = { '0-0': 6, '0-1': 2 }
    let levelOverrides: Record<string, number> = {}
    let workspace = defaultTowerWorkspace()
    const ok = applyLabsShareFileToWorkspace(
      data,
      { v: 4, o: overrides },
      defaultWorkshopPersisted(),
      (next) => {
        levelOverrides = next
      },
      (updater) => {
        workspace = updater(workspace)
      },
      (updater) => {
        workspace = updater(workspace)
      },
    )
    expect(ok).toBe(true)
    expect(levelOverrides['0-0']).toBe(6)
    expect(levelOverrides['0-1']).toBe(2)
    expect(workspace.lab.levelOverrides['0-0']).toBe(6)
  })

  it('?tower= payload round-trips through parse and apply', async () => {
    const enc = await encodeLabsShareQueryValue({ '0-0': 4 })
    const parsed = await parseLabLevelsPayload(
      `https://example.test/?tower=${enc}`,
      data,
    )
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return

    let applied: Record<string, number> = {}
    applyLabsShareFileToWorkspace(
      data,
      { v: 4, o: parsed.overrides },
      defaultWorkshopPersisted(),
      (next) => {
        applied = next
      },
      () => {},
      () => {},
    )
    expect(applied['0-0']).toBe(4)
  })

  it('tower CSV export round-trips lab overrides', async () => {
    const ws = { ...defaultWorkshopPersisted(), damageLevel: 2 }
    const csv = serializeTowerUnifiedCsv({ '0-0': 3, '0-1': 1 }, ws)
    const parsed = await parseLabLevelsPayload(csv, data)
    expect(parsed.ok).toBe(true)
    if (parsed.ok) {
      expect(parsed.overrides['0-0']).toBe(3)
      expect(parsed.overrides['0-1']).toBe(1)
      expect(parsed.workshop?.damageLevel).toBe(2)
    }
  })
})
