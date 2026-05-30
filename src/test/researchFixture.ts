import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  parseResearchManifest,
  parseResearchSection,
  type ResearchData,
} from '../types/research'

const srcDir = dirname(fileURLToPath(import.meta.url))

/** Loads bundled public research JSON (for unit/integration tests). */
export function loadResearchFixture(): ResearchData {
  const manifestRaw: unknown = JSON.parse(
    readFileSync(join(srcDir, '../../public/research/manifest.json'), 'utf-8'),
  )
  const { sectionFiles } = parseResearchManifest(manifestRaw)
  const sections = sectionFiles.map((rel: string) => {
    const raw: unknown = JSON.parse(
      readFileSync(join(srcDir, '../../public', rel.replace(/^\//, '')), 'utf-8'),
    )
    const slug = rel.split('/').pop()!.replace(/\.json$/i, '')
    return parseResearchSection(raw, slug)
  })
  return { sections }
}
