import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './auth/AuthProvider'
import { ColorSchemeProvider } from './ColorSchemeProvider'
import { I18nProvider } from './i18n'
import { PwaInstallProvider } from './pwa/PwaInstallProvider'

registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
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
  </StrictMode>,
)
