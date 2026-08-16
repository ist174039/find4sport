'use client'

import { Clock3, LogOut, UserPlus } from 'lucide-react'
import { useModal } from '@/components/providers/modal-provider'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { joinCommunityAction, leaveCommunityAction } from '@/app/actions/community'

export function JoinCommunityBtn({
  communityId,
  isPrivate,
  initialJoined = false,
  initialPending = false,
}: {
  communityId: string
  isPrivate: boolean
  initialJoined?: boolean
  initialPending?: boolean
}) {
  const { showAlert, showConfirm } = useModal()
  const [loading, setLoading] = useState(false)
  const [state, setState] = useState<'idle' | 'member' | 'pending'>(initialJoined ? 'member' : initialPending ? 'pending' : 'idle')
  const router = useRouter()

  const handleJoin = async () => {
    if (loading || state !== 'idle') return
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      showAlert('Acesso restrito', 'Inicia sessão para aderir à comunidade.', 'info')
      router.push(`/auth/login?redirect=/comunidades/${communityId}`)
      setLoading(false)
      return
    }

    try {
      const result = await joinCommunityAction(communityId)
      setState(result.status === 'pending' ? 'pending' : 'member')
      showAlert(result.status === 'pending' ? 'Pedido enviado' : 'Bem-vindo', result.message || (result.status === 'pending' ? 'O pedido aguarda aprovação.' : 'Já fazes parte da comunidade.'), 'success')
      router.refresh()
    } catch (error: any) {
      showAlert('Erro', error?.message || 'Não foi possível processar a adesão.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleLeave = async () => {
    if (loading || state !== 'member') return
    const confirmed = await showConfirm('Sair da comunidade?', 'Deixarás de ver conteúdo privado e de publicar nesta comunidade.', 'Sair')
    if (!confirmed) return
    setLoading(true)
    try {
      await leaveCommunityAction(communityId)
      setState('idle')
      showAlert('Saíste da comunidade', 'Podes voltar a aderir quando quiseres.', 'success')
      router.refresh()
    } catch (error: any) {
      showAlert('Não foi possível sair', error?.message || 'Tenta novamente.', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (state === 'member') {
    return <button onClick={handleLeave} disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-background px-5 py-3 font-bold text-destructive transition hover:bg-destructive/10 disabled:opacity-60 sm:w-auto"><LogOut className="h-5 w-5" />{loading ? 'A sair...' : 'Sair'}</button>
  }

  if (state === 'pending') {
    return <button disabled className="flex w-full cursor-default items-center justify-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-5 py-3 font-bold text-amber-700 sm:w-auto"><Clock3 className="h-5 w-5" />Pedido pendente</button>
  }

  return <button onClick={handleJoin} disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:opacity-70 sm:w-auto"><UserPlus className="h-5 w-5" />{loading ? 'A processar...' : isPrivate ? 'Pedir adesão' : 'Entrar'}</button>
}
