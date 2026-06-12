import { useI18n } from '../i18n'

type VaultPageProps = {
  embeddedInPanel?: boolean
}

export function VaultPage({ embeddedInPanel = false }: VaultPageProps) {
  const { t } = useI18n()

  return (
    <div
      className={embeddedInPanel ? 'workshop workshop--embedded' : 'workshop'}
      aria-label={t('app_nav_vault')}
    >
      <section className="vault-page" aria-labelledby="vault-page-heading">
        <h2 id="vault-page-heading" className="vault-page__heading">
          {t('app_nav_vault')}
        </h2>
        <p className="vault-page__placeholder">{t('vault_placeholder')}</p>
      </section>
    </div>
  )
}
