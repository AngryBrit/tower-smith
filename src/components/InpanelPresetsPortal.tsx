import { createPortal } from 'react-dom'
import { useCommunityBuild } from '../lab/communityBuildContext'
import { CommunityBuildRow } from './CommunityBuildRow'

type InpanelPresetsPortalProps = {
  mount: HTMLElement | null
  visible: boolean
}

/** BUILD row (publish / copy / clear) shared across in-panel tabs. */
export function InpanelPresetsPortal({ mount, visible }: InpanelPresetsPortalProps) {
  const { hydrated, openPublishDialog, copyBuildShareLink, clearWorkspace } =
    useCommunityBuild()

  if (!visible || !mount) return null

  return createPortal(
    <CommunityBuildRow
      hydrated={hydrated}
      onSaveAs={openPublishDialog}
      onCopyShareLink={copyBuildShareLink}
      onClearWorkspace={clearWorkspace}
    />,
    mount,
  )
}
