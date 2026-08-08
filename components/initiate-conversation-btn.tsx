'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, type LucideIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { sendMessage } from '@/app/actions/messages'
import { useModal } from '@/components/providers/modal-provider'
import { Button } from '@/components/ui/button'

type InitiateConversationButtonProps = {
  targetUserId: string | null
  targetName: string
  icon: LucideIcon
  label: string
  emptyTargetMessage: string
  selfTargetMessage: string
  initialMessageBuilder: (targetName: string) => string
  errorMessage: string
  successMessage: string
}

export function InitiateConversationButton({
  targetUserId,
  targetName,
  icon: Icon,
  label,
  emptyTargetMessage,
  selfTargetMessage,
  initialMessageBuilder,
  errorMessage,
  successMessage,
}: InitiateConversationButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { showAlert } = useModal()

  const handleStartConversation = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`)
        return
      }

      if (!targetUserId) {
        showAlert('Aviso', emptyTargetMessage, 'info')
        return
      }

      if (targetUserId === user.id) {
        showAlert('Aviso', selfTargetMessage, 'info')
        return
      }

      await sendMessage(targetUserId, initialMessageBuilder(targetName))
      showAlert('Sucesso', successMessage, 'success')
      router.push('/dashboard/mensagens')
    } catch (err: any) {
      console.error(err)
      showAlert('Erro', err?.message || errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleStartConversation}
      disabled={loading}
      className="w-full sm:w-auto font-bold px-8 py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm"
    >
      {loading ? <Loader2 className="text-[20px] animate-spin" /> : <Icon className="text-[20px]" />}
      {label}
    </Button>
  )
}
