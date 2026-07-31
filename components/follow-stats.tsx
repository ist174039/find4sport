'use client'

import { useState } from 'react'
import { FollowListModal } from '@/components/follow-list-modal'

interface FollowStatsProps {
  targetUserId: string
  followersCount: number
  followingCount: number
  variant?: 'dark' | 'light'
}

export function FollowStats({ targetUserId, followersCount, followingCount, variant = 'dark' }: FollowStatsProps) {
  const [modal, setModal] = useState<'followers' | 'following' | null>(null)

  const textBase = variant === 'dark' ? 'text-white/80' : 'text-muted-foreground'
  const textBold = variant === 'dark' ? 'text-white font-bold drop-shadow' : 'font-bold text-foreground'
  const divider = variant === 'dark' ? 'bg-white/30' : 'bg-border'

  return (
    <>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setModal('followers')}
          className="flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <span className={textBold}>{followersCount}</span>
          <span className={`text-sm ${textBase}`}>Seguidores</span>
        </button>
        <div className={`h-4 w-px ${divider} hidden sm:block`}></div>
        <button
          onClick={() => setModal('following')}
          className="flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <span className={textBold}>{followingCount}</span>
          <span className={`text-sm ${textBase}`}>A Seguir</span>
        </button>
      </div>

      <FollowListModal
        open={modal === 'followers'}
        onClose={() => setModal(null)}
        targetUserId={targetUserId}
        mode="followers"
      />
      <FollowListModal
        open={modal === 'following'}
        onClose={() => setModal(null)}
        targetUserId={targetUserId}
        mode="following"
      />
    </>
  )
}
