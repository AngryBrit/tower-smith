import type { GalleryBuildCategory } from '../towerGallery/buildCategories'
import { GALLERY_BUILD_CATEGORY_I18N } from '../towerGallery/buildCategories'
import { GalleryCategoryDropdown } from './GalleryCategorySelect'
import { useI18n } from '../i18n'
import type { StringId } from '../i18n/dictionary'

const CATEGORY_ENTRIES = Object.entries(GALLERY_BUILD_CATEGORY_I18N) as [
  GalleryBuildCategory,
  { name: StringId; desc: StringId },
][]

type GalleryBuildCategorySelectProps = {
  id?: string
  value: GalleryBuildCategory | ''
  onChange: (value: GalleryBuildCategory) => void
  disabled?: boolean
  className?: string
  inputClassName?: string
}

export function GalleryBuildCategorySelect({
  id,
  value,
  onChange,
  disabled = false,
  className,
  inputClassName = 'glow-input',
}: GalleryBuildCategorySelectProps) {
  const { t } = useI18n()

  return (
    <label className={className ?? 'tower-gallery__field'}>
      <span>{t('gallery_field_category')}</span>
      <select
        id={id}
        className={inputClassName}
        value={value}
        disabled={disabled}
        required
        onChange={(e) => onChange(e.target.value as GalleryBuildCategory)}
      >
        <option value="" disabled>
          {t('gallery_field_category_placeholder')}
        </option>
        {CATEGORY_ENTRIES.map(([category, keys]) => (
          <option key={category} value={category} title={t(keys.desc)}>
            {t(keys.name)}
          </option>
        ))}
      </select>
    </label>
  )
}

type GalleryBuildCategoryBadgeProps = {
  category: GalleryBuildCategory
  className?: string
}

export function GalleryBuildCategoryBadge({
  category,
  className,
}: GalleryBuildCategoryBadgeProps) {
  const { t } = useI18n()
  const keys = GALLERY_BUILD_CATEGORY_I18N[category]

  return (
    <span
      className={['gallery-build-category-badge', className].filter(Boolean).join(' ')}
      title={t(keys.desc)}
    >
      {t(keys.name)}
    </span>
  )
}

type GalleryBuildCategoryFilterProps = {
  id?: string
  value: GalleryBuildCategory | ''
  onChange: (value: GalleryBuildCategory | '') => void
  disabled?: boolean
}

export function GalleryBuildCategoryFilter({
  value,
  onChange,
  disabled = false,
}: GalleryBuildCategoryFilterProps) {
  const { t } = useI18n()

  return (
    <label className="tower-gallery__field tower-gallery__category-filter">
      <span>{t('gallery_filter_category')}</span>
      <GalleryCategoryDropdown
        allowAll
        value={value}
        disabled={disabled}
        rootClassName="tower-gallery__category-select--filter"
        onChange={onChange}
      />
    </label>
  )
}
