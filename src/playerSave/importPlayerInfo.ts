import { sanitizeLevelOverrides } from '../labLevelOverridesSanitize'
import type { ResearchData } from '../types/research'
import type { TowerThemesSnapshot } from '../towerDataThemes'
import { decodePlayerInfoFile } from './decodePlayerInfo'
import { mapPlayerSaveToTower } from './mapPlayerDataToTower'

export type ImportPlayerInfoError =
  | 'empty'
  | 'read_failed'
  | 'invalid_save'
  | 'gzip_unsupported'

export type ImportPlayerInfoResult =
  | {
      ok: true
      overrides: Record<string, number>
      workshop: ReturnType<typeof mapPlayerSaveToTower>['workshop']
      themes: TowerThemesSnapshot
    }
  | { ok: false; error: ImportPlayerInfoError }

export async function importPlayerInfoDat(
  bytes: Uint8Array,
  data: ResearchData,
): Promise<ImportPlayerInfoResult> {
  if (!bytes.length) return { ok: false, error: 'empty' }
  try {
    const save = await decodePlayerInfoFile(bytes)
    const { overrides, workshop, themes } = mapPlayerSaveToTower(data, save)
    return {
      ok: true,
      overrides: sanitizeLevelOverrides(data, overrides),
      workshop,
      themes,
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : ''
    if (msg === 'gzip_player_save_requires_decompression_stream') {
      return { ok: false, error: 'gzip_unsupported' }
    }
    return { ok: false, error: 'invalid_save' }
  }
}
