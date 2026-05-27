import type { StringId } from '../i18n/dictionary'

export const GALLERY_BUILD_CATEGORIES = [
  'turtle',
  'ehp',
  'blender',
  'devo',
  'glass_cannon',
  'hybrid',
  'other',
] as const

export type GalleryBuildCategory = (typeof GALLERY_BUILD_CATEGORIES)[number]

export function isGalleryBuildCategory(value: unknown): value is GalleryBuildCategory {
  return (
    typeof value === 'string' &&
    (GALLERY_BUILD_CATEGORIES as readonly string[]).includes(value)
  )
}

export function sanitizeGalleryBuildCategory(raw: unknown): GalleryBuildCategory | null {
  return isGalleryBuildCategory(raw) ? raw : null
}

export const GALLERY_BUILD_CATEGORY_I18N: Record<
  GalleryBuildCategory,
  { name: StringId; desc: StringId }
> = {
  turtle: {
    name: 'gallery_category_turtle',
    desc: 'gallery_category_turtle_desc',
  },
  ehp: {
    name: 'gallery_category_ehp',
    desc: 'gallery_category_ehp_desc',
  },
  blender: {
    name: 'gallery_category_blender',
    desc: 'gallery_category_blender_desc',
  },
  devo: {
    name: 'gallery_category_devo',
    desc: 'gallery_category_devo_desc',
  },
  glass_cannon: {
    name: 'gallery_category_glass_cannon',
    desc: 'gallery_category_glass_cannon_desc',
  },
  hybrid: {
    name: 'gallery_category_hybrid',
    desc: 'gallery_category_hybrid_desc',
  },
  other: {
    name: 'gallery_category_other',
    desc: 'gallery_category_other_desc',
  },
}
