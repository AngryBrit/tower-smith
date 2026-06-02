import type { RefObject } from 'react'
import { usePlayerSaveImport } from '../playerSave/usePlayerSaveImport'
import type { ResearchData } from '../types/research'

type PlayerSaveImportInputProps = {
  data: ResearchData
  inputRef: RefObject<HTMLInputElement | null>
}

/** Hidden file input for playerInfo.dat — usable from any tab (account menu, hints). */
export function PlayerSaveImportInput({ data, inputRef }: PlayerSaveImportInputProps) {
  const { handleImportPlayerInfoFileChange, playerSaveImporting } =
    usePlayerSaveImport(data)

  return (
    <input
      ref={inputRef}
      className="visually-hidden"
      type="file"
      accept=".dat,application/octet-stream"
      aria-hidden
      tabIndex={-1}
      disabled={playerSaveImporting}
      onChange={(e) => void handleImportPlayerInfoFileChange(e)}
    />
  )
}
