'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { UserPlus, UserMinus, Loader2 } from 'lucide-react'

type FollowButtonProps = {
  professionalId: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  className?: string
}

export function FollowButton({ professionalId, variant = 'outline', size = 'sm', className }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function checkFollow() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data } = await supabase.from('favorites').select('id')
        .eq('user_id', user.id)
        .eq('professional_id', professionalId)
        .single()
      setIsFollowing(!!data)
      setLoading(false)
    }
    checkFollow()
  }, [professionalId])

  async function handleFollow() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    setActionLoading(true)
    if (isFollowing) {
      await supabase.from('favorites').delete()
        .eq('user_id', user.id)
        .eq('professional_id', professionalId)
      setIsFollowing(false)
    } else {
      await supabase.from('favorites').insert({
        user_id: user.id,
        professional_id: professionalId,
        item_type: 'professional',
      })
      setIsFollowing(true)
    }
    setActionLoading(false)
  }

  if (loading) return <Button variant={variant} size={size} disabled className={className}><Loader2 className="h-4 w-4 animate-spin" /></Button>

  return (
    <Button variant={isFollowing ? 'default' : variant} size={size} onClick={handleFollow} disabled={actionLoading} className={className}>
      {actionLoading ? (
        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <UserMinus className="mr-1 h-4 w-4" />
      ) : (
        <UserPlus className="mr-1 h-4 w-4" />
      )}
      {isFollowing ? 'A Seguir' : 'Seguir'}
    </Button>
  )
}
