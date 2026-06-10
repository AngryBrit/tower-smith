import { loadResearchFixture } from '../../../src/test/researchFixture'
import type { ResearchData } from '../../../src/types/research'

let cached: ResearchData | null = null

/** Bundled research manifest for Netlify export (reads public/research JSON). */
export function loadBundledResearchData(): ResearchData {
  if (!cached) cached = loadResearchFixture()
  return cached
}
