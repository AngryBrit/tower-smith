import { describe, expect, it } from 'vitest'
import { capitalizeRelicDisplayName } from './relicDisplayName'

describe('capitalizeRelicDisplayName', () => {
  it('title-cases each word', () => {
    expect(capitalizeRelicDisplayName('Dry leaves')).toBe('Dry Leaves')
    expect(capitalizeRelicDisplayName('Glimpse of Despair')).toBe('Glimpse Of Despair')
  })

  it('preserves ordinals, tier tokens, and acronyms', () => {
    expect(capitalizeRelicDisplayName('1st Tower Birthday')).toBe('1st Tower Birthday')
    expect(capitalizeRelicDisplayName('T:XIII Hyper')).toBe('T:XIII Hyper')
    expect(capitalizeRelicDisplayName('VR')).toBe('VR')
  })

  it('keeps apostrophe contractions natural', () => {
    expect(capitalizeRelicDisplayName("Let's Mix")).toBe("Let's Mix")
    expect(capitalizeRelicDisplayName("Nature's Wrath")).toBe("Nature's Wrath")
  })
})
