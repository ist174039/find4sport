'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getFollowersList, getFollowingList } from '@/app/actions/follow'
import { FollowButton } from '@/components/follow-button'
import Link from 'next/link'
import { BadgeCheck, Building2, Dumbbell, Loader2, UserRound, Users } from 'lucide-react'
import type { PlatformRole } from '@/lib/auth/roles'

interface FollowItem {
  userId: string
  type: PlatformRole
  name: string
  avatar: string | null
  isVerified: boolean | null
  href: string
  isFollowedByMe: boolean
}

interface FollowListModalProps {
  open: boolean
  onClose: () => void
  targetUserId: string
  mode: 'followers' | 'following'
  title?: string
}

function roleLabel(role: PlatformRole) {
  if (role === 'professional') return 'Profissional'
  if (role === 'venue_manager') return 'Espaço'
  return 'Utilizador'
}

export function FollowListModal({ open, onClose, targetUserId, mode, title }: FollowListModalProps) {
  const [items, setItems] = useState<FollowItem[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setLoading(true)
    setLoadError(false)
    const fn = mode === 'followers' ? getFollowersList : getFollowingList
    void fn(targetUserId)
      .then(res => {
        if (cancelled) return
        setItems((res.list || []) as FollowItem[])
        setCurrentUserId(res.currentUserId)
      })
      .catch(() => {
        if (cancelled) return
        setItems([])
        setCurrentUserId(null)
        setLoadError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [open, targetUserId, mode])

  const defaultTitle = mode === 'followers' ? 'Seguidores' : 'A Seguir'

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm sm:max-w-md w-full p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-base font-bold">{title || defaultTitle}</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : loadError ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <Users className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="text-sm font-semibold text-foreground mb-1">Não foi possível carregar</p>
              <p className="text-xs text-muted-foreground">Fecha e volta a abrir esta lista. Se o problema persistir, tenta novamente mais tarde.</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <Users className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="text-sm font-semibold text-foreground mb-1">
                {mode === 'followers' ? 'Sem seguidores' : 'Não segue ninguém'}
              </p>
              <p className="text-xs text-muted-foreground">
                {mode === 'followers' ? 'Ainda ninguém segue este perfil.' : 'Este perfil ainda não segue ninguém.'}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map(item => (
                <li key={item.userId} className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/40 transition-colors">
                  <Link href={item.href} onClick={onClose} className="flex items-center gap-3 min-w-0 flex-1 group">
                    <div className={`w-11 h-11 shrink-0 overflow-hidden border border-border bg-muted ${item.type === 'venue_manager' ? 'rounded-xl' : 'rounded-full'}`}>
                      {item.avatar ? (
                        <img src={item.avatar} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary font-bold text-sm">
                          {item.type === 'venue_manager' ? <Building2 className="w-5 h-5" /> : item.type === 'professional' ? <Dumbbell className="w-5 h-5" /> : <UserRound className="w-5 h-5" />}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">{item.name}</p>
                        {item.isVerified && <BadgeCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{roleLabel(item.type)}</p>
                    </div>
                  </Link>

                  {currentUserId && currentUserId !== item.userId && (
                    <div className="ml-3 shrink-0">
                      <FollowButton targetUserId={item.userId} initialIsFollowing={item.isFollowedByMe} variant="outline" />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
