'use client'

import { useEffect, useState } from 'react'
import { Calendar, Loader2, Navigation } from 'lucide-react'
import { InitiateConversationButton } from '@/components/initiate-conversation-btn'
import { BookingWizard } from '@/components/booking-wizard'
import { createClient } from '@/lib/supabase/client'

export function ReserveSpaceBtn({ spaceName, ownerUserId, spaceId }: { spaceName: string; ownerUserId: string | null; spaceId?: string }) {
  const [open, setOpen] = useState(false)
  const [bookable, setBookable] = useState<boolean | null>(spaceId ? null : Boolean(ownerUserId))

  useEffect(() => {
    if (!spaceId) return
    if (!ownerUserId) {
      setBookable(false)
      return
    }

    let cancelled = false
    void (async () => {
      const supabase = createClient()
      const [{ data: space }, { data: rooms }] = await Promise.all([
        supabase.from('sport_spaces').select('stripe_account_id,status').eq('id', spaceId).maybeSingle(),
        supabase.from('space_rooms').select('id,price_per_hour,is_active').eq('space_id', spaceId).eq('is_active', true),
      ])
      if (cancelled) return
      const activeRooms = rooms || []
      const hasPaidRoom = activeRooms.some((room: any) => Number(room.price_per_hour || 0) > 0)
      const canCharge = String((space as any)?.stripe_account_id || '').startsWith('acct_')
      setBookable((space as any)?.status === 'active' && activeRooms.length > 0 && (!hasPaidRoom || canCharge))
    })()
    return () => { cancelled = true }
  }, [ownerUserId, spaceId])

  if (!spaceId) {
    return <InitiateConversationButton targetUserId={ownerUserId} targetName={spaceName} icon={Calendar} label="Reservar Espaço" emptyTargetMessage="Este espaço ainda não tem um contacto ativo para mensagens." selfTargetMessage="Você é o proprietário deste espaço desportivo." initialMessageBuilder={(name) => `Olá! Gostaria de fazer uma reserva no espaço desportivo "${name}". Podemos combinar os horários por aqui?`} errorMessage="Erro ao iniciar conversa para reserva." successMessage="Mensagem de pedido de reserva enviada! A redirecionar para a caixa de mensagens..." />
  }

  if (bookable === null) {
    return <button type="button" disabled className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-muted px-4 text-sm font-semibold text-muted-foreground sm:w-auto"><Loader2 className="h-4 w-4 animate-spin" />A verificar reservas…</button>
  }

  if (!bookable) {
    return <button type="button" disabled title="Este espaço ainda não tem configuração completa para reservas online." className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-muted px-4 text-sm font-semibold text-muted-foreground opacity-80 sm:w-auto"><Calendar className="h-4 w-4" />Reservas online indisponíveis</button>
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
