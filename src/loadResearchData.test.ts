import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { FORMAT_EN } from './i18n/dictionary.formatters'
import { loadResearchData } from './loadResearchData'
import { parseResearchManifest } from './types/research'

const rootDir = dirname(fileURLToPath(import.meta.url))

describe('loadResearchData', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('loads manifest and sections from fetch', async () => {
    const manifestRaw: unknown = JSON.parse(
      readFileSync(join(rootDir, '../public/research/manifest.json'), 'utf-8'),
    )
    const { sectionFiles } = parseResearchManifest(manifestRaw)

    const fetchMock = vi.fn(async (url: string | URL) => {
      const path = String(url)
      if (path.includes('manifest.json')) {
        return new Response(JSON.stringify(manifestRaw), { status: 200 })
      }
      for (const rel of sectionFiles) {
        if (path.includes(rel.replace(/^\//, ''))) {
          const body = readFileSync(
            join(rootDir, '../public', rel.replace(/^\//, '')),
            'utf-8',
          )
          return new Response(body, { status: 200 })
        }
      }
      return new Response('not found', { status: 404 })
    })
    vi.stubGlobal('fetch', fetchMock)

    const data = await loadResearchData('/', FORMAT_EN)
    expect(data.sections.length).toBe(sectionFiles.length)
    expect(data.sections[0]?.items.length).toBeGreaterThan(0)
    expect(fetchMock.mock.calls.length).toBeGreaterThan(sectionFiles.length)
  })
})
