'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Navigation, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { sendMessage } from '@/app/actions/messages'
import { useModal } from '@/components/providers/modal-provider'

export function ReserveSpaceBtn({ 
  spaceName, 
  ownerUserId 
}: { 
  spaceName: string
  ownerUserId: string | null 
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { showAlert } = useModal()

  const handleReserve = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`)
        return
      }

      if (!ownerUserId) {
        showAlert('Aviso', 'Este espaço ainda não tem um contacto ativo para mensagens.', 'info')
        return
      }

      if (ownerUserId === user.id) {
        showAlert('Aviso', 'Você é o proprietário deste espaço desportivo.', 'info')
        return
      }

      // Send initial reservation request message
      const initialMessage = `Olá! Gostaria de fazer uma reserva no espaço desportivo "${spaceName}". Podemos combinar os horários por aqui?`
      await sendMessage(ownerUserId, initialMessage)

      showAlert('Sucesso', 'Mensagem de pedido de reserva enviada! A redirecionar para a caixa de mensagens...', 'success')
      router.push('/dashboard/mensagens')
    } catch (err: any) {
      console.error(err)
      showAlert('Erro', err.message || 'Erro ao iniciar conversa para reserva.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleReserve}
      disabled={loading}
      className="w-full sm:w-auto bg-primary text-primary-foreground font-bold px-8 py-3 rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
    >
      {loading ? <Loader2 className="text-[20px] animate-spin" /> : <Calendar className="text-[20px]" />}
      Reservar Espaço
    </button>
  )
}

export function ObterDirecoesBtn({ 
  address, 
  name, 
  latitude, 
  longitude 
}: { 
  address: string | null
  name: string
  latitude?: number | null
  longitude?: number | null
}) {
  const handleDirections = () => {
    let url = ''
    if (latitude && longitude) {
      url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
    } else {
      const targetQuery = address ? `${address}, Portugal` : name
      url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(targetQuery)}`
    }
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <button 
      onClick={handleDirections}
      className="w-full py-2.5 border border-primary text-primary font-bold rounded-xl text-sm hover:bg-primary/5 transition-all flex items-center justify-center gap-2 cursor-pointer"
    >
      <Navigation className="text-[18px]" />
      Obter Direções
    </button>
  )
}
