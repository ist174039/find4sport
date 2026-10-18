import type { User } from '@supabase/supabase-js'

/**
 * Account lifecycle flags affect access, so they must come from server-managed
 * app_metadata. user_metadata is editable by the account owner.
 */
export function getAccountStatus(user: Pick<User, 'app_metadata'>): string {
  return typeof user.app_metadata?.account_status === 'string'
    ? user.app_metadata.account_status
    : ''
}

export function isAccountUnavailable(user: Pick<User, 'app_metadata'>): boolean {
  const status = getAccountStatus(user)
  return status === 'deactivated' || status === 'deletion_requested'
}
