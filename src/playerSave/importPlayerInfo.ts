import { sanitizeLevelOverrides } from '../labLevelOverridesSanitize'
import { PROFILE_DISPLAY_NAME_MAX, PROFILE_GUILD_MAX } from '../profile/profileApi'
import type { ResearchData } from '../types/research'
import type { GuardianChipState } from '../guardianChipStorage'
import type { TowerThemesSnapshot } from '../towerDataThemes'
import { decodePlayerInfoFile } from './decodePlayerInfo'
import { mapPlayerSaveToTower } from './mapPlayerDataToTower'
import { validatePlayerInfoSize } from './playerInfoLimits'

export type ImportPlayerInfoError =
  | 'empty'
  | 'too_large'
  | 'read_failed'
  | 'invalid_save'
  | 'gzip_unsupported'

export type ImportPlayerInfoResult =
  | {
      ok: true
      overrides: Record<string, number>
      gameResearchLevel: number[]
      workshop: ReturnType<typeof mapPlayerSaveToTower>['workshop']
      themes: TowerThemesSnapshot
      guardianChips: GuardianChipState
      guild: string | null
      userName: string | null
      fakeUserName: string | null
      playfabId: string | null
      guildMeta: {
        season: number
        chestClaimedWeek: number
        seenChatDisclaimer: boolean
      }
    }
  | { ok: false; error: ImportPlayerInfoError }

function sanitizeImportedGuild(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed || trimmed.length > PROFILE_GUILD_MAX) return null
  return trimmed
}

function sanitizeImportedUserName(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed || trimmed.length > PROFILE_DISPLAY_NAME_MAX) return null
  return trimmed
}

function sanitizeImportedPlayfabId(raw: string): string | null {
  const trimmed = raw.trim().toUpperCase()
  if (!trimmed || trimmed.length > 64) return null
  if (!/^[A-Z0-9]+$/.test(trimmed)) return null
  return trimmed
}

export async function importPlayerInfoDat(
  bytes: Uint8Array,
  data: ResearchData,
): Promise<ImportPlayerInfoResult> {
  const sizeError = validatePlayerInfoSize(bytes.length)
  if (sizeError) return { ok: false, error: sizeError }
  try {
    const save = await decodePlayerInfoFile(bytes)
    const { overrides, workshop, themes, guardianChips } = mapPlayerSaveToTower(data, save)
    return {
      ok: true,
      overrides: sanitizeLevelOverrides(data, overrides),
      gameResearchLevel: [...save.researchLevel],
      workshop,
      themes,
      guardianChips,
      guild: sanitizeImportedGuild(save.lastGuildID),
      userName: sanitizeImportedUserName(save.userName),
      fakeUserName: sanitizeImportedUserName(save.fakeUserName),
      playfabId: sanitizeImportedPlayfabId(save.playfabID),
      guildMeta: {
        season: Math.max(0, Math.trunc(save.lastGuildSeason)),
        chestClaimedWeek: Math.max(0, Math.trunc(save.guildChestClaimedWeek)),
        seenChatDisclaimer: save.hasSeenGuildChatDisclaimer === true,
      },
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : ''
    if (msg === 'gzip_player_save_requires_decompression_stream') {
      return { ok: false, error: 'gzip_unsupported' }
    }
    return { ok: false, error: 'invalid_save' }
  }
}
