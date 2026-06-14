import type { ReactNode } from 'react'
import { APP_VERSION, CHANGELOG_URL, DISCORD_URL } from '../appVersion'
import { BuyMeACoffeeButton } from './BuyMeACoffeeButton'
import { useI18n } from '../i18n'

type SiteFooterProps = {
  bugBuster?: ReactNode
}

export function SiteFooter({ bugBuster }: SiteFooterProps) {
  const { t, fmt } = useI18n()

  return (
    <footer className="select-research__site-footer">
      <nav
        className="select-research__version-badge"
        aria-label={t('sr_footer_nav_aria')}
      >
        <div className="select-research__footer-top-row">
          <a
            className="select-research__version-label"
            href={CHANGELOG_URL}
            target="_blank"
            rel="noopener noreferrer"
            title={t('sr_changelog_title')}
            aria-label={`${fmt.versionAria(APP_VERSION)} — ${t('sr_changelog_title')}`}
          >
            v{APP_VERSION}
          </a>
          <div className="select-research__footer-legal">
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              title={t('sr_footer_discord_title')}
            >
              {t('sr_footer_discord')}
            </a>
            <span aria-hidden="true">·</span>
            <a href="/privacy">{t('sr_footer_privacy')}</a>
            <span aria-hidden="true">·</span>
            <a href="/terms">{t('sr_footer_terms')}</a>
            {bugBuster ? (
              <>
                <span aria-hidden="true">·</span>
                {bugBuster}
              </>
            ) : null}
          </div>
        </div>
        <BuyMeACoffeeButton className="select-research__bmc-button" />
      </nav>
    </footer>
  )
}
