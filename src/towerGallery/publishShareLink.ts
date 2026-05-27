import type { LabsShareFile } from '../labsShareCodec'
import type { GalleryBuildCategory } from './buildCategories'
import type { GalleryBuildVisibility } from './types'
import { submitGalleryTower } from './api'
import { buildGalleryShareUrls } from './shareLink'
import { sanitizeGalleryTitle } from './validate'

export type PublishGalleryShareResult =
  | { ok: true; url: string; buildId: string; title: string }
  | {
      ok: false
      error:
        | 'invalid_title'
        | 'invalid_category'
        | 'invalid_payload'
        | 'submissions_disabled'
        | 'auth_required'
        | 'gallery_unavailable'
        | 'network'
        | 'unknown'
    }

/**
 * Upload a share file to the gallery and return a short `?build=` URL.
 */
export async function publishGalleryShareLink(
  payload: LabsShareFile,
  title: string,
  category: GalleryBuildCategory,
  pageHref: string,
  options?: {
    author?: string
    accessToken?: string | null
    visibility?: GalleryBuildVisibility
  },
): Promise<PublishGalleryShareResult> {
  const author = options?.author
  const accessToken = options?.accessToken
  const sanitizedTitle = sanitizeGalleryTitle(title)
  if (!sanitizedTitle) {
    return { ok: false, error: 'invalid_title' }
  }

  const submitted = await submitGalleryTower(
    {
      title: sanitizedTitle,
      category,
      visibility: options?.visibility === 'unlisted' ? 'unlisted' : 'public',
      ...(author?.trim() ? { author: author.trim() } : {}),
      payload,
    },
    accessToken,
  )

  if (!submitted.ok) {
    const err = submitted.error
    if (
      err === 'invalid_title' ||
      err === 'invalid_category' ||
      err === 'invalid_payload' ||
      err === 'submissions_disabled' ||
      err === 'auth_required' ||
      err === 'gallery_unavailable' ||
      err === 'network' ||
      err === 'unknown'
    ) {
      return { ok: false, error: err }
    }
    return { ok: false, error: 'unknown' }
  }

  const { clean } = buildGalleryShareUrls(submitted.entry.id, pageHref)
  return {
    ok: true,
    url: clean,
    buildId: submitted.entry.id,
    title: submitted.entry.title,
  }
}
