import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '../i18n'
import { loadResearchFixture } from '../test/researchFixture'
import { getLevelBounds } from '../types/research'
import { ResearchCard } from './ResearchCard'

describe('ResearchCard', () => {
  it('bumps lab level via + control', async () => {
    const data = loadResearchFixture()
    const item = data.sections[0]!.items[0]!
    const bounds = getLevelBounds(item)
    const onLevelDelta = vi.fn()
    const onLevelSet = vi.fn()

    render(
      <I18nProvider>
        <ResearchCard
          sectionSlug="main-research"
          itemIndex={0}
          item={item}
          hidden={false}
          effectiveLevel={1}
          maxLevelCap={bounds.max}
          labsCoinDiscountPercent={0}
          labsSpeedMultiplier={1}
          onLevelDelta={onLevelDelta}
          onLevelSet={onLevelSet}
        />
      </I18nProvider>,
    )

    expect(screen.getByTestId('research-card')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Increase level' }))
    expect(onLevelDelta).toHaveBeenCalledWith(1)
  })
})
