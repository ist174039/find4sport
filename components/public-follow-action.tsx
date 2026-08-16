'use client'

import Link from 'next/link'
import { FollowButton } from '@/components/follow-button'

export function PublicFollowAction({
  targetUserId,
  currentUserId,
  initialIsFollowing,
  loginRedirect,
  className = '',
}: {
  targetUserId: string | null | undefined
  currentUserId?: string | null
  initialIsFollowing?: boolean
  loginRedirect: string
  className?: string
}) {
  if (!targetUserId) {
    return <button type="button" disabled className={`min-h-11 rounded-xl border border-border px-4 text-sm font-semibold text-muted-foreground opacity-60 ${className}`}>Seguir</button>
  }

  if (!currentUserId) {
    return <Link href={`/auth/login?redirect=${encodeURIComponent(loginRedirect)}`} className={`inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground hover:bg-primary/90 ${className}`}>Seguir</Link>
  }

  if (currentUserId === targetUserId) {
    return null
  }

  return <FollowButton targetUserId={targetUserId} initialIsFollowing={Boolean(initialIsFollowing)} className={`min-h-11 rounded-xl px-4 ${className}`} />
}
