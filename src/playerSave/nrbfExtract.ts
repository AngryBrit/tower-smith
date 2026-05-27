import {
  ArraySinglePrimitiveRecord,
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
}

export function getModuleEquipped(ctx: PlayerDataContext): DecodedModuleItem[] {
  const raw = resolveValue(ctx, ctx.player.getValue('moduleEquipped'))
  if (!(raw instanceof BinaryArrayRecord)) return []
  const out: DecodedModuleItem[] = []
  for (const el of raw.elementValues) {
    const item = resolveValue(ctx, el)
    if (!(item instanceof ClassRecord)) continue
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
    out.push({
      infoIndex: typeof infoIndex === 'number' ? Math.trunc(infoIndex) : 0,
      level: typeof level === 'number' ? Math.trunc(level) : 0,
      rarity,
    })
  }
  return out
}
