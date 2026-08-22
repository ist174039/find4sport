export type SettlementStatus = 'not_applicable' | 'held' | 'eligible' | 'processing' | 'transferred' | 'blocked' | 'refunded'

export function canAcquireSettlementLock(status: SettlementStatus) {
  return status === 'eligible'
}

export function stateAfterStripeFailure(status: SettlementStatus) {
  return status === 'processing' ? 'eligible' as const : status
}

export function reconciliationState(status: SettlementStatus, transferExists: boolean) {
  if (status !== 'processing') return status
  return transferExists ? 'transferred' as const : 'eligible' as const
}

export function stateAfterDispute(status: SettlementStatus) {
  if (status === 'held' || status === 'eligible') return 'blocked' as const
  return status
}
