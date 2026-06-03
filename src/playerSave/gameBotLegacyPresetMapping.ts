import { WORKSHOP_BOT_ORDER } from './gameBotPresetMapping'
import {
  getBinaryPresetScalarArray,
  type PlayerDataContext,
} from './nrbfExtract'
import type { DecodedPlayerSave } from './decodePlayerInfo'

/** Legacy saves: `bots*Presets` BinaryArrays (3 presets) before per-bot `*BotPresets` lists. */
export const LEGACY_BOT_PRESET_SLOT_COUNT = 3
export const LEGACY_BOT_UNLOCK_SLOT_COUNT = 4
export const LEGACY_BOT_UPGRADE_SLOT_COUNT = 16

function hasModernBotPresets(save: DecodedPlayerSave): boolean {
  return WORKSHOP_BOT_ORDER.some((id) => (save.botPresets[id]?.length ?? 0) > 0)
}

/**
 * Copy the active bot preset row into flat `botsUnlocked` / `botsActive` / `botsLevel`
 * when the save uses legacy `bots*Presets` arrays (no `flameBotPresets`, etc.).
 */
export function hydrateLegacyBotPresetFlatFields(
  ctx: PlayerDataContext,
  save: DecodedPlayerSave,
): void {
  if (hasModernBotPresets(save)) return
  if (!ctx.player.memberNames.includes('botsLevelPresets')) return

  const preset = Math.max(
    0,
    Math.min(LEGACY_BOT_PRESET_SLOT_COUNT - 1, save.currentBotPreset),
  )

  const unlocked = getBinaryPresetScalarArray(ctx, 'botsUnlockedPresets')
  const active = getBinaryPresetScalarArray(ctx, 'botsActivePresets')
  const levelField = ctx.player.memberNames.includes('botsLevelSelectionPresets')
    ? 'botsLevelSelectionPresets'
    : 'botsLevelPresets'
  const levels = getBinaryPresetScalarArray(ctx, levelField)

  for (let bi = 0; bi < LEGACY_BOT_UNLOCK_SLOT_COUNT && bi < save.botsUnlocked.length; bi++) {
    const idx = bi * LEGACY_BOT_PRESET_SLOT_COUNT + preset
    if (unlocked.length > idx) save.botsUnlocked[bi] = unlocked[idx] === 1
    if (active.length > idx) save.botsActive[bi] = active[idx] === 1
  }

  for (let ui = 0; ui < LEGACY_BOT_UPGRADE_SLOT_COUNT && ui < save.botsLevel.length; ui++) {
    const idx = preset * LEGACY_BOT_UPGRADE_SLOT_COUNT + ui
    if (levels.length > idx) {
      const level = levels[idx]
      if (typeof level === 'number' && Number.isFinite(level)) {
        save.botsLevel[ui] = Math.max(0, Math.trunc(level))
      }
    }
  }
}
