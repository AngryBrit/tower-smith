import { NrbfDecoder, NrbfUtils } from './nrbf'
import {
  findPlayerDataContext,
  getBoolArray,
  getEnumIntArray,
  getInt32,
  getInt32Array,
  getModuleEquipped,
  type DecodedModuleItem,
  type PlayerDataContext,
} from './nrbfExtract'

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
}

export type { DecodedModuleItem }

export type DecodedPlayerSave = {
  researchLevel: number[]
  upgradeWorkshopLevel: number[]
  upgradeWorkshopDefenseLevel: number[]
  upgradeWorkshopUtilityLevel: number[]
  upgradeLevel: number[]
  upgradeDefenseLevel: number[]
  upgradeUtilityLevel: number[]
  cardLevel: number[]
  currentWorkshopPreset: number
  relicsUnlocked: number[]
  towerUnlocked: boolean[]
  backgroundUnlocked: boolean[]
  menuUnlocked: boolean[]
  profileBannerUnlocked: boolean[]
  selectedTower: number
  selectedBackground: number
  selectedMenu: number
  selectedProfileBanner: number
  botsUnlocked: boolean[]
  botsActive: boolean[]
  botsLevel: number[]
  ultimateWeaponLevel: number[]
  ultimateWeaponUnlocked: boolean[]
  ultimateWeaponOn: boolean[]
  ultimateWeaponPlusLevel: number[]
  ultimateWeaponPlusUnlocked: boolean[]
  moduleEquipped: DecodedModuleItem[]
}

function decodeFromContext(ctx: PlayerDataContext): DecodedPlayerSave {
  return {
    researchLevel: getInt32Array(ctx, 'researchLevel'),
    upgradeWorkshopLevel: getInt32Array(ctx, 'upgradeWorkshopLevel'),
    upgradeWorkshopDefenseLevel: getInt32Array(ctx, 'upgradeWorkshopDefenseLevel'),
    upgradeWorkshopUtilityLevel: getInt32Array(ctx, 'upgradeWorkshopUtilityLevel'),
    upgradeLevel: getInt32Array(ctx, 'upgradeLevel'),
    upgradeDefenseLevel: getInt32Array(ctx, 'upgradeDefenseLevel'),
    upgradeUtilityLevel: getInt32Array(ctx, 'upgradeUtilityLevel'),
    cardLevel: getInt32Array(ctx, 'cardLevel'),
    currentWorkshopPreset: getInt32(ctx, 'currentWorkshopPreset'),
    relicsUnlocked: getEnumIntArray(ctx, 'relicsUnlocked'),
    towerUnlocked: getBoolArray(ctx, 'towerUnlocked'),
    backgroundUnlocked: getBoolArray(ctx, 'backgroundUnlocked'),
    menuUnlocked: getBoolArray(ctx, 'menuUnlocked'),
    profileBannerUnlocked: getBoolArray(ctx, 'profileBannerUnlocked'),
    selectedTower: getInt32(ctx, 'selectedTower'),
    selectedBackground: getInt32(ctx, 'selectedBackground'),
    selectedMenu: getInt32(ctx, 'selectedMenu'),
    selectedProfileBanner: getInt32(ctx, 'selectedProfileBanner'),
    botsUnlocked: getBoolArray(ctx, 'botsUnlocked'),
    botsActive: getBoolArray(ctx, 'botsActive'),
    botsLevel: getInt32Array(ctx, 'botsLevel'),
    ultimateWeaponLevel: getInt32Array(ctx, 'ultimateWeaponLevel'),
    ultimateWeaponUnlocked: getBoolArray(ctx, 'ultimateWeaponUnlocked'),
    ultimateWeaponOn: getBoolArray(ctx, 'ultimateWeaponOn'),
    ultimateWeaponPlusLevel: getInt32Array(ctx, 'ultimateWeaponPlusLevel'),
    ultimateWeaponPlusUnlocked: getBoolArray(ctx, 'ultimateWeaponPlusUnlocked'),
    moduleEquipped: getModuleEquipped(ctx),
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
