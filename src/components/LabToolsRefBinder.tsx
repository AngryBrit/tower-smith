import { useEffect, type RefObject } from 'react'
import { useLabToolsApi } from '../lab/labToolsBridgeContext'
import type { SelectResearchHandle } from '../lab/labToolsTypes'

/** Keeps a parent-owned ref in sync with the stable lab tools API from context. */
export function LabToolsRefBinder({
  labToolsRef,
}: {
  labToolsRef: RefObject<SelectResearchHandle | null>
}) {
  const api = useLabToolsApi()

  useEffect(() => {
    labToolsRef.current = api
    return () => {
      if (labToolsRef.current === api) {
        labToolsRef.current = null
      }
    }
  }, [api, labToolsRef])

  return null
}
