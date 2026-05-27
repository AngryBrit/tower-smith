import { describe, expect, it } from 'vitest'
import {
  buildGalleryShareUrls,
  extractGalleryBuildIdFromText,
  isGalleryBuildId,
} from './shareLink'

const SAMPLE_ID = 'a1b2c3d4-e5f6-4789-a012-3456789abcde'

describe('towerGallery shareLink', () => {
  it('builds clean and full gallery URLs', () => {
    const { clean, full } = buildGalleryShareUrls(
      SAMPLE_ID,
      'https://example.com/app/?utm=1#hash',
    )
    expect(clean).toBe(`https://example.com/app/?build=${SAMPLE_ID}`)
    expect(full).toContain(`build=${SAMPLE_ID}`)
    expect(full).toContain('utm=1')
    expect(full).not.toContain('tower=')
  })

  it('extracts build id from pasted URL', () => {
    expect(
      extractGalleryBuildIdFromText(
        `https://host.test/?build=${SAMPLE_ID}`,
      ),
    ).toBe(SAMPLE_ID)
    expect(isGalleryBuildId(SAMPLE_ID)).toBe(true)
    expect(isGalleryBuildId('not-a-uuid')).toBe(false)
  })
})
