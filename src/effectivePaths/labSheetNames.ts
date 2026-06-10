import type { ResearchData } from '../types/research'
import { levelOverrideKey } from '../types/research'

export type LabSheetItemRef = {
  sectionIndex: number
  itemIndex: number
  canonicalName: string
}

/** Effective Paths / game sheet spellings → TowerSmith research item names. */
const EP_LAB_NAME_ALIASES: Record<string, string> = {
  'gold bot - cooldown': 'Golden Bot - Cooldown',
  'gold bot - duration': 'Golden Bot - Duration',
  'amp bot - cooldown': 'Amplify Bot - Cooldown',
  'amp bot - duration': 'Amplify Bot - Duration',
  'super crit multi': 'Super Crit Mult',
  'swamp rend': 'Swamp Rend - Basic Enemies',
  'swamp rend+': 'Swamp Rend - Additional Enemies',
}

export function normalizeLabSheetName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/['']/g, "'")
}

function canonicalLabSheetName(name: string): string {
  const norm = normalizeLabSheetName(name)
  return EP_LAB_NAME_ALIASES[norm] ?? name.trim()
}

/** Build lookup from normalized sheet label → manifest lab row. */
export function buildLabSheetNameIndex(data: ResearchData): Map<string, LabSheetItemRef> {
  const out = new Map<string, LabSheetItemRef>()
  for (let sectionIndex = 0; sectionIndex < data.sections.length; sectionIndex++) {
    const section = data.sections[sectionIndex]!
    section.items.forEach((item, itemIndex) => {
      const canonicalName = item.name.trim()
      const ref: LabSheetItemRef = { sectionIndex, itemIndex, canonicalName }
      out.set(normalizeLabSheetName(canonicalName), ref)
      const alias = Object.entries(EP_LAB_NAME_ALIASES).find(([, v]) => v === canonicalName)?.[0]
      if (alias) out.set(alias, ref)
    })
  }
  return out
}

export function labSheetItemRefFromName(
  name: string,
  index: ReadonlyMap<string, LabSheetItemRef>,
): LabSheetItemRef | null {
  const canonical = canonicalLabSheetName(name)
  return index.get(normalizeLabSheetName(canonical)) ?? null
}

export function labLevelKeyFromItemRef(ref: LabSheetItemRef): string {
  return levelOverrideKey(ref.sectionIndex, ref.itemIndex)
}
