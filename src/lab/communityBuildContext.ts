import { createContext, useContext } from 'react'

export type CommunityBuildContextValue = {
  hydrated: boolean
  sharePublishing: boolean
  openPublishDialog: () => void
  copyBuildShareLink: () => Promise<boolean>
  clearWorkspace: () => void
  copyCleanShareLink: () => Promise<void>
  publishForQrUrl: () => Promise<string | null>
  prefillPublishGuildId: (guildId: string) => void
  resolveGuildNameForPublish: (guildId: string) => Promise<string | null>
}

export const CommunityBuildContext = createContext<CommunityBuildContextValue | null>(null)

export function useCommunityBuild(): CommunityBuildContextValue {
  const ctx = useContext(CommunityBuildContext)
  if (!ctx) {
    throw new Error('useCommunityBuild must be used within CommunityBuildProvider')
  }
  return ctx
}
