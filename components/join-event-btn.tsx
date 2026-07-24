'use client'

import { useState } from 'react'
import { Calendar, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { joinEventAction } from '@/app/actions/events'
import { useModal } from '@/components/providers/modal-provider'

export function JoinEventBtn({ eventId }: { eventId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { showAlert } = useModal()

  const handleJoin = async () => {
    setLoading(true)
    try {
      await joinEventAction(eventId)
      showAlert('Sucesso', 'Foste adicionado ao evento com sucesso!', 'success')
      router.push('/dashboard/eventos')
    } catch (error: any) {
      const msg = error.message
      if (msg === 'user_not_authenticated') {
        showAlert('Acesso Restrito', 'Por favor, faz login para participares num evento.', 'info')
        router.push('/auth/login')
      } else if (msg === 'already_enrolled') {
        showAlert('Aviso', 'Já estás inscrito neste evento.', 'info')
      } else {
        showAlert('Erro', 'Ocorreu um erro ao tentar participar no evento.', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleJoin}
      disabled={loading}
      className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-base shadow-md hover:shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
    >
      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Calendar className="h-5 w-5" />}
      {loading ? 'A processar...' : 'Adicionar ao Calendário'}
    </button>
  )
}
