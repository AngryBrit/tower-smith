import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import Root from './Root'
import { isGooglePickerOAuthCallbackPath } from './effectivePaths/googleDrivePickerEnvironment'
import { completeMobilePickerOAuthCallback } from './effectivePaths/googleDrivePickerMobile'
import { stashEpMobilePickerError } from './effectivePaths/effectivePathsMobileGrantSession'

registerSW({ immediate: true })

async function bootstrap(): Promise<void> {
  const root = document.getElementById('root')!

  if (isGooglePickerOAuthCallbackPath(window.location.pathname)) {
    const result = await completeMobilePickerOAuthCallback(new URLSearchParams(window.location.search))
    if (result.ok) {
      window.location.replace(result.returnPath)
      return
    }
    stashEpMobilePickerError(result.reason)
    window.location.replace('/')
    return
  }

  createRoot(root).render(<Root />)
}

void bootstrap()
