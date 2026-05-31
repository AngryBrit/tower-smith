import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../auth/useAuth'
import {
  BUG_REPORT_CATEGORIES,
  buildBugReport,
  buildBugReportMailtoUrl,
  buildGitHubIssueUrl,
  collectBugReportEnvironment,
  type BugReportCategory,
} from '../bugReport'
import {
  analyzeBugReportSaveFile,
  canShareBugReportWithFiles,
  downloadBugReportSaveFile,
  formatSaveBytes,
  shareBugReportWithSave,
  type BugReportSaveAttachment,
} from '../bugReportSaveAttachment'
import { useBugBuster } from '../bugBuster/BugBusterContext'
import { useI18n, type StringId } from '../i18n'
import type { MainPanel } from '../mainPanelStorage'

const CATEGORY_LABEL_KEYS: Record<BugReportCategory, StringId> = {
  crash: 'bug_buster_category_crash',
  wrong_stat: 'bug_buster_category_wrong_stat',
  import: 'bug_buster_category_import',
  share_gallery: 'bug_buster_category_share_gallery',
  ui: 'bug_buster_category_ui',
  other: 'bug_buster_category_other',
}

function mainPanelLabelKey(panel: MainPanel): StringId {
  switch (panel) {
    case 'research':
      return 'app_nav_research'
    case 'workshop':
      return 'app_nav_workshop'
    case 'bots':
      return 'app_nav_bots'
    case 'modules':
      return 'app_nav_modules'
    case 'cards':
      return 'app_nav_cards'
    case 'relics':
      return 'app_nav_relics'
    case 'themes':
      return 'app_nav_themes'
    case 'gallery':
      return 'app_nav_gallery'
    case 'toolsSettings':
      return 'app_nav_settings'
    default:
      return 'app_nav_settings'
  }
}

export function BugBusterDialog() {
  const { t } = useI18n()
  const { user } = useAuth()
  const { open, initial, mainPanel, closeBugBuster } = useBugBuster()
  const saveInputRef = useRef<HTMLInputElement>(null)

  const [category, setCategory] = useState<BugReportCategory>('other')
  const [description, setDescription] = useState('')
  const [steps, setSteps] = useState('')
  const [notice, setNotice] = useState<string | null>(null)
  const [saveFile, setSaveFile] = useState<File | null>(null)
  const [saveAttachment, setSaveAttachment] = useState<BugReportSaveAttachment | null>(null)
  const [saveError, setSaveError] = useState<StringId | null>(null)
  const [saveBusy, setSaveBusy] = useState(false)

  const activePanel = initial?.panelId ?? mainPanel
  const mainPanelLabel = t(mainPanelLabelKey(activePanel))

  useEffect(() => {
    if (!open) return
    setCategory(initial?.category ?? (initial?.error ? 'crash' : 'other'))
    setDescription(initial?.description ?? initial?.error?.message ?? '')
    setSteps(initial?.steps ?? '')
    setNotice(null)
    setSaveFile(null)
    setSaveAttachment(null)
    setSaveError(null)
    setSaveBusy(false)
    if (saveInputRef.current) saveInputRef.current.value = ''
  }, [open, initial])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeBugBuster()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeBugBuster, open])

  const categoryLabel = t(CATEGORY_LABEL_KEYS[category])

  const reportInput = useMemo(
    () => ({
      category,
      categoryLabel,
      description,
      steps,
      signedIn: Boolean(user),
      mainPanel: activePanel,
      mainPanelLabel,
      saveAttachment: saveAttachment ?? undefined,
      errorContext:
        initial?.error != null
          ? {
              error: initial.error,
              componentStack: initial.componentStack,
              panelId: initial.panelId ?? activePanel,
              panelLabel: initial.panelLabel ?? mainPanelLabel,
            }
          : undefined,
    }),
    [
      activePanel,
      category,
      categoryLabel,
      description,
      initial,
      mainPanelLabel,
      saveAttachment,
      steps,
      user,
    ],
  )

  const buildEnv = useCallback(
    () =>
      collectBugReportEnvironment({
        mainPanel: activePanel,
        signedIn: Boolean(user),
      }),
    [activePanel, user],
  )

  const diagnosticsPreview = useMemo(() => {
    return buildBugReport(reportInput, buildEnv())
  }, [buildEnv, reportInput])

  const requireDescription = useCallback((): boolean => {
    if (description.trim()) return true
    setNotice(t('bug_buster_description_required'))
    return false
  }, [description, t])

  const handleSaveFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null
      setSaveError(null)
      setSaveAttachment(null)
      setSaveFile(null)
      if (!file) return

      setSaveBusy(true)
      void analyzeBugReportSaveFile(file).then((result) => {
        setSaveBusy(false)
        if (!result.ok) {
          setSaveError(
            result.error === 'too_large'
              ? 'bug_buster_save_too_large'
              : 'bug_buster_save_empty',
          )
          if (saveInputRef.current) saveInputRef.current.value = ''
          return
        }
        setSaveFile(file)
        setSaveAttachment(result.attachment)
      })
    },
    [],
  )

  const clearSaveFile = useCallback(() => {
    setSaveFile(null)
    setSaveAttachment(null)
    setSaveError(null)
    if (saveInputRef.current) saveInputRef.current.value = ''
  }, [])

  const offerSaveDownload = useCallback(
    (context: 'email' | 'github') => {
      if (!saveFile) return
      downloadBugReportSaveFile(saveFile)
      setNotice(
        context === 'email'
          ? t('bug_buster_email_save_downloaded')
          : t('bug_buster_github_save_downloaded'),
      )
      window.setTimeout(() => setNotice(null), 6000)
    },
    [saveFile, t],
  )

  const handleCopy = useCallback(() => {
    if (!requireDescription()) return
    const text = buildBugReport(reportInput, buildEnv())
    void navigator.clipboard.writeText(text).then(
      () => {
        setNotice(t('bug_buster_copied'))
        window.setTimeout(() => setNotice(null), 3000)
      },
      () => setNotice(t('bug_buster_copy_fail')),
    )
  }, [buildEnv, reportInput, requireDescription, t])

  const handleGitHub = useCallback(() => {
    if (!requireDescription()) return
    const url = buildGitHubIssueUrl(reportInput, buildEnv())
    window.open(url, '_blank', 'noopener,noreferrer')
    offerSaveDownload('github')
  }, [buildEnv, offerSaveDownload, reportInput, requireDescription])

  const handleEmail = useCallback(() => {
    if (!requireDescription()) return
    const env = buildEnv()
    const reportText = buildBugReport(reportInput, env)

    if (saveFile && canShareBugReportWithFiles(saveFile)) {
      void shareBugReportWithSave(reportText, saveFile, t('bug_buster_title')).then(
        (result) => {
          if (result === 'shared') {
            setNotice(t('bug_buster_share_ok'))
            window.setTimeout(() => setNotice(null), 4000)
            return
          }
          if (result === 'aborted') return
          window.location.href = buildBugReportMailtoUrl(reportInput, env)
          offerSaveDownload('email')
        },
      )
      return
    }

    window.location.href = buildBugReportMailtoUrl(reportInput, env)
    offerSaveDownload('email')
  }, [buildEnv, offerSaveDownload, reportInput, requireDescription, saveFile, t])

  if (!open) return null

  return createPortal(
    <div
      className="select-research__preset-save-backdrop"
      role="presentation"
      onClick={closeBugBuster}
    >
      <div
        className="select-research__preset-save-dialog bug-buster-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bug-buster-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="bug-buster-dialog-title" className="select-research__preset-save-title">
          {t('bug_buster_title')}
        </h2>
        <p className="select-research__preset-save-hint">{t('bug_buster_privacy_hint')}</p>

        <div className="bug-buster-dialog__field">
          <label className="bug-buster-dialog__label" htmlFor="bug-buster-category">
            {t('bug_buster_category_label')}
          </label>
          <select
            id="bug-buster-category"
            className="select-research__header-locale-select bug-buster-dialog__select"
            value={category}
            onChange={(e) => setCategory(e.target.value as BugReportCategory)}
          >
            {BUG_REPORT_CATEGORIES.map((id) => (
              <option key={id} value={id}>
                {t(CATEGORY_LABEL_KEYS[id])}
              </option>
            ))}
          </select>
        </div>

        <div className="bug-buster-dialog__field">
          <label className="bug-buster-dialog__label" htmlFor="bug-buster-description">
            {t('bug_buster_description_label')}
          </label>
          <textarea
            id="bug-buster-description"
            className="glow-input bug-buster-dialog__textarea"
            rows={4}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('bug_buster_description_placeholder')}
          />
        </div>

        <div className="bug-buster-dialog__field">
          <label className="bug-buster-dialog__label" htmlFor="bug-buster-steps">
            {t('bug_buster_steps_label')}
          </label>
          <textarea
            id="bug-buster-steps"
            className="glow-input bug-buster-dialog__textarea"
            rows={3}
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            placeholder={t('bug_buster_steps_placeholder')}
          />
        </div>

        <div className="bug-buster-dialog__field">
          <span className="bug-buster-dialog__label" id="bug-buster-save-label">
            {t('bug_buster_save_label')}
          </span>
          <p className="bug-buster-dialog__save-hint">{t('bug_buster_save_hint')}</p>
          <div className="bug-buster-dialog__save-row">
            <input
              ref={saveInputRef}
              id="bug-buster-save"
              type="file"
              className="bug-buster-dialog__file-input"
              accept=".dat,application/octet-stream"
              aria-labelledby="bug-buster-save-label"
              disabled={saveBusy}
              onChange={handleSaveFileChange}
            />
            {saveFile ? (
              <button
                type="button"
                className="glow-btn bug-buster-dialog__save-clear"
                onClick={clearSaveFile}
              >
                {t('bug_buster_save_remove')}
              </button>
            ) : null}
          </div>
          {saveBusy ? (
            <p className="bug-buster-dialog__save-meta" role="status">
              {t('bug_buster_save_analyzing')}
            </p>
          ) : null}
          {saveError ? (
            <p className="bug-buster-dialog__save-error" role="alert">
              {t(saveError)}
            </p>
          ) : null}
          {saveAttachment ? (
            <p className="bug-buster-dialog__save-meta" role="status">
              {t('bug_buster_save_meta').replace('{{name}}', saveAttachment.fileName).replace(
                '{{size}}',
                formatSaveBytes(saveAttachment.sizeBytes),
              ).replace('{{gzip}}', saveAttachment.gzip ? t('bug_buster_save_gzip_yes') : t('bug_buster_save_gzip_no'))}
            </p>
          ) : null}
        </div>

        <details className="bug-buster-dialog__diagnostics">
          <summary>{t('bug_buster_diagnostics_label')}</summary>
          <pre className="bug-buster-dialog__diagnostics-pre">{diagnosticsPreview}</pre>
        </details>

        <div className="bug-buster-dialog__actions">
          <button type="button" className="glow-btn glow-btn--block" onClick={closeBugBuster}>
            {t('sr_cancel')}
          </button>
          <div className="bug-buster-dialog__actions-row">
            <button type="button" className="glow-btn glow-btn--block" onClick={handleCopy}>
              {t('bug_buster_copy')}
            </button>
            <button type="button" className="glow-btn glow-btn--block" onClick={handleEmail}>
              {t('bug_buster_email')}
            </button>
          </div>
          <button type="button" className="glow-btn glow-btn--block" onClick={handleGitHub}>
            {t('bug_buster_github')}
          </button>
        </div>

        {notice ? (
          <p className="bug-buster-dialog__notice" role="status">
            {notice}
          </p>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}
