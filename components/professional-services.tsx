'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Euro, HandCoins, CalendarCheck } from 'lucide-react'
import { BookingWizard } from '@/components/booking-wizard'
import type { Service } from '@/lib/types'

interface ProfessionalServicesProps {
  services: Service[]
  professionalId: string
}

export function ProfessionalServices({ services, professionalId }: ProfessionalServicesProps) {
  const [wizardOpen, setWizardOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)

  const handleBook = (service: Service) => {
    setSelectedService(service)
    setWizardOpen(true)
  }

  if (!services || services.length === 0) {
    return null
  }

  return (
    <section className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm">
      <h2 className="font-semibold text-xl md:text-2xl mb-6 text-foreground flex items-center gap-2">
        <HandCoins className="text-primary h-5 w-5" />
        Serviços e Preços
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {services.map((service) => (
          <Card key={service.id} className="border-border shadow-sm hover:border-primary/50 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{service.name}</CardTitle>
              {service.description && (
                <CardDescription className="line-clamp-2">{service.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4 text-sm">
                  {service.duration_minutes && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {service.duration_minutes} min
                    </div>
                  )}
                  {service.price !== null && (
                    <div className="flex items-center gap-1 font-bold text-primary">
                      <Euro className="h-4 w-4" />
                      {service.price.toFixed(2)} / {service.price_unit || 'sessao'}
                    </div>
                  )}
                </div>
                
                <Button 
                  onClick={() => handleBook(service)} 
                  className="w-full gap-2 font-bold bg-primary hover:bg-primary/90 text-primary-foreground transition-all"
                >
                  <CalendarCheck className="h-4 w-4" />
                  Reservar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <BookingWizard 
        open={wizardOpen} 
        onOpenChange={setWizardOpen}
        service={selectedService}
        professionalId={professionalId}
      />
    </section>
  )
}
