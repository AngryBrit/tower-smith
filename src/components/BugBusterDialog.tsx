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
  buildBugReportEmailClipboardText,
  buildBugReportMailtoUrl,
  buildGitHubIssueUrl,
  collectBugReportEnvironment,
  type BugReportCategory,
} from '../bugReport'
import {
  analyzeBugReportAttachment,
  type BugReportAttachFileError,
} from '../bugReportAttachFiles'
import { formatCsvBytes, type BugReportCsvAttachment } from '../bugReportCsvAttachment'
import {
  canShareBugReportWithFiles,
  downloadBugReportAttachedFiles,
  formatSaveBytes,
  prepareBugReportFilesForTransfer,
  shareBugReportWithFiles,
  type BugReportSaveAttachment,
} from '../bugReportSaveAttachment'
import type { BugBusterInitial } from '../bugBuster/bugBusterTypes'
import { useBugBuster } from '../bugBuster/useBugBuster'
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
    case 'vault':
      return 'app_nav_vault'
    case 'themes':
      return 'app_nav_themes'
    case 'guardians':
      return 'app_nav_guardians'
    case 'gallery':
      return 'app_nav_gallery'
    case 'toolsSettings':
      return 'app_nav_settings'
    default:
      return 'app_nav_settings'
  }
}

const ATTACH_ERROR_KEYS: Record<BugReportAttachFileError, StringId> = {
  save_empty: 'bug_buster_save_empty',
  save_too_large: 'bug_buster_save_too_large',
  csv_empty: 'bug_buster_csv_empty',
  csv_too_large: 'bug_buster_csv_too_large',
  csv_invalid: 'bug_buster_csv_invalid',
  unrecognized: 'bug_buster_attach_unrecognized',
}

function bugBusterFormDefaults(initial: BugBusterInitial | null): {
  category: BugReportCategory
  description: string
  steps: string
} {
  const initialDescription = initial?.description?.trim()
  return {
    category: initial?.category ?? (initial?.error ? 'crash' : 'other'),
    description: initialDescription || initial?.error?.message || '',
    steps: initial?.steps ?? '',
  }
}

function isBugReportDescriptionReady(value: string): boolean {
  return value.trim().length > 0
}

type BugBusterDialogBodyProps = {
  initial: BugBusterInitial | null
  mainPanel: MainPanel
  closeBugBuster: () => void
}

function BugBusterDialogBody({ initial, mainPanel, closeBugBuster }: BugBusterDialogBodyProps) {
  const { t } = useI18n()
  const { user } = useAuth()
  const attachInputRef = useRef<HTMLInputElement>(null)
  const formDefaults = bugBusterFormDefaults(initial)

  const [category, setCategory] = useState<BugReportCategory>(formDefaults.category)
  const [description, setDescription] = useState(formDefaults.description)
  const [steps, setSteps] = useState(formDefaults.steps)
  const [notice, setNotice] = useState<string | null>(null)
  const [saveFile, setSaveFile] = useState<File | null>(null)
  const [saveAttachment, setSaveAttachment] = useState<BugReportSaveAttachment | null>(null)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvAttachment, setCsvAttachment] = useState<BugReportCsvAttachment | null>(null)
  const [attachError, setAttachError] = useState<StringId | null>(null)
  const [attachBusy, setAttachBusy] = useState(false)

  const activePanel = initial?.panelId ?? mainPanel
  const mainPanelLabel = t(mainPanelLabelKey(activePanel))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeBugBuster()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeBugBuster])

  const categoryLabel = t(CATEGORY_LABEL_KEYS[category])
  const descriptionReady = isBugReportDescriptionReady(description)

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
      csvAttachment: csvAttachment ?? undefined,
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
      csvAttachment,
      steps,
      user,
    ],
  )

  const attachedFiles = useMemo(() => {
    const files: File[] = []
    if (saveFile) files.push(saveFile)
    if (csvFile) files.push(csvFile)
    return files
  }, [csvFile, saveFile])

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
    if (descriptionReady) return true
    setNotice(t('bug_buster_description_required'))
    return false
  }, [descriptionReady, t])

  const handleAttachFilesChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const picked = [...(e.target.files ?? [])]
    if (attachInputRef.current) attachInputRef.current.value = ''
    if (picked.length === 0) return

    setAttachError(null)
    setAttachBusy(true)
    void Promise.all(picked.map((file) => analyzeBugReportAttachment(file))).then(
      (results) => {
        setAttachBusy(false)
        let added = false
        let lastError: StringId | null = null

        for (const result of results) {
          if (!result.ok) {
            lastError = ATTACH_ERROR_KEYS[result.error]
            continue
          }
          added = true
          if (result.kind === 'save') {
            setSaveFile(result.file)
            setSaveAttachment(result.attachment)
          } else {
            setCsvFile(result.file)
            setCsvAttachment(result.attachment)
          }
        }

        if (lastError) setAttachError(lastError)
        if (!added && lastError) return
      },
    )
  }, [])

  const clearSaveFile = useCallback(() => {
    setSaveFile(null)
    setSaveAttachment(null)
    setAttachError(null)
  }, [])

  const clearCsvFile = useCallback(() => {
    setCsvFile(null)
    setCsvAttachment(null)
    setAttachError(null)
  }, [])

  const clearAllAttachments = useCallback(() => {
    clearSaveFile()
    clearCsvFile()
  }, [clearCsvFile, clearSaveFile])

  const offerAttachedFilesDownload = useCallback(
    (context: 'email' | 'github') => {
      if (attachedFiles.length === 0) return
      void downloadBugReportAttachedFiles(attachedFiles).then(() => {
        const noticeKey: StringId =
          attachedFiles.length > 1
            ? context === 'email'
              ? 'bug_buster_email_files_downloaded'
              : 'bug_buster_github_files_downloaded'
            : saveFile
              ? context === 'email'
                ? 'bug_buster_email_save_downloaded'
                : 'bug_buster_github_save_downloaded'
              : context === 'email'
                ? 'bug_buster_email_csv_downloaded'
                : 'bug_buster_github_csv_downloaded'
        setNotice(t(noticeKey))
        window.setTimeout(() => setNotice(null), 6000)
      })
    },
    [attachedFiles, saveFile, t],
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
    offerAttachedFilesDownload('github')
  }, [buildEnv, offerAttachedFilesDownload, reportInput, requireDescription])

  const openBugReportEmail = useCallback(
    (env: ReturnType<typeof buildEnv>) => {
      const clipboardText = buildBugReportEmailClipboardText(reportInput, env)
      const launchMailto = () => {
        window.location.href = buildBugReportMailtoUrl(reportInput, env)
        offerAttachedFilesDownload('email')
      }
      void navigator.clipboard.writeText(clipboardText).then(
        () => {
          setNotice(t('bug_buster_email_ready'))
          window.setTimeout(() => setNotice(null), 5000)
          launchMailto()
        },
        () => launchMailto(),
      )
    },
    [offerAttachedFilesDownload, reportInput, t],
  )

  const handleEmail = useCallback(() => {
    if (!requireDescription()) return
    const env = buildEnv()
    const reportText = buildBugReport(reportInput, env)

    if (attachedFiles.length > 0) {
      void prepareBugReportFilesForTransfer(attachedFiles).then((prepared) => {
        if (canShareBugReportWithFiles(prepared)) {
          void shareBugReportWithFiles(reportText, attachedFiles, t('bug_buster_title')).then(
            (result) => {
              if (result === 'shared') {
                setNotice(
                  t(
                    attachedFiles.length > 1
                      ? 'bug_buster_share_ok_files'
                      : saveFile
                        ? 'bug_buster_share_ok'
                        : 'bug_buster_share_ok_csv',
                  ),
                )
                window.setTimeout(() => setNotice(null), 4000)
                return
              }
              if (result === 'aborted') return
              openBugReportEmail(env)
            },
          )
          return
        }
        openBugReportEmail(env)
      })
      return
    }

    openBugReportEmail(env)
  }, [
    attachedFiles,
    buildEnv,
    openBugReportEmail,
    reportInput,
    requireDescription,
    saveFile,
    t,
  ])

  return (
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
            rows={3}
            required
            aria-required="true"
            aria-invalid={!descriptionReady}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value)
              if (isBugReportDescriptionReady(e.target.value)) setNotice(null)
            }}
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
            rows={2}
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            placeholder={t('bug_buster_steps_placeholder')}
          />
        </div>

        <div className="bug-buster-dialog__field">
          <span className="bug-buster-dialog__label" id="bug-buster-attach-label">
            {t('bug_buster_attach_label')}
          </span>
          <p className="bug-buster-dialog__save-hint">{t('bug_buster_attach_hint')}</p>
          <div className="bug-buster-dialog__save-row">
            <input
              ref={attachInputRef}
              id="bug-buster-attach"
              type="file"
              multiple
              className="bug-buster-dialog__file-input"
              accept=".dat,.csv"
              aria-labelledby="bug-buster-attach-label"
              disabled={attachBusy}
              onChange={handleAttachFilesChange}
            />
            {saveFile || csvFile ? (
              <button
                type="button"
                className="glow-btn bug-buster-dialog__save-clear"
                onClick={clearAllAttachments}
              >
                {t('bug_buster_attach_clear')}
              </button>
            ) : null}
          </div>
          {attachBusy ? (
            <p className="bug-buster-dialog__save-meta" role="status">
              {t('bug_buster_attach_analyzing')}
            </p>
          ) : null}
          {attachError ? (
            <p className="bug-buster-dialog__save-error" role="alert">
              {t(attachError)}
            </p>
          ) : null}
          {saveAttachment ? (
            <p className="bug-buster-dialog__save-meta" role="status">
              {t('bug_buster_attach_save_meta')
                .replace('{{name}}', saveAttachment.fileName)
                .replace('{{size}}', formatSaveBytes(saveAttachment.sizeBytes))
                .replace(
                  '{{gzip}}',
                  saveAttachment.gzip
                    ? t('bug_buster_save_gzip_yes')
                    : t('bug_buster_save_gzip_no'),
                )}
              {saveFile && csvFile ? (
                <>
                  {' '}
                  <button
                    type="button"
                    className="bug-buster-dialog__attach-remove-one"
                    onClick={clearSaveFile}
                  >
                    {t('bug_buster_attach_remove_save')}
                  </button>
                </>
              ) : null}
            </p>
          ) : null}
          {csvAttachment ? (
            <p className="bug-buster-dialog__save-meta" role="status">
              {t('bug_buster_attach_csv_meta')
                .replace('{{name}}', csvAttachment.fileName)
                .replace('{{size}}', formatCsvBytes(csvAttachment.sizeBytes))}
              {saveFile && csvFile ? (
                <>
                  {' '}
                  <button
                    type="button"
                    className="bug-buster-dialog__attach-remove-one"
                    onClick={clearCsvFile}
                  >
                    {t('bug_buster_attach_remove_csv')}
                  </button>
                </>
              ) : null}
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
            <button
              type="button"
              className="glow-btn glow-btn--block"
              disabled={!descriptionReady || attachBusy}
              onClick={handleCopy}
            >
              {t('bug_buster_copy')}
            </button>
            <button
              type="button"
              className="glow-btn glow-btn--block"
              disabled={!descriptionReady || attachBusy}
              onClick={handleEmail}
            >
              {t('bug_buster_email')}
            </button>
          </div>
          <button
            type="button"
            className="glow-btn glow-btn--block"
            disabled={!descriptionReady || attachBusy}
            onClick={handleGitHub}
          >
            {t('bug_buster_github')}
          </button>
        </div>

        {notice ? (
          <p className="bug-buster-dialog__notice" role="status">
            {notice}
          </p>
        ) : null}
      </div>
    </div>
  )
}

export function BugBusterDialog() {
  const { open, initial, mainPanel, closeBugBuster, sessionId } = useBugBuster()
  if (!open) return null
  return createPortal(
    <BugBusterDialogBody
      key={sessionId}
      initial={initial}
      mainPanel={mainPanel}
      closeBugBuster={closeBugBuster}
    />,
    document.body,
  )
}
