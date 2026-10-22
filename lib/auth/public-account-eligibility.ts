export function isPublicAccountEligible(
  accountStatus: string | null | undefined,
  suspendedUntil: string | null | undefined,
  now = Date.now(),
) {
  if (accountStatus === 'active') return true
  if (accountStatus !== 'suspended' || !suspendedUntil) return false

  const expiration = Date.parse(suspendedUntil)
  return Number.isFinite(expiration) && expiration <= now
}

export function isPublicProfessionalEligible(
  professionalStatus: string | null | undefined,
  accountStatus: string | null | undefined,
  suspendedUntil: string | null | undefined,
  now = Date.now(),
) {
  return professionalStatus === 'active' && isPublicAccountEligible(accountStatus, suspendedUntil, now)
}
