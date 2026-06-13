import type { StringId } from '../i18n/dictionary'
import type { AccountWorkspaceApiError } from './api'

export function accountWorkspaceErrorMessage(
  t: (key: StringId) => string,
  error: AccountWorkspaceApiError,
): string {
  switch (error) {
    case 'auth_required':
    case 'invalid_token':
      return t('sr_notice_account_sync_auth_failed')
    case 'project_mismatch':
      return t('sr_notice_account_sync_project_mismatch')
    case 'too_large':
      return t('sr_notice_account_sync_too_large')
    case 'sync_unavailable':
    case 'storage_unavailable':
      return t('sr_notice_account_sync_storage_failed')
    case 'invalid_payload':
      return t('sr_notice_account_sync_load_failed')
    case 'network':
      return t('sr_notice_account_sync_network_failed')
    default:
      return t('sr_notice_account_sync_failed')
  }
}
