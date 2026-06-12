import { GalleryAdminPage } from './GalleryAdminPage'
import { ProfileSettings } from './ProfileSettings'
import { SettingsPage } from './SettingsPage'
import { EffectivePathsSettingsSection } from './settings/EffectivePathsSettingsSection'
import { ToolsPage } from './ToolsPage'
import { useAuth } from '../auth/useAuth'
import { supabaseBrowserConfigured } from '../supabase/client'
import { useGalleryAdmin } from '../towerGallery/useGalleryAdmin'
import { useI18n } from '../i18n'

type ToolsSettingsPageProps = {
  onOpenTowerBackup: () => void
  galleryListRefreshToken?: number
  onGalleryMutated?: () => void
  onRefreshResearch?: () => void | Promise<void>
  researchRefreshing?: boolean
  isActive?: boolean
}

export function ToolsSettingsPage({
  onOpenTowerBackup,
  galleryListRefreshToken = 0,
  onGalleryMutated,
  onRefreshResearch,
  researchRefreshing = false,
  isActive = true,
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
      ) : (
        <>
          <EffectivePathsSettingsSection />
          <hr className="tools-settings-page__divider" aria-hidden />
        </>
      )}
      <ToolsPage onOpenTowerBackup={onOpenTowerBackup} />
      <hr className="tools-settings-page__divider" aria-hidden />
      <SettingsPage
        onRefreshResearch={onRefreshResearch}
        researchRefreshing={researchRefreshing}
      />
      {!adminLoading && isAdmin ? (
        <>
          <hr className="tools-settings-page__divider" aria-hidden />
          <GalleryAdminPage
            listRefreshToken={galleryListRefreshToken}
            onGalleryMutated={onGalleryMutated}
            isActive={isActive}
          />
        </>
      ) : null}
    </div>
  )
}
