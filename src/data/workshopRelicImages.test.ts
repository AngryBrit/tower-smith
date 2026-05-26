import { describe, expect, it } from 'vitest'
import {
  workshopRelicHasImage,
  workshopRelicImagePath,
  workshopRelicImageUrl,
} from './workshopRelicImages'

describe('workshopRelicImages', () => {
  it('resolves tier and badge art', () => {
    expect(workshopRelicImagePath('t_i_flux')).toBe('rare/relic_Flux_1.webp')
    expect(workshopRelicImagePath('gold_badge')).toBe('epic/relic_GoldBadge_1.webp')
  })

  it('builds URLs without encoded spaces', () => {
    const url = workshopRelicImageUrl('warm_clothes')
    expect(url).toBe('/relics/epic/Winter_is_Coming.webp')
    expect(url).not.toContain('%20')
  })

  it('returns null for relics without mapped art', () => {
    expect(workshopRelicHasImage('unknown_relic_id')).toBe(false)
    expect(workshopRelicImageUrl('unknown_relic_id')).toBeNull()
  })
})
