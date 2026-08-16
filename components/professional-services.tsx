'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Euro, HandCoins, CalendarCheck } from 'lucide-react'
import { BookingWizard } from '@/components/booking-wizard'
import { ServicePackageOffers, type PublicServicePackage } from '@/components/service-package-offers'
import type { Service } from '@/lib/types'

interface ProfessionalServicesProps { services: Service[]; professionalId: string }

export function ProfessionalServices({ services, professionalId }: ProfessionalServicesProps) {
  const [wizardOpen, setWizardOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [packages, setPackages] = useState<PublicServicePackage[]>([])

  useEffect(() => {
    let cancelled = false
    void fetch(`/api/professionals/${encodeURIComponent(professionalId)}/packages`, { cache: 'no-store' })
      .then(response => response.ok ? response.json() : { packages: [] })
      .then(payload => { if (!cancelled) setPackages(Array.isArray(payload.packages) ? payload.packages : []) })
      .catch(() => { if (!cancelled) setPackages([]) })
    return () => { cancelled = true }
  }, [professionalId])

  const handleBook = (service: Service) => { setSelectedService(service); setWizardOpen(true) }
  if ((!services || services.length === 0) && packages.length === 0) return null

  return (
    <div className="space-y-4">
      {services?.length > 0 && <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6 md:p-8">
        <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold text-foreground md:text-2xl"><HandCoins className="h-5 w-5 text-primary" />Serviços e preços</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {services.map(service => <Card key={service.id} className="border-border shadow-sm transition-colors hover:border-primary/50">
            <CardHeader className="pb-2"><CardTitle className="text-lg">{service.name}</CardTitle>{service.description&&<CardDescription className="line-clamp-2">{service.description}</CardDescription>}</CardHeader>
            <CardContent><div className="flex flex-col gap-4"><div className="flex flex-wrap items-center gap-4 text-sm">{service.duration_minutes&&<div className="flex items-center gap-1 text-muted-foreground"><Clock className="h-4 w-4"/>{service.duration_minutes} min</div>}{service.price!==null&&<div className="flex items-center gap-1 font-bold text-primary"><Euro className="h-4 w-4"/>{Number(service.price).toFixed(2)} / {service.price_unit||'sessão'}</div>}</div><Button onClick={()=>handleBook(service)} className="min-h-11 w-full gap-2 rounded-xl font-bold"><CalendarCheck className="h-4 w-4"/>Reservar</Button></div></CardContent>
          </Card>)}
        </div>
      </section>}
      <ServicePackageOffers packages={packages}/>
      <BookingWizard open={wizardOpen} onOpenChange={setWizardOpen} service={selectedService} professionalId={professionalId}/>
    </div>
  )
}
