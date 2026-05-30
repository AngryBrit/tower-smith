import { formatWikiDataAlignedAt } from '../../wikiDataStamp'
import { useI18n } from '../../i18n'

export function WikiDataStampNotice() {
  const { t, locale } = useI18n()
  const dateLabel = formatWikiDataAlignedAt(locale)

  return (
    <p className="settings-page__hint settings-page__wiki-stamp" role="note">
      {dateLabel
        ? t('app_wiki_data_stamp').replace('{{date}}', dateLabel)
        : t('app_wiki_data_stamp_unknown')}
    </p>
  )
}
