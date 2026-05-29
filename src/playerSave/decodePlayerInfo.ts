import { NrbfDecoder, NrbfUtils } from './nrbf'
import type { WorkshopBotId } from '../data/workshopBotsData'
import {
  BOT_PRESET_LIST_FIELD_BY_BOT_ID,
} from './gameBotPresetMapping'
import {
  findPlayerDataContext,
  getBool,
  getBoolArray,
  getEnumIntArray,
  getInt32,
  getInt32Array,
  getModuleEquipped,
  getString,
  getUserBotDataList,
  type DecodedModuleItem,
  type DecodedUserBotData,
  type PlayerDataContext,
} from './nrbfExtract'

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
}

export type { DecodedModuleItem, DecodedUserBotData }

export type DecodedPlayerSave = {
  researchLevel: number[]
  upgradeWorkshopLevel: number[]
  upgradeWorkshopDefenseLevel: number[]
  upgradeWorkshopUtilityLevel: number[]
  enhancementLevel: number[]
  enhancementDefenseLevel: number[]
  enhancementUtilityLevel: number[]
  cardLevel: number[]
  cardUnlocked: boolean[]
  slotsUnlocked: number
  currentWorkshopPreset: number
  relicsUnlocked: number[]
  towerUnlocked: boolean[]
  backgroundUnlocked: boolean[]
  menuUnlocked: boolean[]
  profileBannerUnlocked: boolean[]
  guardianSkinUnlocked: boolean[]
  guardianUnlocked: boolean
  selectedTower: number
  selectedBackground: number
  selectedMenu: number
  selectedProfileBanner: number
  guardianSkinIndex: number
  botsUnlocked: boolean[]
  botsActive: boolean[]
  botsLevel: number[]
  currentBotPreset: number
  botPresets: Partial<Record<WorkshopBotId, DecodedUserBotData[]>>
  flameBotLevelCooldownSelected: number
  thunderBotLevelCooldownSelected: number
  goldenBotLevelCooldownSelected: number
  amplifyBotLevelCooldownSelected: number
  botBotLevelCooldownSelected: number
  ultimateWeaponLevel: number[]
  ultimateWeaponUnlocked: boolean[]
  ultimateWeaponOn: boolean[]
  ultimateWeaponPlusLevel: number[]
  ultimateWeaponPlusUnlocked: boolean[]
  moduleEquipped: DecodedModuleItem[]
  lastGuildID: string
  lastGuildSeason: number
  guildChestClaimedWeek: number
  hasSeenGuildChatDisclaimer: boolean
  userName: string
  fakeUserName: string
  playfabID: string
}

function decodeBotPresets(ctx: PlayerDataContext): Partial<Record<WorkshopBotId, DecodedUserBotData[]>> {
  const out: Partial<Record<WorkshopBotId, DecodedUserBotData[]>> = {}
  for (const [botId, field] of Object.entries(BOT_PRESET_LIST_FIELD_BY_BOT_ID) as [
    WorkshopBotId,
    string,
  ][]) {
    const list = getUserBotDataList(ctx, field)
    if (list.length > 0) out[botId] = list
  }
  return out
}

function decodeFromContext(ctx: PlayerDataContext): DecodedPlayerSave {
  return {
    researchLevel: getInt32Array(ctx, 'researchLevel'),
    upgradeWorkshopLevel: getInt32Array(ctx, 'upgradeWorkshopLevel'),
    upgradeWorkshopDefenseLevel: getInt32Array(ctx, 'upgradeWorkshopDefenseLevel'),
    upgradeWorkshopUtilityLevel: getInt32Array(ctx, 'upgradeWorkshopUtilityLevel'),
    enhancementLevel: getInt32Array(ctx, 'enhancementLevel'),
    enhancementDefenseLevel: getInt32Array(ctx, 'enhancementDefenseLevel'),
    enhancementUtilityLevel: getInt32Array(ctx, 'enhancementUtilityLevel'),
    cardLevel: getInt32Array(ctx, 'cardLevel'),
    cardUnlocked: getBoolArray(ctx, 'cardUnlocked'),
    slotsUnlocked: getInt32(ctx, 'slotsUnlocked'),
    currentWorkshopPreset: getInt32(ctx, 'currentWorkshopPreset'),
    relicsUnlocked: getEnumIntArray(ctx, 'relicsUnlocked'),
    towerUnlocked: getBoolArray(ctx, 'towerUnlocked'),
    backgroundUnlocked: getBoolArray(ctx, 'backgroundUnlocked'),
    menuUnlocked: getBoolArray(ctx, 'menuUnlocked'),
    profileBannerUnlocked: getBoolArray(ctx, 'profileBannerUnlocked'),
    guardianSkinUnlocked: getBoolArray(ctx, 'guardianSkinUnlocked'),
    guardianUnlocked: getBool(ctx, 'guardianUnlocked'),
    selectedTower: getInt32(ctx, 'selectedTower'),
    selectedBackground: getInt32(ctx, 'selectedBackground'),
    selectedMenu: getInt32(ctx, 'selectedMenu'),
    selectedProfileBanner: getInt32(ctx, 'selectedProfileBanner'),
    guardianSkinIndex: getInt32(ctx, 'guardianSkinIndex'),
    botsUnlocked: getBoolArray(ctx, 'botsUnlocked'),
    botsActive: getBoolArray(ctx, 'botsActive'),
    botsLevel: getInt32Array(ctx, 'botsLevel'),
    currentBotPreset: getInt32(ctx, 'currentBotPreset'),
    botPresets: decodeBotPresets(ctx),
    flameBotLevelCooldownSelected: getInt32(ctx, 'flameBotLevelCooldownSelected'),
    thunderBotLevelCooldownSelected: getInt32(ctx, 'thunderBotLevelCooldownSelected'),
    goldenBotLevelCooldownSelected: getInt32(ctx, 'goldenBotLevelCooldownSelected'),
    amplifyBotLevelCooldownSelected: getInt32(ctx, 'amplifyBotLevelCooldownSelected'),
    botBotLevelCooldownSelected: getInt32(ctx, 'botBotLevelCooldownSelected'),
    ultimateWeaponLevel: getInt32Array(ctx, 'ultimateWeaponLevel'),
    ultimateWeaponUnlocked: getBoolArray(ctx, 'ultimateWeaponUnlocked'),
    ultimateWeaponOn: getBoolArray(ctx, 'ultimateWeaponOn'),
    ultimateWeaponPlusLevel: getInt32Array(ctx, 'ultimateWeaponPlusLevel'),
    ultimateWeaponPlusUnlocked: getBoolArray(ctx, 'ultimateWeaponPlusUnlocked'),
    moduleEquipped: getModuleEquipped(ctx),
    lastGuildID: getString(ctx, 'lastGuildID'),
    lastGuildSeason: getInt32(ctx, 'lastGuildSeason'),
    guildChestClaimedWeek: getInt32(ctx, 'guildChestClaimedWeek'),
    hasSeenGuildChatDisclaimer: getBool(ctx, 'hasSeenGuildChatDisclaimer'),
    userName: getString(ctx, 'userName'),
    fakeUserName: getString(ctx, 'fakeUserName'),
    playfabID: getString(ctx, 'playfabID'),
  }
}

export async function gunzipPlayerInfo(raw: Uint8Array): Promise<Uint8Array> {
  if (raw.length >= 2 && raw[0] === 0x1f && raw[1] === 0x8b) {
    if (typeof DecompressionStream === 'undefined') {
      throw new Error('gzip_player_save_requires_decompression_stream')
    }
    const ds = new DecompressionStream('gzip')
    const copy = new Uint8Array(raw)
    const out = await new Response(new Blob([copy]).stream().pipeThrough(ds)).arrayBuffer()
    return new Uint8Array(out)
  }
  return raw
}

export function decodePlayerInfoBytes(nrbfBytes: Uint8Array): DecodedPlayerSave {
  const ab = toArrayBuffer(nrbfBytes)
  if (!NrbfUtils.startsWithPayloadHeader(ab)) {
    throw new Error('invalid_nrbf_header')
  }
  const decoder = new NrbfDecoder(ab)
  const root = decoder.decode()
  const ctx = findPlayerDataContext(decoder, root)
  if (!ctx) throw new Error('player_data_not_found')
  return decodeFromContext(ctx)
}

export async function decodePlayerInfoFile(bytes: Uint8Array): Promise<DecodedPlayerSave> {
  const nrbf = await gunzipPlayerInfo(bytes)
  return decodePlayerInfoBytes(nrbf)
}
