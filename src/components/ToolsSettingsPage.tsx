import type { RefObject } from 'react'

import type { SelectResearchHandle } from './SelectResearch'

import { GalleryAdminPage } from './GalleryAdminPage'
import { ProfileSettings } from './ProfileSettings'
import { SettingsPage } from './SettingsPage'
import { ToolsPage } from './ToolsPage'
import { useAuth } from '../auth/AuthProvider'
import { supabaseBrowserConfigured } from '../supabase/client'
import { useGalleryAdmin } from '../towerGallery/useGalleryAdmin'
import { useI18n } from '../i18n'

type ToolsSettingsPageProps = {
  labToolsRef: RefObject<SelectResearchHandle | null>
  galleryListRefreshToken?: number
  onGalleryMutated?: () => void
}

export function ToolsSettingsPage({
  labToolsRef,
  galleryListRefreshToken = 0,
  onGalleryMutated,
}: ToolsSettingsPageProps) {
  const { t } = useI18n()
  const { user } = useAuth()
  const { loading: adminLoading, isAdmin } = useGalleryAdmin()
  const showProfileSettings = supabaseBrowserConfigured() && Boolean(user)

  return (
    <div
      className="tools-settings-page"
      role="region"
      aria-label={t('app_nav_settings')}
    >
      {showProfileSettings ? (
        <>
          <ProfileSettings />
          <hr className="tools-settings-page__divider" aria-hidden />
        </>
      ) : null}
      <ToolsPage labToolsRef={labToolsRef} />
      <hr className="tools-settings-page__divider" aria-hidden />
      <SettingsPage />
      {!adminLoading && isAdmin ? (
        <>
          <hr className="tools-settings-page__divider" aria-hidden />
          <GalleryAdminPage
            listRefreshToken={galleryListRefreshToken}
            onGalleryMutated={onGalleryMutated}
          />
        </>
      ) : null}
    </div>
  )
}
