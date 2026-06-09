import type { WorkshopSubmoduleBonusContext } from '../data/workshopAssistSubmoduleScale'
import type { WorkshopPersistedV1 } from '../labPresetsStorage'
import type { ResearchData } from '../types/research'

export function workshopPipelineSubmoduleContext(
  ws: WorkshopPersistedV1,
  research: ResearchData,
  labOverrides: Record<string, number>,
): WorkshopSubmoduleBonusContext {
  return { ws, research, labOverrides }
}
