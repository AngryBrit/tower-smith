/** @vitest-environment jsdom */
import { describe, expect, it } from 'vitest'
import {
  extractVisibleSpanText,
  extractWikiTableRows,
  isZeroFontSizeStyle,
  looksLikeSpanFontObfuscation,
  mergeWikiTablePages,
} from './extractVisibleSpanText'

describe('isZeroFontSizeStyle', () => {
  it('treats zero font sizes as hidden', () => {
    expect(isZeroFontSizeStyle('font-size: 0px')).toBe(true)
    expect(isZeroFontSizeStyle('font-size:0px;color:red')).toBe(true)
    expect(isZeroFontSizeStyle('font-size: 0')).toBe(true)
    expect(isZeroFontSizeStyle('font-size:0em')).toBe(true)
  })

  it('treats inherit and missing font-size as visible', () => {
    expect(isZeroFontSizeStyle('font-size: inherit')).toBe(false)
    expect(isZeroFontSizeStyle('color: red')).toBe(false)
    expect(isZeroFontSizeStyle(null)).toBe(false)
  })
})

describe('extractVisibleSpanText', () => {
  it('keeps inherit spans and drops 0px decoys', () => {
    const html = [
      '<span style="font-size: 0px">{</span>',
      '<span style="font-size: inherit">3</span>',
      '<span style="font-size: 0px">R</span>',
      '<span style="font-size: inherit">0</span>',
      '<span style="font-size: inherit">.</span>',
      '<span style="font-size: inherit">0</span>',
      '<span style="font-size: inherit">0</span>',
      '<span style="font-size: 0px">)</span>',
    ].join('')
    expect(extractVisibleSpanText(html)).toBe('30.00')
  })

  it('handles a wrapped fragment with junk around real digits', () => {
    const html =
      '<div><span style="font-size: 0px">R3Fw)85?Kf]_U6%W</span>' +
      '<span style="font-size: inherit">1</span>' +
      '<span style="font-size: inherit">2</span>' +
      '<span style="font-size: 0px">noise</span>' +
      '<span style="font-size: inherit">.</span>' +
      '<span style="font-size: inherit">5</span></div>'
    expect(extractVisibleSpanText(html)).toBe('12.5')
  })

  it('ignores wrapper spans without font-size', () => {
    const html =
      '<span><span style="font-size: 0px">X</span><span style="font-size: inherit">Y</span></span>'
    expect(extractVisibleSpanText(html)).toBe('Y')
  })

  it('extracts wiki table rows per cell', () => {
    const html =
      '<table><tr><td><span style="font-size: inherit">1</span></td>' +
      '<td><span style="font-size: 0px">Z</span><span style="font-size: inherit">2.5</span></td></tr></table>'
    expect(extractWikiTableRows(html)).toEqual([['1', '2.5']])
  })

  it('returns empty string for empty input', () => {
    expect(extractVisibleSpanText('')).toBe('')
    expect(extractVisibleSpanText('   ')).toBe('')
  })
})

describe('mergeWikiTablePages', () => {
  it('merges paginated extracts without duplicate headers', () => {
    expect(
      mergeWikiTablePages([
        [
          ['Level', 'Value'],
          ['0', '1.00'],
          ['1', '1.05'],
        ],
        [
          ['Level', 'Value'],
          ['2', '1.10'],
          ['3', '1.15'],
        ],
      ]),
    ).toEqual([
      ['Level', 'Value'],
      ['0', '1.00'],
      ['1', '1.05'],
      ['2', '1.10'],
      ['3', '1.15'],
    ])
  })
})

describe('looksLikeSpanFontObfuscation', () => {
  it('detects span + zero font-size markup', () => {
    expect(looksLikeSpanFontObfuscation('<span style="font-size: 0px">x</span>')).toBe(true)
    expect(looksLikeSpanFontObfuscation('30.00')).toBe(false)
  })
})
