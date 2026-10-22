'use client'

import { useEffect, useState } from 'react'
import { Calendar, Loader2, Navigation } from 'lucide-react'
import { BookingWizard } from '@/components/booking-wizard'
import { createClient } from '@/lib/supabase/client'

export function ReserveSpaceBtn({ spaceId }: { spaceId: string }) {
  const [open, setOpen] = useState(false)
  const [bookable, setBookable] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const supabase = createClient()
        const [{ data: rooms }, paymentResponse] = await Promise.all([
          supabase.from('space_rooms').select('id,price_per_hour,is_active').eq('space_id', spaceId).eq('is_active', true),
          fetch(`/api/spaces/${encodeURIComponent(spaceId)}/payment-capability`, { cache: 'no-store' }),
        ])
        if (cancelled) return
        const activeRooms = rooms || []
        const hasPaidRoom = activeRooms.some(room => Number(room.price_per_hour || 0) > 0)
        const paymentCapability = paymentResponse.ok ? await paymentResponse.json() : { enabled: false }
        setBookable(paymentCapability.active === true && activeRooms.length > 0 && (!hasPaidRoom || paymentCapability.enabled === true))
      } catch {
        if (!cancelled) setBookable(false)
      }
    })()
    return () => { cancelled = true }
  }, [spaceId])

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
