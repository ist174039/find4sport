'use client'

import Link from 'next/link'
import { FollowButton } from '@/components/follow-button'

export function PublicFollowAction({
  spaceId,
  hasEligibleOwner,
  isOwnSpace,
  isAuthenticated,
  initialIsFollowing,
  loginRedirect,
  className = '',
}: {
  spaceId: string
  hasEligibleOwner: boolean
  isOwnSpace: boolean
  isAuthenticated: boolean
  initialIsFollowing?: boolean
  loginRedirect: string
  className?: string
}) {
  if (!hasEligibleOwner) {
    return <button type="button" disabled className={`min-h-11 rounded-xl border border-border px-4 text-sm font-semibold text-muted-foreground opacity-60 ${className}`}>Seguir</button>
  }

  if (!isAuthenticated) {
    return <Link href={`/auth/login?redirect=${encodeURIComponent(loginRedirect)}`} className={`inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground hover:bg-primary/90 ${className}`}>Seguir</Link>
  }

  if (isOwnSpace) {
    return null
  }

  return <FollowButton targetSpaceId={spaceId} initialIsFollowing={Boolean(initialIsFollowing)} className={`min-h-11 rounded-xl px-4 ${className}`} />
}
