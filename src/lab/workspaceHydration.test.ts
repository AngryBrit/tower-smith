/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FORMAT_EN } from '../i18n/dictionary'
import { getGalleryTower } from '../towerGallery/api'
import { loadResearchFixture } from '../test/researchFixture'
import { hydrateWorkspaceFromStorage } from './workspaceHydration'

vi.mock('../towerGallery/api', () => ({
  getGalleryTower: vi.fn(),
}))

const BUILD_ID = 'a1b2c3d4-e5f6-4789-a012-3456789abcde'

describe('hydrateWorkspaceFromStorage', () => {
  const data = loadResearchFixture()
  const fmt = FORMAT_EN

  beforeEach(() => {
    vi.mocked(getGalleryTower).mockReset()
    window.history.replaceState({}, '', '/')
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('shows not-found notice and clears ?build= when gallery tower is missing', async () => {
    window.history.replaceState({}, '', `/?build=${BUILD_ID}`)
    vi.mocked(getGalleryTower).mockResolvedValue({ ok: false, error: 'not_found' })

    const result = await hydrateWorkspaceFromStorage(data, fmt)

    expect(getGalleryTower).toHaveBeenCalledWith(BUILD_ID)
    expect(result.importNotice).toEqual({
      message: fmt.galleryShareLoadError('not_found'),
      variant: 'error',
    })
    expect(window.location.search).not.toContain('build=')
  })

  it('loads gallery tower and clears ?build= on success', async () => {
    window.history.replaceState({}, '', `/?build=${BUILD_ID}`)
    vi.mocked(getGalleryTower).mockResolvedValue({
      ok: true,
      record: {
        id: BUILD_ID,
        title: 'Test tower',
        payload: { v: 4, o: { '0-0': 3 } },
        createdAt: '2026-01-01T00:00:00.000Z',
        upvoteCount: 0,
      },
    })

    const result = await hydrateWorkspaceFromStorage(data, fmt)

    expect(result.importNotice?.message).toContain('Test tower')
    expect(result.importNotice?.variant).toBe('success')
    expect(result.workspace.lab.levelOverrides['0-0']).toBe(3)
    expect(window.location.search).not.toContain('build=')
  })
})
