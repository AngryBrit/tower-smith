import type { TowerGalleryApiError } from './api'
import { towerGalleryApiAvailable } from './api'

/** GitHub README — Community gallery (Netlify + Supabase). */
export const GALLERY_SETUP_DOCS_URL =
  'https://github.com/AngryBrit/tower-smith#community-gallery-netlify--supabase'

export type GalleryUnavailableReason = 'disabled' | 'local_dev' | 'production'

export function isLocalDevHost(): boolean {
  if (typeof window === 'undefined') return import.meta.env.DEV
  const host = window.location.hostname
  return host === 'localhost' || host === '127.0.0.1' || host === '[::1]'
}

export function getGalleryUnavailableReason(
  error?: TowerGalleryApiError | null,
): GalleryUnavailableReason {
  if (!towerGalleryApiAvailable()) return 'disabled'
  if (
    error === 'gallery_unavailable' ||
    error === 'network' ||
    import.meta.env.DEV
  ) {
    return isLocalDevHost() ? 'local_dev' : 'production'
  }
  return isLocalDevHost() ? 'local_dev' : 'production'
}

export function shouldShowGallerySetupCallout(
  apiEnabled: boolean,
  error: TowerGalleryApiError | null,
): boolean {
  if (!apiEnabled) return true
  return error === 'gallery_unavailable' || error === 'network'
}
