export const TOWER_ANDROID_PACKAGE = 'com.TechTreeGames.TheTower'

/** Relative path shown in most Android file managers. */
export const TOWER_ANDROID_SAVE_FOLDER = `Android/data/${TOWER_ANDROID_PACKAGE}/files`

export const TOWER_ANDROID_SAVE_FILE = `${TOWER_ANDROID_SAVE_FOLDER}/playerInfo.dat`

/** Whether a picked file name is a Tower .dat save (e.g. playerInfo.dat). */
export function isPlayerInfoDatFileName(fileName: string): boolean {
  return /\.dat$/i.test(fileName.trim())
}

export function isAndroidBrowser(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Android/i.test(navigator.userAgent)
}

export function isIosBrowser(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iPhone|iPad|iPod/i.test(navigator.userAgent)
}

/**
 * Best-effort: ask Android to open the game's save folder in a file manager.
 * Requires a user gesture; may be blocked or ignored depending on device/browser.
 */
export function tryOpenAndroidPlayerSaveFolder(): void {
  if (typeof document === 'undefined') return
  const docId = encodeURIComponent(`primary:${TOWER_ANDROID_SAVE_FOLDER}`)
  const href = `intent://com.android.externalstorage.documents/document/${docId}#Intent;scheme=content;action=android.intent.action.VIEW;type=vnd.android.document/directory;end`
  const link = document.createElement('a')
  link.href = href
  link.rel = 'noopener'
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  link.remove()
}
