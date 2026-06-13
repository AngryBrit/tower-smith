import { describe, expect, it, vi } from 'vitest'
import {
  TOWER_ANDROID_SAVE_FILE,
  TOWER_ANDROID_SAVE_FOLDER,
  isAndroidBrowser,
  isIosBrowser,
  isPlayerInfoDatFileName,
  tryOpenAndroidPlayerSaveFolder,
} from './playerInfoSavePath'

describe('playerInfoSavePath', () => {
  it('uses the known Android save folder', () => {
    expect(TOWER_ANDROID_SAVE_FOLDER).toBe(
      'Android/data/com.TechTreeGames.TheTower/files',
    )
    expect(TOWER_ANDROID_SAVE_FILE).toBe(
      'Android/data/com.TechTreeGames.TheTower/files/playerInfo.dat',
    )
  })

  it('accepts only .dat save file names', () => {
    expect(isPlayerInfoDatFileName('playerInfo.dat')).toBe(true)
    expect(isPlayerInfoDatFileName('backup.DAT')).toBe(true)
    expect(isPlayerInfoDatFileName('tower.csv')).toBe(false)
    expect(isPlayerInfoDatFileName('save.zip')).toBe(false)
  })

  it('detects Android user agents', () => {
    vi.stubGlobal('navigator', {
      userAgent:
        'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36',
    })
    expect(isAndroidBrowser()).toBe(true)
    vi.unstubAllGlobals()
  })

  it('does not treat desktop Chrome as Android', () => {
    vi.stubGlobal('navigator', {
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
    })
    expect(isAndroidBrowser()).toBe(false)
    vi.unstubAllGlobals()
  })

  it('detects iOS user agents', () => {
    vi.stubGlobal('navigator', {
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1',
    })
    expect(isIosBrowser()).toBe(true)
    expect(isAndroidBrowser()).toBe(false)
    vi.unstubAllGlobals()
  })

  it('creates an intent link for the save folder', () => {
    const clicks: HTMLAnchorElement[] = []
    const appendChild = vi.fn((node: HTMLAnchorElement) => {
      clicks.push(node)
    })
    const remove = vi.fn()
    vi.stubGlobal('document', {
      createElement: () => ({
        href: '',
        rel: '',
        style: { display: '' },
        click: vi.fn(),
        remove,
      }),
      body: { appendChild, removeChild: vi.fn() },
    })

    tryOpenAndroidPlayerSaveFolder()

    expect(appendChild).toHaveBeenCalledTimes(1)
    expect(clicks[0]?.href).toContain('com.TechTreeGames.TheTower')
    expect(clicks[0]?.href).toContain('intent://')
    vi.unstubAllGlobals()
  })
})
