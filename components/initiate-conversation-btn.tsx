'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, type LucideIcon } from 'lucide-react'
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

export function InitiateConversationButton({ targetUserId, targetName, icon: Icon, label, emptyTargetMessage, selfTargetMessage, initialMessageBuilder, errorMessage, successMessage }: InitiateConversationButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { showAlert } = useModal()

  const handleStartConversation = async () => {
    if (loading) return
    if (!targetUserId) {
      showAlert('Aviso', emptyTargetMessage, 'info')
      return
    }

    setLoading(true)
    try {
      await sendMessage(targetUserId, initialMessageBuilder(targetName))
      showAlert('Mensagem enviada', successMessage, 'success')
      router.push('/dashboard/mensagens')
    } catch (error) {
      const message = error instanceof Error ? error.message : errorMessage
      if (message === 'Não autenticado') {
        router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`)
        return
      }
      if (message === 'Destinatário inválido') {
        showAlert('Aviso', selfTargetMessage, 'info')
        return
      }
      showAlert('Erro', message || errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  return <Button onClick={handleStartConversation} disabled={loading} className="min-h-11 w-full rounded-xl px-5 font-semibold shadow-sm sm:w-auto">
    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Icon className="mr-2 h-4 w-4" />}
    {label}
  </Button>
}
