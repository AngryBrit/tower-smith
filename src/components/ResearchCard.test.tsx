import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '../i18n'
import { loadResearchFixture } from '../test/researchFixture'
import { getLevelBounds } from '../types/research'
import { ResearchCard } from './ResearchCard'

describe('ResearchCard', () => {
  afterEach(() => {
    cleanup()
  })

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
    await userEvent.click(
      screen.getByRole('button', { name: 'Increase level (hold to max)' }),
    )
    expect(onLevelDelta).toHaveBeenCalledWith(1)
  })

  it('bumps lab level down via − control', async () => {
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
          effectiveLevel={2}
          maxLevelCap={bounds.max}
          labsCoinDiscountPercent={0}
          labsSpeedMultiplier={1}
          onLevelDelta={onLevelDelta}
          onLevelSet={onLevelSet}
        />
      </I18nProvider>,
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Decrease level (hold to zero)' }),
    )
    expect(onLevelDelta).toHaveBeenCalledWith(-1)
  })

  describe('hold stepper', () => {
    beforeEach(() => {
      cleanup()
      vi.useFakeTimers()
    })
    afterEach(() => {
      cleanup()
      vi.useRealTimers()
    })

    it('sets max level when + is held', () => {
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

      const inc = screen.getByRole('button', {
        name: 'Increase level (hold to max)',
      })
      fireEvent.pointerDown(inc)
      vi.advanceTimersByTime(500)
      fireEvent.pointerUp(inc)

      expect(onLevelSet).toHaveBeenCalledWith(bounds.max)
      expect(onLevelDelta).not.toHaveBeenCalled()
    })

    it('sets level to 0 when − is held', () => {
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
            effectiveLevel={3}
            maxLevelCap={bounds.max}
            labsCoinDiscountPercent={0}
            labsSpeedMultiplier={1}
            onLevelDelta={onLevelDelta}
            onLevelSet={onLevelSet}
          />
        </I18nProvider>,
      )

      const dec = screen.getByRole('button', {
        name: 'Decrease level (hold to zero)',
      })
      fireEvent.pointerDown(dec)
      vi.advanceTimersByTime(500)
      fireEvent.pointerUp(dec)

      expect(onLevelSet).toHaveBeenCalledWith(0)
      expect(onLevelDelta).not.toHaveBeenCalled()
    })
  })
})
