import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useI18n } from '../i18n'
import type { StringId } from '../i18n/dictionary'
import {
  WORKSHOP_PRESET_LABEL_MAX_LENGTH,
  workshopPresetDisplayLabel,
} from '../data/workshopPresetLabels'

type WorkshopPresetToolbarProps = {
  ariaLabel: StringId
  renameHint: StringId
  fallbackKeys: readonly StringId[]
  labels: readonly string[]
  activeIndex: number
  onSelect: (index: number) => void
  onLabelChange: (index: number, label: string) => void
}

export function WorkshopPresetToolbar({
  ariaLabel,
  renameHint,
  fallbackKeys,
  labels,
  activeIndex,
  onSelect,
  onLabelChange,
}: WorkshopPresetToolbarProps) {
  const { t } = useI18n()
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const commitEdit = useCallback(
    (index: number, value: string) => {
      onLabelChange(index, value.trim().slice(0, WORKSHOP_PRESET_LABEL_MAX_LENGTH))
      setEditingIndex(null)
    },
    [onLabelChange],
  )

  const cancelEdit = useCallback(() => {
    setEditingIndex(null)
  }, [])

  const startEdit = useCallback(
    (index: number) => {
      setEditingIndex(index)
      setDraft(labels[index] ?? '')
    },
    [labels],
  )

  useEffect(() => {
    if (editingIndex == null) return
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [editingIndex])

  useEffect(() => {
    if (editingIndex == null) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cancelEdit()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [editingIndex, cancelEdit])

  return (
    <>
      <div className="cards-presets-block">
        <div className="cards-presets" role="toolbar" aria-label={t(ariaLabel)}>
          {fallbackKeys.map((key, i) => {
            const display = workshopPresetDisplayLabel(labels, i, t(key))
            const isActive = activeIndex === i

            return (
              <button
                key={key}
                type="button"
                className={isActive ? 'cards-preset cards-preset--on' : 'cards-preset'}
                aria-pressed={isActive}
                onClick={() => onSelect(i)}
                onDoubleClick={(e) => {
                  e.preventDefault()
                  startEdit(i)
                }}
              >
                {display}
              </button>
            )
          })}
        </div>
        <p className="cards-presets-hint">{t('ws_presets_rename_callout')}</p>
      </div>

      {editingIndex != null &&
        createPortal(
          <div
            className="select-research__preset-save-backdrop"
            role="presentation"
            onClick={cancelEdit}
          >
            <div
              className="select-research__preset-save-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="workshop-preset-rename-title"
              onClick={(e) => e.stopPropagation()}
            >
              <h2
                id="workshop-preset-rename-title"
                className="select-research__preset-save-title"
              >
                {t('ws_preset_rename_title')}
              </h2>
              <p className="select-research__preset-save-hint">{t(renameHint)}</p>
              <form
                className="select-research__preset-save-form"
                onSubmit={(e) => {
                  e.preventDefault()
                  commitEdit(editingIndex, draft)
                }}
              >
                <label
                  className="select-research__preset-save-label"
                  htmlFor="workshop-preset-rename-field"
                >
                  {t('ws_preset_rename_input_aria')}
                </label>
                <input
                  ref={inputRef}
                  id="workshop-preset-rename-field"
                  className="select-research__preset-save-input glow-input"
                  type="text"
                  value={draft}
                  maxLength={WORKSHOP_PRESET_LABEL_MAX_LENGTH}
                  autoComplete="off"
                  placeholder={t(fallbackKeys[editingIndex]!)}
                  onChange={(e) => setDraft(e.target.value)}
                />
                <div className="select-research__preset-save-actions">
                  <button
                    type="button"
                    className="glow-btn glow-btn--block"
                    onClick={cancelEdit}
                  >
                    {t('sr_cancel')}
                  </button>
                  <button type="submit" className="glow-btn glow-btn--block">
                    {t('ws_preset_rename_save')}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
