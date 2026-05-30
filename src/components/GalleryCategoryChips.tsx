import {
  GALLERY_BUILD_CATEGORIES,
  GALLERY_BUILD_CATEGORY_I18N,
  type GalleryBuildCategory,
} from '../towerGallery/buildCategories'
import { useI18n } from '../i18n'

type GalleryCategoryChipsProps = {
  value: GalleryBuildCategory | ''
  onChange: (value: GalleryBuildCategory | '') => void
  disabled?: boolean
}

export function GalleryCategoryChips({
  value,
  onChange,
  disabled = false,
}: GalleryCategoryChipsProps) {
  const { t } = useI18n()

  return (
    <div
      className="gallery-category-chips"
      role="group"
      aria-label={t('gallery_filter_tags_aria')}
    >
      <button
        type="button"
        className={
          value === ''
            ? 'gallery-category-chips__chip gallery-category-chips__chip--on'
            : 'gallery-category-chips__chip'
        }
        disabled={disabled}
        aria-pressed={value === ''}
        onClick={() => onChange('')}
      >
        {t('gallery_category_filter_all')}
      </button>
      {GALLERY_BUILD_CATEGORIES.map((category) => {
        const keys = GALLERY_BUILD_CATEGORY_I18N[category]
        const on = value === category
        return (
          <button
            key={category}
            type="button"
            className={
              on
                ? 'gallery-category-chips__chip gallery-category-chips__chip--on'
                : 'gallery-category-chips__chip'
            }
            disabled={disabled}
            aria-pressed={on}
            title={t(keys.desc)}
            onClick={() => onChange(on ? '' : category)}
          >
            {t(keys.name)}
          </button>
        )
      })}
    </div>
  )
}
