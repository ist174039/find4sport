'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function JoinCommunityBtn({ communityId, isPrivate }: { communityId: string, isPrivate: boolean }) {
  const [loading, setLoading] = useState(false)
  const [joined, setJoined] = useState(false)
  const router = useRouter()

  const handleJoin = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      alert('Por favor, faça login para se juntar à comunidade.')
      router.push(`/auth/login?redirect=/comunidades/${communityId}`)
      return
    }

    // Insert into community_members
    const { error } = await supabase.from('community_members').insert({
      community_id: communityId,
      user_id: user.id,
      role: 'member',
      status: isPrivate ? 'pending' : 'approved'
    })

    setLoading(false)
    if (!error || error.code === '23505') { // 23505 is unique violation, means already joined
      setJoined(true)
      if (isPrivate) {
        alert('Pedido de adesão enviado! Aguarde a aprovação dos moderadores.')
      } else {
        alert('Bem-vindo à comunidade!')
        router.refresh()
      }
    } else {
      console.error(error)
      alert('Ocorreu um erro ao tentar aderir.')
    }
  }

  if (joined) {
    return (
      <button className="w-full sm:w-auto bg-muted text-muted-foreground font-bold px-8 py-3 rounded-xl flex items-center justify-center gap-2 cursor-default">
        <span className="material-symbols-outlined text-[20px]">check</span>
        {isPrivate ? 'Pedido Pendente' : 'Membro'}
      </button>
    )
  }

  return (
    <button 
      onClick={handleJoin}
      disabled={loading}
      className="w-full sm:w-auto bg-primary text-primary-foreground font-bold px-8 py-3 rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-70"
    >
      <span className="material-symbols-outlined text-[20px]">group_add</span>
      {loading ? 'A processar...' : 'Juntar à Comunidade'}
    </button>
  )
}
