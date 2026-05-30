import { StrictMode } from 'react'
import App from './App.tsx'
import { AuthProvider } from './auth/AuthProvider'
import { ColorSchemeProvider } from './ColorSchemeProvider'
import { I18nProvider } from './i18n'
import { renderLegalPage } from './pages/renderLegalPage'
import { PwaInstallProvider } from './pwa/PwaInstallProvider'

export default function Root() {
  const legalPage = renderLegalPage(window.location.pathname)
  if (legalPage) return legalPage

  return (
    <StrictMode>
      <ColorSchemeProvider>
        <I18nProvider>
          <PwaInstallProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </PwaInstallProvider>
        </I18nProvider>
      </ColorSchemeProvider>
    </StrictMode>
  )
}
