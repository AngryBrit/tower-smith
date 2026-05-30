import {
  ArraySinglePrimitiveRecord,
  BinaryObjectStringRecord,
  BinaryArrayRecord,
  ClassRecord,
  MemberReferenceRecord,
  NrbfDecoder,
  type NrbfRecord,
  type ObjectValue,
} from './nrbf'

export type PlayerDataContext = {
  decoder: NrbfDecoder
  player: ClassRecord
}

export function findPlayerDataContext(
  decoder: NrbfDecoder,
  root: NrbfRecord,
): PlayerDataContext | null {
  let player: ClassRecord | null =
    root instanceof ClassRecord && root.typeName.includes('PlayerData') ? root : null
  if (!player) {
    for (const rec of decoder.getAllRecords().values()) {
      if (rec instanceof ClassRecord && rec.typeName.includes('PlayerData')) {
        player = rec
        break
      }
    }
  }
  if (!player) return null
  return { decoder, player }
}

export function resolveValue(
  ctx: PlayerDataContext,
  value: ObjectValue | undefined,
): ObjectValue | undefined {
  if (value instanceof MemberReferenceRecord) {
    return ctx.decoder.getRecord(value.idRef)
  }
  return value
}

export function getInt32(ctx: PlayerDataContext, name: string): number {
  const raw = resolveValue(ctx, ctx.player.getValue(name))
  return typeof raw === 'number' && Number.isFinite(raw) ? Math.trunc(raw) : 0
}

export function getBool(ctx: PlayerDataContext, name: string): boolean {
  const raw = resolveValue(ctx, ctx.player.getValue(name))
  return raw === true
}

export function getString(ctx: PlayerDataContext, name: string): string {
  const raw = resolveValue(ctx, ctx.player.getValue(name))
  if (typeof raw === 'string') return raw
  if (raw instanceof BinaryObjectStringRecord) return raw.value
  return ''
}

export function getInt32Array(ctx: PlayerDataContext, name: string): number[] {
  const raw = resolveValue(ctx, ctx.player.getValue(name))
  if (raw instanceof ArraySinglePrimitiveRecord) {
    return raw.getArray().map((v) => Number(v))
  }
  return []
}

export function getBoolArray(ctx: PlayerDataContext, name: string): boolean[] {
  const raw = resolveValue(ctx, ctx.player.getValue(name))
  if (raw instanceof ArraySinglePrimitiveRecord) {
    return raw.getArray().map((v) => v === true)
  }
  return []
}

/** Enum arrays stored as BinaryArray of boxed enum values (`value__`). */
/** `int[]` / boxed ints stored as BinaryArray (e.g. `slotPresetCardInt`). */
export function getBinaryIntArray(ctx: PlayerDataContext, name: string): number[] {
  const raw = resolveValue(ctx, ctx.player.getValue(name))
  if (!(raw instanceof BinaryArrayRecord)) return []
  const out: number[] = []
  for (const el of raw.elementValues) {
    const rec = resolveValue(ctx, el)
    if (typeof rec === 'number' && Number.isFinite(rec)) {
      out.push(Math.trunc(rec))
      continue
    }
    if (rec instanceof ClassRecord) {
      const v = rec.getValue('value__')
      out.push(typeof v === 'number' && Number.isFinite(v) ? Math.trunc(v) : 0)
      continue
    }
    out.push(0)
  }
  return out
}

/** `bool[]` stored as BinaryArray (e.g. `slotPresetCardAssignedBool`). */
export function getBinaryBoolArray(ctx: PlayerDataContext, name: string): boolean[] {
  const raw = resolveValue(ctx, ctx.player.getValue(name))
  if (!(raw instanceof BinaryArrayRecord)) return []
  return raw.elementValues.map((el) => resolveValue(ctx, el) === true)
}

export function getEnumIntArray(ctx: PlayerDataContext, name: string): number[] {
  const raw = resolveValue(ctx, ctx.player.getValue(name))
  if (!(raw instanceof BinaryArrayRecord)) return []
  const out: number[] = []
  for (const el of raw.elementValues) {
    const rec = resolveValue(ctx, el)
    if (rec instanceof ClassRecord) {
      const v = rec.getValue('value__')
      out.push(typeof v === 'number' ? Math.trunc(v) : 0)
      continue
    }
    if (typeof rec === 'number') out.push(Math.trunc(rec))
    else out.push(0)
  }
  return out
}

export type DecodedModuleItem = {
  infoIndex: number
  level: number
  rarity: number
  /** Indices into game `ModuleManager.effects` (sub-module rolls). */
  effects: number[]
}

export type DecodedAssistModuleSlot = {
  unlocked: boolean
  uniqueEffectEfficiencyLevel: number
  mainEffectEfficiencyLevel: number
  substatEfficiencyLevel: number
  equipped: DecodedModuleItem | null
}

export type DecodedUserBotData = {
  unlocked: boolean
  active: boolean
  levels: number[]
  selectedLevels: number[]
  plusUnlocked: boolean
  plusLevel: number
}

function readUserBotData(ctx: PlayerDataContext, record: ObjectValue | undefined): DecodedUserBotData | null {
  const item = resolveValue(ctx, record)
  if (!(item instanceof ClassRecord)) return null
  return {
    unlocked: resolveValue(ctx, item.getValue('unlocked')) === true,
    active: resolveValue(ctx, item.getValue('active')) === true,
    levels: getInt32ArrayFromValue(ctx, item.getValue('levels')),
    selectedLevels: getInt32ArrayFromValue(ctx, item.getValue('selectedLevels')),
    plusUnlocked: resolveValue(ctx, item.getValue('plusUnlocked')) === true,
    plusLevel: (() => {
      const raw = resolveValue(ctx, item.getValue('plusLevel'))
      return typeof raw === 'number' && Number.isFinite(raw) ? Math.trunc(raw) : 0
    })(),
  }
}

function getInt32ArrayFromValue(ctx: PlayerDataContext, value: ObjectValue | undefined): number[] {
  const raw = resolveValue(ctx, value)
  if (raw instanceof ArraySinglePrimitiveRecord) {
    return raw.getArray().map((v) => Math.trunc(Number(v)))
  }
  return []
}

/** `List<UserBotData>` stored as a Class with `_items` BinaryArray. */
export function getUserBotDataList(ctx: PlayerDataContext, name: string): DecodedUserBotData[] {
  const raw = resolveValue(ctx, ctx.player.getValue(name))
  if (!(raw instanceof ClassRecord)) return []
  const items = resolveValue(ctx, raw.getValue('_items'))
  if (!(items instanceof BinaryArrayRecord)) return []
  const out: DecodedUserBotData[] = []
  for (const el of items.elementValues) {
    const row = readUserBotData(ctx, el)
    if (row) out.push(row)
  }
  return out
}

function readModuleItem(ctx: PlayerDataContext, record: ObjectValue | undefined): DecodedModuleItem | null {
  const item = resolveValue(ctx, record)
  if (!(item instanceof ClassRecord)) return null
  const rarRaw = resolveValue(ctx, item.getValue('currentRarity'))
  let rarity = 0
  if (rarRaw instanceof ClassRecord) {
    const v = rarRaw.getValue('value__')
    rarity = typeof v === 'number' ? Math.trunc(v) : 0
  } else if (typeof rarRaw === 'number') {
    rarity = Math.trunc(rarRaw)
  }
  const infoIndex = item.getValue('infoIndex')
  const level = item.getValue('level')
  return {
    infoIndex: typeof infoIndex === 'number' ? Math.trunc(infoIndex) : 0,
    level: typeof level === 'number' ? Math.trunc(level) : 0,
    rarity,
    effects: getInt32ArrayFromValue(ctx, item.getValue('effects')),
  }
}

export function getModuleEquipped(ctx: PlayerDataContext): DecodedModuleItem[] {
  const raw = resolveValue(ctx, ctx.player.getValue('moduleEquipped'))
  if (!(raw instanceof BinaryArrayRecord)) return []
  const out: DecodedModuleItem[] = []
  for (const el of raw.elementValues) {
    const row = readModuleItem(ctx, el)
    if (row) out.push(row)
  }
  return out
}

export function getAssistModuleSlots(ctx: PlayerDataContext): DecodedAssistModuleSlot[] {
  const raw = resolveValue(ctx, ctx.player.getValue('assistModuleSlots'))
  if (!(raw instanceof BinaryArrayRecord)) return []
  const out: DecodedAssistModuleSlot[] = []
  for (const el of raw.elementValues) {
    const slot = resolveValue(ctx, el)
    if (!(slot instanceof ClassRecord)) continue
    const equipped = readModuleItem(ctx, slot.getValue('equippedModule'))
    out.push({
      unlocked: resolveValue(ctx, slot.getValue('unlocked')) === true,
      uniqueEffectEfficiencyLevel: (() => {
        const v = resolveValue(ctx, slot.getValue('uniqueEffectEfficiencyLevel'))
        return typeof v === 'number' && Number.isFinite(v) ? Math.trunc(v) : 0
      })(),
      mainEffectEfficiencyLevel: (() => {
        const v = resolveValue(ctx, slot.getValue('mainEffectEfficiencyLevel'))
        return typeof v === 'number' && Number.isFinite(v) ? Math.trunc(v) : 0
      })(),
      substatEfficiencyLevel: (() => {
        const v = resolveValue(ctx, slot.getValue('substatEfficiencyLevel'))
        return typeof v === 'number' && Number.isFinite(v) ? Math.trunc(v) : 0
      })(),
      equipped,
    })
  }
  return out
}
