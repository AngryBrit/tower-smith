import { useI18n } from '../i18n'

type GalleryAuthorLineProps = {
  author: string
  avatarUrl?: string
  className?: string
}

export function GalleryAuthorLine({
  author,
  avatarUrl,
  className,
}: GalleryAuthorLineProps) {
  const { fmt } = useI18n()
  const classes = ['gallery-author-line', className].filter(Boolean).join(' ')

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
      <span>{fmt.galleryByAuthor(author)}</span>
    </span>
  )
}
