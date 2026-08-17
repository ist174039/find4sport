'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Euro, HandCoins, CalendarCheck, Loader2 } from 'lucide-react'
import { BookingWizard } from '@/components/booking-wizard'
import { ServicePackageOffers, type PublicServicePackage } from '@/components/service-package-offers'
import { createClient } from '@/lib/supabase/client'
import type { Service } from '@/lib/types'

interface ProfessionalServicesProps { services: Service[]; professionalId: string }
type PaymentCapability = { stripe_account_id: string | null; status: string | null }
function plausibleStripeAccountId(value: unknown) { return /^acct_[A-Za-z0-9]{16,}$/.test(String(value || '')) }

export function ProfessionalServices({ services, professionalId }: ProfessionalServicesProps) {
  const [wizardOpen, setWizardOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [packages, setPackages] = useState<PublicServicePackage[]>([])
  const [paymentsEnabled, setPaymentsEnabled] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()
    void Promise.all([
      fetch(`/api/professionals/${encodeURIComponent(professionalId)}/packages`, { cache: 'no-store' })
        .then(response => response.ok ? response.json() : { packages: [] })
        .catch(() => ({ packages: [] })),
      supabase.from('professionals').select('stripe_account_id,status').eq('id', professionalId).maybeSingle(),
    ]).then(([packagePayload, professionalResult]) => {
      if (cancelled) return
      setPackages(Array.isArray(packagePayload.packages) ? packagePayload.packages : [])
      const professional = professionalResult.data as PaymentCapability | null
      setPaymentsEnabled(professional?.status === 'active' && plausibleStripeAccountId(professional?.stripe_account_id))
    }).catch(() => {
      if (!cancelled) { setPackages([]); setPaymentsEnabled(false) }
    })
    return () => { cancelled = true }
  }, [professionalId])

  const handleBook = (service: Service) => { setSelectedService(service); setWizardOpen(true) }
  if ((!services || services.length === 0) && packages.length === 0) return null

  return (
    <div className="space-y-4">
      {services?.length > 0 && <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6 md:p-8">
        <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold text-foreground md:text-2xl"><HandCoins className="h-5 w-5 text-primary" />Serviços e preços</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {services.map(service => { const paid = Number(service.price || 0) > 0; const unavailable = paid && paymentsEnabled !== true; return <Card key={service.id} className="border-border shadow-sm transition-colors hover:border-primary/50">
            <CardHeader className="pb-2"><CardTitle className="text-lg">{service.name}</CardTitle>{service.description && <CardDescription className="line-clamp-2">{service.description}</CardDescription>}</CardHeader>
            <CardContent><div className="flex flex-col gap-4"><div className="flex flex-wrap items-center gap-4 text-sm">{service.duration_minutes && <div className="flex items-center gap-1 text-muted-foreground"><Clock className="h-4 w-4" />{service.duration_minutes} min</div>}{service.price !== null && <div className="flex items-center gap-1 font-bold text-primary"><Euro className="h-4 w-4" />{Number(service.price).toFixed(2)} / {service.price_unit || 'sessão'}</div>}</div>{unavailable && paymentsEnabled !== null && <p className="text-xs text-muted-foreground">Reserva paga temporariamente indisponível enquanto o profissional configura os pagamentos.</p>}<Button onClick={() => handleBook(service)} disabled={unavailable} className="min-h-11 w-full gap-2 rounded-xl font-bold">{paid && paymentsEnabled === null ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarCheck className="h-4 w-4" />}{unavailable ? (paymentsEnabled === null ? 'A verificar…' : 'Indisponível') : 'Reservar'}</Button></div></CardContent>
          </Card> })}
        </div>
      </section>}
      <ServicePackageOffers packages={packages} paymentsEnabled={paymentsEnabled === true} />
      <BookingWizard open={wizardOpen} onOpenChange={setWizardOpen} service={selectedService} professionalId={professionalId} />
    </div>
  )
}
