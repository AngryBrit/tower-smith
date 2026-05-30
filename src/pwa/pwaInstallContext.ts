import { createContext, useContext } from 'react'

export function isIosSafari(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iPhone|iPad|iPod/i.test(navigator.userAgent)
}

export type PwaInstallContextValue = {
  canInstall: boolean
  isInstalled: boolean
  isIos: boolean
  promptInstall: () => Promise<boolean>
}

export const PwaInstallContext = createContext<PwaInstallContextValue | null>(null)

export function usePwaInstall(): PwaInstallContextValue {
  const ctx = useContext(PwaInstallContext)
  if (!ctx) {
    throw new Error('usePwaInstall must be used within PwaInstallProvider')
  }
  return ctx
}
