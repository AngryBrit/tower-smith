/** User-defined preset tab labels (TowerSmith-only; not read from game saves). */
export const WORKSHOP_PRESET_LABEL_MAX_LENGTH = 20

export function defaultWorkshopPresetLabels(count = 5): string[] {
  return Array.from({ length: count }, () => '')
}

export function sanitizeWorkshopPresetLabels(raw: unknown, count: number): string[] {
  const empty = defaultWorkshopPresetLabels(count)
  if (!Array.isArray(raw)) return empty
  return empty.map((_, i) => {
    const item = raw[i]
    if (typeof item !== 'string') return ''
    return item.trim().slice(0, WORKSHOP_PRESET_LABEL_MAX_LENGTH)
  })
}

export function workshopPresetDisplayLabel(
  labels: readonly string[],
  index: number,
  fallback: string,
): string {
  const custom = labels[index]?.trim()
  return custom || fallback
}
