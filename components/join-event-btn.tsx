'use client'

import { useState } from 'react'
import { CalendarCheck, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { joinEventAction } from '@/app/actions/events'
import { useModal } from '@/components/providers/modal-provider'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

export function JoinEventBtn({ eventId, eventPrice = 0 }: { eventId: string; eventPrice?: number }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { showAlert } = useModal()

  const handleJoin = async () => {
    if (loading) return
    setLoading(true)
    try {
      if (eventPrice > 0) {
        const response = await fetch('/api/checkout_sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId, price: eventPrice }),
        })
        const payload = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(payload.error || 'payment_error')
        const stripe = await stripePromise
        if (!stripe) throw new Error('stripe_unavailable')
        const { error } = await (stripe as any).redirectToCheckout({ sessionId: payload.sessionId })
        if (error) throw error
        return
      }

      await joinEventAction(eventId)
      showAlert('Inscrição concluída', 'A tua participação no evento ficou confirmada e aparece na tua agenda.', 'success')
      router.refresh()
      router.push('/dashboard/agenda')
    } catch (error: any) {
      const code = String(error?.message || '')
      if (code === 'user_not_authenticated') {
        showAlert('Inicia sessão', 'Precisas de iniciar sessão para participar num evento.', 'info')
        router.push(`/auth/login?redirect=${encodeURIComponent(`/eventos/${eventId}`)}`)
      } else if (code === 'already_enrolled') {
        showAlert('Já estás inscrito', 'Este evento já faz parte da tua agenda.', 'info')
      } else if (code === 'event_full') {
        showAlert('Evento esgotado', 'A capacidade máxima deste evento já foi atingida.', 'info')
      } else if (code === 'event_finished' || code === 'event_not_available') {
        showAlert('Evento indisponível', 'Este evento já não aceita novas inscrições.', 'info')
      } else {
        showAlert('Não foi possível participar', code && !code.includes('_') ? code : 'Não foi possível concluir a inscrição. Tenta novamente.', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleJoin} disabled={loading} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-60">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarCheck className="h-4 w-4" />}
      {loading ? 'A processar...' : eventPrice > 0 ? `Participar · ${Number(eventPrice).toFixed(2)} €` : 'Participar'}
    </button>
  )
}
