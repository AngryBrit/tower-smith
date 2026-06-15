/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  beginEpMobileResumeRun,
  claimEpMobileResume,
  finishEpMobileResumeRun,
  peekEpMobileResume,
  resetEpMobileResumeRunStateForTests,
  stashEpMobileResume,
} from './effectivePathsMobileGrantSession'

const sampleResume = {
  accessToken: 'token-abc',
  pickedSpreadsheetIds: ['sheet-1'],
  phase: 'master' as const,
  masterSpreadsheetId: 'sheet-1',
  masterSheetGid: null,
  titles: {
    idsMaster: 'IDS',
    allWorkbooks: 'All',
    linkedWorkbooks: 'Linked',
  },
}

describe('ep mobile resume run guard', () => {
  beforeEach(() => {
    sessionStorage.clear()
    resetEpMobileResumeRunStateForTests()
  })

  afterEach(() => {
    sessionStorage.clear()
    resetEpMobileResumeRunStateForTests()
  })

  it('claims without consuming until finish', () => {
    stashEpMobileResume(sampleResume)

    const claimed = claimEpMobileResume()
    expect(claimed).toEqual(sampleResume)
    expect(peekEpMobileResume()).toEqual(sampleResume)

    finishEpMobileResumeRun(true)
    expect(peekEpMobileResume()).toBeNull()
  })

  it('prevents a second in-flight run (StrictMode remount)', () => {
    stashEpMobileResume(sampleResume)

    expect(claimEpMobileResume()).toEqual(sampleResume)
    expect(beginEpMobileResumeRun()).toBe(true)
    expect(beginEpMobileResumeRun()).toBe(false)
    expect(claimEpMobileResume()).toBeNull()
  })
})
