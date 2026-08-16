'use client'

import { useState } from 'react'
import { Calendar, Navigation } from 'lucide-react'
import { InitiateConversationButton } from '@/components/initiate-conversation-btn'
import { BookingWizard } from '@/components/booking-wizard'

export function ReserveSpaceBtn({ spaceName, ownerUserId, spaceId }: { spaceName: string; ownerUserId: string | null; spaceId?: string }) {
  const [open, setOpen] = useState(false)

  if (!spaceId) {
    return <InitiateConversationButton targetUserId={ownerUserId} targetName={spaceName} icon={Calendar} label="Reservar Espaço" emptyTargetMessage="Este espaço ainda não tem um contacto ativo para mensagens." selfTargetMessage="Você é o proprietário deste espaço desportivo." initialMessageBuilder={(name) => `Olá! Gostaria de fazer uma reserva no espaço desportivo "${name}". Podemos combinar os horários por aqui?`} errorMessage="Erro ao iniciar conversa para reserva." successMessage="Mensagem de pedido de reserva enviada! A redirecionar para a caixa de mensagens..." />
  }

  return <><button onClick={() => setOpen(true)} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 sm:w-auto"><Calendar className="h-4 w-4" />Reservar Espaço</button><BookingWizard open={open} onOpenChange={setOpen} spaceId={spaceId} /></>
}

export function ObterDirecoesBtn({ address, name, latitude, longitude }: { address: string | null; name: string; latitude?: number | null; longitude?: number | null }) {
  const handleDirections = () => {
    const url = latitude && longitude
      ? `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
      : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address ? `${address}, Portugal` : name)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return <button onClick={handleDirections} className="inline-flex h-11 w-auto items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:bg-muted"><Navigation className="h-4 w-4 text-primary" />Direções</button>
}
