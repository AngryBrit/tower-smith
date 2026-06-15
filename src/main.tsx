import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import Root from './Root'
import { resolveAppNavigationTarget } from './devOrigin'
import { safeAppReturnPath } from './effectivePaths/epMobileOAuthReturn'
import { isGooglePickerOAuthCallbackPath } from './effectivePaths/googleDrivePickerEnvironment'
import { completeMobilePickerOAuthCallback } from './effectivePaths/googleDrivePickerMobile'
import { stashEpMobilePickerError } from './effectivePaths/effectivePathsMobileGrantSession'

registerSW({ immediate: true })

async function bootstrap(): Promise<void> {
  const root = document.getElementById('root')!

  if (isGooglePickerOAuthCallbackPath(window.location.pathname)) {
    const result = await completeMobilePickerOAuthCallback(new URLSearchParams(window.location.search))
    const returnTarget = resolveAppNavigationTarget(safeAppReturnPath(result.returnPath))
    if (result.ok) {
      window.location.replace(returnTarget)
      return
    }
    stashEpMobilePickerError(result.reason)
    window.location.replace(returnTarget)
    return
  }

  createRoot(root).render(<Root />)
}

void bootstrap()
