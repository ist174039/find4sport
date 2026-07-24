'use client';
import {  Check, UserPlus  } from 'lucide-react'
import { useModal } from '@/components/providers/modal-provider'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { joinCommunityAction } from '@/app/actions/community'

export function JoinCommunityBtn({ 
  communityId, 
  isPrivate, 
  initialJoined = false
}: { 
  communityId: string, 
  isPrivate: boolean,
  initialJoined?: boolean
}) {
  const { showAlert } = useModal()
  const [loading, setLoading] = useState(false)
  const [joined, setJoined] = useState(initialJoined)
  const router = useRouter()

  const handleJoin = async () => {
    setLoading(true)
    
    // Quick client-side check to redirect to login if not logged in
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      showAlert('Acesso Restrito', 'Por favor, faça login para se juntar à comunidade.', 'info')
      router.push(`/auth/login?redirect=/comunidades/${communityId}`)
      setLoading(false)
      return
    }

    try {
      await joinCommunityAction(communityId)
      
      setJoined(true)
      showAlert('Sucesso', 'Bem-vindo à comunidade!', 'success')
      router.refresh()
    } catch (error: any) {
      console.error(error)
      showAlert('Erro', `Ocorreu um erro ao tentar aderir: ${error.message || 'Erro desconhecido'}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  if (joined) {
    return (
      <button className="w-full sm:w-auto bg-muted text-muted-foreground font-bold px-8 py-3 rounded-xl flex items-center justify-center gap-2 cursor-default">
        <Check className="text-[20px]" />
        Membro
      </button>
    )
  }

  return (
    <button 
      onClick={handleJoin}
      disabled={loading}
      className="w-full sm:w-auto bg-primary text-primary-foreground font-bold px-8 py-3 rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-70"
    >
      <UserPlus className="text-[20px]" />
      {loading ? 'A processar...' : 'Juntar à Comunidade'}
    </button>
  )
}
