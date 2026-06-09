/** True when inline style hides text with font-size: 0 (0px, 0em, etc.). */
export function isZeroFontSizeStyle(style: string | null | undefined): boolean {
  if (!style) return false
  const match = style.match(/font-size\s*:\s*([^;]+)/i)
  if (!match) return false
  const value = match[1].trim().toLowerCase()
  if (value === 'inherit' || value === 'initial' || value === 'unset' || value === 'revert') {
    return false
  }
  const num = Number.parseFloat(value)
  return Number.isFinite(num) && num === 0
}

function spanHasFontSizeStyle(style: string | null | undefined): boolean {
  return Boolean(style && /font-size\s*:/i.test(style))
}

/** Visible cell text; falls back to plain text when a cell has no obfuscated spans. */
export function visibleTextFromStyledSpans(root: ParentNode): string {
  let out = ''
  for (const span of root.querySelectorAll('span[style]')) {
    const style = span.getAttribute('style')
    if (!spanHasFontSizeStyle(style) || isZeroFontSizeStyle(style)) continue
    out += span.textContent ?? ''
  }
  if (out.length > 0) return out
  const el = root as Element
  if (typeof el.textContent === 'string') return el.textContent.trim()
  return ''
}

function extractWithRegex(html: string): string {
  const spanRe = /<span\b([^>]*)>([\s\S]*?)<\/span>/gi
  let out = ''
  let match: RegExpExecArray | null
  while ((match = spanRe.exec(html)) !== null) {
    const attrs = match[1]
    const inner = match[2]
    const styleMatch = attrs.match(/\bstyle\s*=\s*(["'])([\s\S]*?)\1/i)
    const style = styleMatch?.[2] ?? null
    if (!spanHasFontSizeStyle(style) || isZeroFontSizeStyle(style)) continue
    out += inner.replace(/<[^>]+>/g, '')
  }
  return out
}

/** Decode wiki table rows from a live or parsed document (browser, jsdom). */
export function extractWikiTableRowsFromDocument(
  doc: Document,
  tableSelector = 'table',
): string[][] {
  function isZeroFontSizeStyle(style: string | null | undefined): boolean {
    if (!style) return false
    const match = style.match(/font-size\s*:\s*([^;]+)/i)
    if (!match) return false
    const value = match[1].trim().toLowerCase()
    if (value === 'inherit' || value === 'initial' || value === 'unset' || value === 'revert') {
      return false
    }
    const num = Number.parseFloat(value)
    return Number.isFinite(num) && num === 0
  }

  function spanHasFontSizeStyle(style: string | null | undefined): boolean {
    return Boolean(style && /font-size\s*:/i.test(style))
  }

  function visibleTextFromStyledSpans(root: ParentNode): string {
    let out = ''
    for (const span of root.querySelectorAll('span[style]')) {
      const style = span.getAttribute('style')
      if (!spanHasFontSizeStyle(style) || isZeroFontSizeStyle(style)) continue
      out += span.textContent ?? ''
    }
    if (out.length > 0) return out
    const el = root as Element
    if (typeof el.textContent === 'string') return el.textContent.trim()
    return ''
  }

  const table = doc.querySelector(tableSelector)
  if (!table) return []

  const rows: string[][] = []
  for (const tr of table.querySelectorAll('tr')) {
    const cells = tr.querySelectorAll('th, td')
    if (cells.length === 0) continue
    rows.push([...cells].map((cell) => visibleTextFromStyledSpans(cell)))
  }
  return rows
}

/** Decode a wiki table saved as HTML into rows of visible cell text. */
export function extractWikiTableRows(
  html: string,
  doc?: Document,
  tableSelector = 'table',
): string[][] {
  const root = doc ?? new DOMParser().parseFromString(html, 'text/html')
  return extractWikiTableRowsFromDocument(root, tableSelector)
}

/** Decode visible text from an already-parsed document (Node/jsdom or browser). */
export function extractVisibleSpanTextFromDocument(doc: Document): string {
  const fromSpans = visibleTextFromStyledSpans(doc.body)
  if (fromSpans.length > 0) return fromSpans
  return doc.body?.textContent?.trim() ?? ''
}

/**
 * Decode wiki-style obfuscated values: each character is a `<span>`; real glyphs use
 * `font-size: inherit`, decoys use `font-size: 0px`. Plain-text copy/paste cannot be
 * decoded — pass outerHTML from DevTools (or full page HTML).
 */
export function extractVisibleSpanText(html: string): string {
  const trimmed = html.trim()
  if (!trimmed) return ''
  if (typeof DOMParser !== 'undefined') {
    return extractVisibleSpanTextFromDocument(new DOMParser().parseFromString(trimmed, 'text/html'))
  }
  return extractWithRegex(trimmed)
}

/** Heuristic: pasted content looks like span font-size obfuscation (needs HTML decode). */
export function looksLikeSpanFontObfuscation(text: string): boolean {
  return /font-size\s*:\s*0/i.test(text) && /<span\b/i.test(text)
}

/** Merge paginated table extracts; drops repeated header rows after the first page. */
export function mergeWikiTablePages(pages: string[][][], headerRowCount = 1): string[][] {
  const merged: string[][] = []
  for (const [pageIndex, rows] of pages.entries()) {
    const skip = pageIndex === 0 ? 0 : headerRowCount
    for (let i = skip; i < rows.length; i++) merged.push(rows[i])
  }
  return merged
}
