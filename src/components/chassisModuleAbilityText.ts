const ABILITY_VALUE_HIGHLIGHT =
  /^(\d+(?:\.\d+)?(?:s|%|x|m)|×\d+(?:\.\d+)?|\+\d+(?:\.\d+)?m)$/i

const SUFFIX_VALUE_PATTERN = String.raw`\d+(?:\.\d+)?(?:s|%|x|m)`
const TIMES_VALUE_PATTERN = String.raw`×\d+(?:\.\d+)?`
const METERS_VALUE_PATTERN = String.raw`\+\d+(?:\.\d+)?m`

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function splitModuleAbilityUniqueParts(
  text: string,
  highlightTokens: readonly string[] = [],
): string[] {
  const tokens = [...new Set(highlightTokens.filter((token) => token !== ''))].sort(
    (a, b) => b.length - a.length,
  )
  const patterns = [SUFFIX_VALUE_PATTERN, TIMES_VALUE_PATTERN, METERS_VALUE_PATTERN, ...tokens.map(escapeRegExp)]
  return text.split(new RegExp(`(${patterns.join('|')})`, 'gi'))
}

export function shouldHighlightModuleAbilityPart(
  part: string,
  highlightTokens: readonly string[],
): boolean {
  if (highlightTokens.some((token) => token !== '' && part.toLowerCase() === token.toLowerCase())) {
    return true
  }
  return ABILITY_VALUE_HIGHLIGHT.test(part)
}
