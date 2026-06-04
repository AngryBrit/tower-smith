import { useI18n } from '../i18n'

type GalleryAuthorLineProps = {
  author: string
  guild?: string
  avatarUrl?: string
  className?: string
  /** When set, the author name is a button that filters the gallery list by this user. */
  onAuthorClick?: (author: string) => void
  /** When set, the guild tag is a button that filters the gallery list by this guild. */
  onGuildClick?: (guild: string) => void
}

export function GalleryAuthorLine({
  author,
  guild,
  avatarUrl,
  className,
  onAuthorClick,
  onGuildClick,
}: GalleryAuthorLineProps) {
  const { fmt } = useI18n()
  const guildName = guild?.trim() ?? ''
  const classes = [
    'gallery-author-line',
    onAuthorClick || onGuildClick ? 'gallery-author-line--clickable' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span className={classes}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt=""
          className="gallery-author-line__avatar"
          width={20}
          height={20}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <span
          className="gallery-author-line__avatar gallery-author-line__avatar--placeholder"
          aria-hidden
        />
      )}
      {onAuthorClick ? (
        <button
          type="button"
          className="gallery-author-line__filter-btn"
          aria-label={fmt.galleryFilterAuthorAria(author)}
          onClick={() => onAuthorClick(author)}
        >
          {fmt.galleryByAuthor(author)}
        </button>
      ) : (
        <span>{fmt.galleryByAuthor(author)}</span>
      )}
      {guildName ? (
        onGuildClick ? (
          <button
            type="button"
            className="gallery-author-line__filter-btn"
            aria-label={fmt.galleryFilterGuildAria(guildName)}
            onClick={() => onGuildClick(guildName)}
          >
            {` [${guildName}]`}
          </button>
        ) : (
          <span>{` [${guildName}]`}</span>
        )
      ) : null}
    </span>
  )
}
