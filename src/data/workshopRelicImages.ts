import relicImagePaths from './workshopRelicImages.generated.json'

const base = import.meta.env.BASE_URL

/** Relative paths from `public/relics/` keyed by relic catalog id. */
export const WORKSHOP_RELIC_IMAGE_PATH: Readonly<Record<string, string>> =
  relicImagePaths

export function workshopRelicHasImage(id: string): boolean {
  return id in WORKSHOP_RELIC_IMAGE_PATH
}

export function workshopRelicImagePath(id: string): string | null {
  return WORKSHOP_RELIC_IMAGE_PATH[id] ?? null
}

export function workshopRelicImageUrl(id: string): string | null {
  const rel = workshopRelicImagePath(id)
  if (rel == null) return null
  const encoded = rel
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')
  return `${base}relics/${encoded}`
}
