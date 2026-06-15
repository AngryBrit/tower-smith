const GAPI_SCRIPT_SRC = 'https://apis.google.com/js/api.js'
const SPREADSHEET_MIME = 'application/vnd.google-apps.spreadsheet'

/** Non-sensitive per-file Drive scope used for Effective Paths sync. */
export const DRIVE_FILE_SCOPE = 'https://www.googleapis.com/auth/drive.file'

type PickerDocument = {
  id?: string
}

type PickerResponse = {
  action?: string
  docs?: PickerDocument[]
}

type PickerDocsView = {
  setIncludeFolders: (include: boolean) => PickerDocsView
  setSelectFolderEnabled: (enabled: boolean) => PickerDocsView
  setMimeTypes: (mimeTypes: string) => PickerDocsView
  setMode: (mode: string) => PickerDocsView
  setFileIds: (fileIds: string) => void
}

type PickerBuilder = {
  addView: (view: PickerDocsView) => PickerBuilder
  setOAuthToken: (token: string) => PickerBuilder
  setDeveloperKey: (key: string) => PickerBuilder
  setAppId: (appId: string) => PickerBuilder
  setTitle: (title: string) => PickerBuilder
  enableFeature: (feature: string) => PickerBuilder
  setCallback: (callback: (data: PickerResponse) => void) => PickerBuilder
  build: () => { setVisible: (visible: boolean) => void }
}

type PickerNamespace = {
  Action: { PICKED: string; CANCEL: string }
  DocsViewMode: { LIST: string; GRID: string }
  Feature: { MULTISELECT_ENABLED: string }
  ViewId: { SPREADSHEETS: string }
  DocsView: new (viewId: string) => PickerDocsView
  PickerBuilder: new () => PickerBuilder
}

type GapiLoad = {
  load: (
    api: string,
    options: { callback: () => void; onerror?: () => void },
  ) => void
}

declare global {
  interface Window {
    gapi?: {
      load: GapiLoad['load']
    }
  }
}

function googlePickerNamespace(): PickerNamespace | undefined {
  const google = (window as Window & { google?: { picker?: PickerNamespace } }).google
  return google?.picker
}

export type GoogleSpreadsheetPickerOptions = {
  accessToken: string
  /**
   * Spreadsheet IDs to show in the picker (from Settings or IDS tab links).
   * Passed to Picker as a comma-separated string via setFileIds.
   */
  suggestedFileIds: readonly string[]
  multiselect?: boolean
  title?: string
  /** Called when the Picker overlay opens or closes (hide blocking UI underneath). */
  onPickerUiActive?: (active: boolean) => void
}

export type GoogleSpreadsheetPickerResult =
  | { ok: true; spreadsheetIds: string[] }
  | { ok: false; reason: 'cancelled' | 'picker_not_configured' | 'picker_failed' }

let gapiScriptPromise: Promise<void> | null = null
let pickerApiPromise: Promise<void> | null = null

/** Desktop Picker callback may never fire on some mobile browsers — fail instead of hanging. */
const PICKER_UI_TIMEOUT_MS = 180_000

/** Picker API expects a comma-separated string, not a JavaScript array. */
export function formatPickerFileIds(fileIds: readonly string[]): string {
  return [...new Set(fileIds.map((id) => id.trim()).filter((id) => id.length > 0))].join(',')
}

export function googlePickerApiKey(): string | null {
  const key = import.meta.env.VITE_GOOGLE_PICKER_API_KEY
  return typeof key === 'string' && key.trim().length > 0 ? key.trim() : null
}

export function googleDrivePickerConfigured(): boolean {
  return googlePickerApiKey() != null
}

function pickerAppId(): string | null {
  const projectNumber = import.meta.env.VITE_GOOGLE_CLOUD_PROJECT_NUMBER
  if (typeof projectNumber === 'string' && projectNumber.trim().length > 0) {
    return projectNumber.trim()
  }
  return null
}

export function googlePickerAppIdConfigured(): boolean {
  return pickerAppId() != null
}

function loadGapiScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('google_picker_unavailable'))
  }
  if (window.gapi?.load) {
    return Promise.resolve()
  }
  if (gapiScriptPromise) return gapiScriptPromise

  gapiScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GAPI_SCRIPT_SRC}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('google_picker_script_failed')), {
        once: true,
      })
      queueMicrotask(() => {
        if (window.gapi?.load) resolve()
      })
      return
    }

    const script = document.createElement('script')
    script.src = GAPI_SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('google_picker_script_failed'))
    document.head.appendChild(script)
  }).catch((err: unknown) => {
    gapiScriptPromise = null
    throw err
  }) as Promise<void>

  return gapiScriptPromise
}

function loadPickerApi(): Promise<void> {
  if (pickerApiPromise) return pickerApiPromise

  pickerApiPromise = loadGapiScript()
    .then(
      () =>
        new Promise<void>((resolve, reject) => {
          const gapi = window.gapi
          if (!gapi?.load) {
            reject(new Error('google_picker_unavailable'))
            return
          }
          gapi.load('picker', {
            callback: () => {
              if (googlePickerNamespace()) resolve()
              else reject(new Error('google_picker_unavailable'))
            },
            onerror: () => reject(new Error('google_picker_load_failed')),
          })
        }),
    )
    .catch((err: unknown) => {
      pickerApiPromise = null
      throw err
    }) as Promise<void>

  return pickerApiPromise
}

function createSpreadsheetView(picker: PickerNamespace, fileIds: string): PickerDocsView {
  const view = new picker.DocsView(picker.ViewId.SPREADSHEETS)
    .setIncludeFolders(false)
    .setSelectFolderEnabled(false)
    .setMimeTypes(SPREADSHEET_MIME)
  if (picker.DocsViewMode?.LIST) {
    view.setMode(picker.DocsViewMode.LIST)
  }
  if (fileIds.length > 0) {
    view.setFileIds(fileIds)
  }
  return view
}

/**
 * Open Google Picker so the user grants drive.file access to specific spreadsheets.
 */
export async function pickGoogleSpreadsheets(
  options: GoogleSpreadsheetPickerOptions,
): Promise<GoogleSpreadsheetPickerResult> {
  const apiKey = googlePickerApiKey()
  const appId = pickerAppId()
  if (!apiKey || !appId) {
    return { ok: false, reason: 'picker_not_configured' }
  }

  try {
    await loadPickerApi()
  } catch {
    return { ok: false, reason: 'picker_failed' }
  }

  const picker = googlePickerNamespace()
  if (!picker) {
    return { ok: false, reason: 'picker_failed' }
  }

  const pickerFileIds = formatPickerFileIds(options.suggestedFileIds)
  if (!pickerFileIds) {
    return { ok: false, reason: 'picker_failed' }
  }

  return new Promise((resolve) => {
    let settled = false
    const finish = (result: GoogleSpreadsheetPickerResult) => {
      if (settled) return
      settled = true
      window.clearTimeout(timeoutId)
      options.onPickerUiActive?.(false)
      resolve(result)
    }

    const timeoutId = window.setTimeout(() => {
      finish({ ok: false, reason: 'picker_failed' })
    }, PICKER_UI_TIMEOUT_MS)

    const builder = new picker.PickerBuilder()
      .addView(createSpreadsheetView(picker, pickerFileIds))
      .setOAuthToken(options.accessToken)
      .setDeveloperKey(apiKey)
      .setAppId(appId)
      .setCallback((data: PickerResponse) => {
        if (data.action === picker.Action.PICKED) {
          const spreadsheetIds = (data.docs ?? [])
            .map((doc: PickerDocument) => doc.id?.trim())
            .filter((id): id is string => Boolean(id))
          finish({ ok: true, spreadsheetIds })
          return
        }
        if (data.action === picker.Action.CANCEL) {
          finish({ ok: false, reason: 'cancelled' })
        }
      })

    if (options.title) {
      builder.setTitle(options.title)
    }
    if (options.multiselect) {
      builder.enableFeature(picker.Feature.MULTISELECT_ENABLED)
    }

    try {
      builder.build().setVisible(true)
      options.onPickerUiActive?.(true)
    } catch {
      finish({ ok: false, reason: 'picker_failed' })
    }
  })
}
