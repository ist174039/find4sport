'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageSquare, CalendarCheck, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { sendMessage } from '@/app/actions/messages'
import { useModal } from '@/components/providers/modal-provider'

export function ContactarProfissionalBtn({ 
  profName, 
  userId 
}: { 
  profName: string
  userId: string | null 
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { showAlert } = useModal()

  const handleContact = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`)
        return
      }

      if (!userId) {
        showAlert('Aviso', 'Este profissional ainda não ativou a caixa de mensagens.', 'info')
        return
      }

      if (userId === user.id) {
        showAlert('Aviso', 'Este é o seu próprio perfil de profissional.', 'info')
        return
      }

      // Send initial inquiry message
      const initialMessage = `Olá ${profName}! Gostaria de saber mais informações sobre os seus serviços de treino/consulta.`
      await sendMessage(userId, initialMessage)

      showAlert('Sucesso', 'Mensagem enviada com sucesso! A redirecionar para a caixa de mensagens...', 'success')
      router.push('/dashboard/mensagens')
    } catch (err: any) {
      console.error(err)
      showAlert('Erro', err.message || 'Erro ao enviar mensagem ao profissional.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleContact}
      disabled={loading}
      className="w-full sm:w-auto bg-primary text-primary-foreground font-bold px-8 py-3 rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
    >
      {loading ? <Loader2 className="text-[20px] animate-spin" /> : <MessageSquare className="text-[20px]" />}
      Enviar Mensagem / Marcar Sessão
    </button>
  )
}
