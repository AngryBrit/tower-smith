import { useCallback, useState, type ChangeEvent } from 'react'
import { useAuth } from '../auth/useAuth'
import { mergeLabOverridesForDisplayedDamage } from '../data/workshopLabOverridesForDamage'
import { useCommunityBuild } from '../lab/communityBuildContext'
import { importNotice } from '../importNotice'
import { useLabHydration } from '../lab/labHydrationContext'
import { applyTowerThemes } from '../towerDataThemes'
import { resolveGuildNameById } from '../towerGallery/api'
import { persistLabWorkspacesToLocalStorage } from '../towerWorkspacePresets'
import {
  applyImportedLabAndBuild,
} from '../towerWorkspaceStorage'
import { useTowerWorkspaceContext } from '../towerWorkspaceContext'
import { splitTowerBuild } from '../towerBuildStorage'
import { updateUserGuildId, updateUserPlayfabId } from '../profile/profileApi'
import type { PlayerSaveImportStage } from '../components/lab/LabImportExportPanel'
import { useI18n } from '../i18n'
import type { ResearchData } from '../types/research'
import { importPlayerInfoDat } from './importPlayerInfo'
import { validatePlayerInfoSize } from './playerInfoLimits'

export type UsePlayerSaveImportOptions = {
  onImportSuccess?: () => void
  reportImportProblem?: (message: string) => void
}

export function usePlayerSaveImport(
  data: ResearchData,
  options?: UsePlayerSaveImportOptions,
) {
  const { t } = useI18n()
  const { publishImportNotice, setImportNotice } = useLabHydration()
  const auth = useAuth()
  const { prefillPublishGuildId, resolveGuildNameForPublish } = useCommunityBuild()
  const { workspace, setWorkspace, scratchWorkspace, setScratchWorkspace } =
    useTowerWorkspaceContext()

  const [playerSaveImporting, setPlayerSaveImporting] = useState(false)
  const [playerSaveImportStage, setPlayerSaveImportStage] =
    useState<PlayerSaveImportStage | null>(null)

  const reportImportProblem = useCallback(
    (message: string) => {
      if (options?.reportImportProblem) {
        options.reportImportProblem(message)
        return
      }
      setImportNotice(importNotice(message, 'error'))
    },
    [options, setImportNotice],
  )

  const importPlayerSaveFile = useCallback(
    async (file: File): Promise<boolean> => {
      const sizeError = validatePlayerInfoSize(file.size)
      if (sizeError === 'too_large') {
        reportImportProblem(t('sr_notice_import_player_too_large'))
        return false
      }
      if (sizeError === 'empty') {
        reportImportProblem(t('sr_notice_import_player_invalid'))
        return false
      }
      setPlayerSaveImporting(true)
      setPlayerSaveImportStage('reading')
      try {
        const buf = new Uint8Array(await file.arrayBuffer())
        setPlayerSaveImportStage('decoding')
        const imported = await importPlayerInfoDat(buf, data)
        if (!imported.ok) {
          if (imported.error === 'gzip_unsupported') {
            reportImportProblem(t('sr_notice_import_player_gzip_unsupported'))
          } else if (imported.error === 'too_large') {
            reportImportProblem(t('sr_notice_import_player_too_large'))
          } else {
            reportImportProblem(t('sr_notice_import_player_invalid'))
          }
          return false
        }
        setPlayerSaveImportStage('applying')
        const sanitized = imported.overrides
        const mergedOverrides = mergeLabOverridesForDisplayedDamage(
          data,
          sanitized,
          imported.gameResearchLevel,
        )
        const build = splitTowerBuild(imported.workshop)
        applyTowerThemes(imported.themes)
        const nextWorkspace = applyImportedLabAndBuild(
          workspace,
          mergedOverrides,
          build,
          imported.gameResearchLevel,
        )
        const nextScratch = applyImportedLabAndBuild(
          scratchWorkspace,
          mergedOverrides,
          build,
          imported.gameResearchLevel,
        )
        setWorkspace(nextWorkspace)
        setScratchWorkspace(nextScratch)
        persistLabWorkspacesToLocalStorage(nextWorkspace, nextScratch)
        let shouldRefreshProfile = false
        if (imported.guild) {
          prefillPublishGuildId(imported.guild)
          const knownGuild = await resolveGuildNameById(imported.guild)
          if (!knownGuild && auth.user) {
            await resolveGuildNameForPublish(imported.guild)
          }
          if (auth.user) {
            setPlayerSaveImportStage('syncing')
            const updated = await updateUserGuildId(auth.user.id, imported.guild)
            if (updated.ok) shouldRefreshProfile = true
          }
        }
        if (auth.user && imported.playfabId) {
          setPlayerSaveImportStage('syncing')
          await updateUserPlayfabId(auth.user.id, imported.playfabId)
          shouldRefreshProfile = true
        }
        if (auth.user && shouldRefreshProfile) {
          setPlayerSaveImportStage('syncing')
          await auth.refreshProfile()
        }
        auth.prefillProfileFromImport({
          displayName: imported.fakeUserName ?? imported.userName,
        })
        options?.onImportSuccess?.()
        publishImportNotice(t('sr_notice_import_player_ok'), 'success')
        return true
      } catch {
        reportImportProblem(t('sr_notice_import_read_fail'))
        return false
      } finally {
        setPlayerSaveImporting(false)
        setPlayerSaveImportStage(null)
      }
    },
    [
      auth,
      data,
      options,
      prefillPublishGuildId,
      reportImportProblem,
      resolveGuildNameForPublish,
      scratchWorkspace,
      publishImportNotice,
      setScratchWorkspace,
      setWorkspace,
      t,
      workspace,
    ],
  )

  const handleImportPlayerInfoFileChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const input = e.target
      const file = input.files?.[0]
      input.value = ''
      if (!file) return
      await importPlayerSaveFile(file)
    },
    [importPlayerSaveFile],
  )

  return {
    playerSaveImporting,
    playerSaveImportStage,
    importPlayerSaveFile,
    handleImportPlayerInfoFileChange,
  }
}
