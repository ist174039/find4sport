'use client'

import { useState } from 'react'
import { Calendar, Navigation } from 'lucide-react'
import { InitiateConversationButton } from '@/components/initiate-conversation-btn'
import { BookingWizard } from '@/components/booking-wizard'

export function ReserveSpaceBtn({ 
  spaceName, 
  ownerUserId,
  spaceId
}: { 
  spaceName: string
  ownerUserId: string | null 
  spaceId?: string
}) {
  const [open, setOpen] = useState(false)

  if (!spaceId) {
    return (
      <InitiateConversationButton
        targetUserId={ownerUserId}
        targetName={spaceName}
        icon={Calendar}
        label="Reservar Espaço"
        emptyTargetMessage="Este espaço ainda não tem um contacto ativo para mensagens."
        selfTargetMessage="Você é o proprietário deste espaço desportivo."
        initialMessageBuilder={(name) => `Olá! Gostaria de fazer uma reserva no espaço desportivo "${name}". Podemos combinar os horários por aqui?`}
        errorMessage="Erro ao iniciar conversa para reserva."
        successMessage="Mensagem de pedido de reserva enviada! A redirecionar para a caixa de mensagens..."
      />
    )
  }

  return (
    <>
      <button 
        onClick={() => setOpen(true)}
        className="w-full md:w-auto h-10 px-4 py-2 bg-primary text-primary-foreground font-bold rounded-xl text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <Calendar className="text-[18px]" />
        Reservar Espaço
      </button>

      <BookingWizard
        open={open}
        onOpenChange={setOpen}
        spaceId={spaceId}
      />
    </>
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
