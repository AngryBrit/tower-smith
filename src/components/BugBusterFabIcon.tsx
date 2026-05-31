import rawSvg from '../icons/no-insect-bug-black-icon.svg?raw'

/** Inline SVG with theme fill classes (external img cannot use CSS vars). */
const THEMED_ICON_HTML = rawSvg
  .replace('<svg ', '<svg class="bug-buster-fab__icon-svg" ')
  .replace('<path d=', '<path class="bug-buster-fab__icon-bug" d=')
  .replace(
    '<path fill-rule="nonzero" d=',
    '<path class="bug-buster-fab__icon-ban" fill-rule="nonzero" d=',
  )

export function BugBusterFabIcon() {
  return (
    <span
      className="bug-buster-fab__icon"
      aria-hidden
      dangerouslySetInnerHTML={{ __html: THEMED_ICON_HTML }}
    />
  )
}
