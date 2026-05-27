import type { LabsShareFile } from '../labsShareCodec'
import type { GalleryBuildCategory } from './buildCategories'

export const TOWER_GALLERY_MAX_PAYLOAD_BYTES = 512 * 1024
export const TOWER_GALLERY_MAX_TITLE_LEN = 40
export const TOWER_GALLERY_MAX_AUTHOR_LEN = 40
export const TOWER_GALLERY_MAX_GUILD_LEN = 40
export const TOWER_GALLERY_LIST_PAGE_DEFAULT = 20
export const TOWER_GALLERY_LIST_PAGE_MAX = 100
/** Curated community picker (no pagination). */
export const TOWER_GALLERY_DROPDOWN_LIMIT = 25

export type GalleryListSort = 'newest' | 'top'
export type GalleryBuildVisibility = 'public' | 'unlisted'

export type TowerGalleryIndexEntry = {
  id: string
  title: string
  visibility?: GalleryBuildVisibility
  category?: GalleryBuildCategory
  author?: string
  guild?: string
  authorAvatarUrl?: string
  createdAt: string
  upvoteCount: number
  /** Set when the list request included a valid signed-in user. */
  viewerVoted?: boolean
  /** True when the signed-in viewer owns this build. */
  viewerOwns?: boolean
}

export type TowerGalleryRecord = TowerGalleryIndexEntry & {
  payload: LabsShareFile
}

export type TowerGallerySubmitBody = {
  title: string
  category: GalleryBuildCategory
  visibility?: GalleryBuildVisibility
  author?: string
  guild?: string
  payload: LabsShareFile
}
