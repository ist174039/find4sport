'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { ReportModal } from '@/components/report-modal'
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Heart,
  Share2,
  ExternalLink,
  ArrowLeft,
  Navigation,
  Ticket,
  Flag,
} from 'lucide-react'
import { format } from 'date-fns'
import { pt } from 'date-fns/locale'
import type { Event, Category, SportSpace, Professional } from '@/lib/types'

interface EventWithDetails extends Event {
  category: Category | null
  space: SportSpace | null
  professional: Professional | null
}

export default function EventDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [event, setEvent] = useState<EventWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorited, setIsFavorited] = useState(false)

  useEffect(() => {
    async function fetchEvent() {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          category:categories(*),
          space:sport_spaces(*),
          professional:professionals(*)
        `)
        .eq('slug', slug)
        .eq('status', 'approved')
        .single()

      if (error) {
        console.error('Error fetching event:', error)
        setLoading(false)
        return
      }

      setEvent(data as EventWithDetails)
      setLoading(false)
    }

    if (slug) {
      fetchEvent()
    }
  }, [slug])

  const handleFavorite = async () => {
    setIsFavorited(!isFavorited)
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: event?.title,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const getDirectionsUrl = () => {
    if (event?.latitude && event?.longitude) {
      return `https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`
    }
    if (event?.address) {
      return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(event.address)}`
    }
    return null
  }

  const formatPrice = () => {
    if (!event) return null
    if (event.price_min === 0 && (!event.price_max || event.price_max === 0)) {
      return 'Gratuito'
    }
    if (event.price_min && event.price_max && event.price_min !== event.price_max) {
      return `${event.price_min.toFixed(2)}€ - ${event.price_max.toFixed(2)}€`
    }
    if (event.price_min) {
      return `${event.price_min.toFixed(2)}€`
    }
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-32 mb-6" />
            <Skeleton className="h-64 w-full rounded-xl mb-6" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center py-16">
            <h1 className="text-2xl font-bold mb-4">Evento nao encontrado</h1>
            <p className="text-muted-foreground mb-6">
              O evento que procura nao existe ou foi removido.
            </p>
            <Button asChild>
              <Link href="/eventos">Ver todos os eventos</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const startDate = new Date(event.start_date)
  const endDate = event.end_date ? new Date(event.end_date) : null
  const isPast = startDate < new Date()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto">
            <Link
              href="/eventos"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar aos eventos
            </Link>

            {event.image_url && (
              <div className="rounded-xl overflow-hidden mb-6 aspect-video bg-muted">
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {event.category && (
                            <Badge variant="secondary">
                              {event.category.emoji} {event.category.name}
                            </Badge>
                          )}
                          {event.is_featured && (
                            <Badge variant="default">Destaque</Badge>
                          )}
                          {isPast && (
                            <Badge variant="outline" className="text-muted-foreground">
                              Evento passado
                            </Badge>
                          )}
                        </div>
                        <h1 className="text-2xl font-bold">{event.title}</h1>
                        {event.address && (
                          <p className="text-muted-foreground flex items-center gap-1 mt-2">
                            <MapPin className="h-4 w-4" />
                            {event.address}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleFavorite}
                          className={isFavorited ? 'text-red-500' : ''}
                        >
                          <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
                        </Button>
                        <Button variant="outline" size="icon" onClick={handleShare}>
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <ReportModal eventId={event.id}>
                          <Button variant="outline" size="icon">
                            <Flag className="h-4 w-4" />
                          </Button>
                        </ReportModal>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <Calendar className="h-5 w-5 mx-auto mb-1 text-primary" />
                        <p className="text-sm font-medium">
                          {format(startDate, 'd MMM', { locale: pt })}
                        </p>
                        <p className="text-xs text-muted-foreground">Data</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <Clock className="h-5 w-5 mx-auto mb-1 text-primary" />
                        <p className="text-sm font-medium">
                          {format(startDate, 'HH:mm', { locale: pt })}
                        </p>
                        <p className="text-xs text-muted-foreground">Hora</p>
                      </div>
                      {event.capacity && (
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                          <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
                          <p className="text-sm font-medium">{event.capacity}</p>
                          <p className="text-xs text-muted-foreground">Lugares</p>
                        </div>
                      )}
                      {formatPrice() && (
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                          <Ticket className="h-5 w-5 mx-auto mb-1 text-primary" />
                          <p className="text-sm font-medium">{formatPrice()}</p>
                          <p className="text-xs text-muted-foreground">Preco</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Sobre o evento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {event.description || 'Sem descricao disponivel.'}
                    </p>
                  </CardContent>
                </Card>

                {(event.space || event.professional) && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Organizador</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {event.space && (
                        <Link
                          href={`/espacos/${event.space.slug}`}
                          className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <MapPin className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{event.space.name}</p>
                            <p className="text-sm text-muted-foreground">Espaco desportivo</p>
                          </div>
                        </Link>
                      )}
                      {event.professional && (
                        <Link
                          href={`/profissionais/${event.professional.public_slug}`}
                          className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Users className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {event.professional.professional_name || event.professional.full_name}
                            </p>
                            <p className="text-sm text-muted-foreground">Profissional</p>
                          </div>
                        </Link>
                      )}
                      {event.organizer_name && !event.space && !event.professional && (
                        <div className="flex items-center gap-4 p-4 rounded-lg border">
                          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Users className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{event.organizer_name}</p>
                            <p className="text-sm text-muted-foreground">Organizador</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Participar</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {event.external_url ? (
                      <Button className="w-full gap-2" asChild>
                        <a href={event.external_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                          Inscrever-se
                        </a>
                      </Button>
                    ) : (
                      <Button className="w-full gap-2" disabled={isPast}>
                        <Ticket className="h-4 w-4" />
                        {isPast ? 'Evento terminado' : 'Reservar lugar'}
                      </Button>
                    )}

                    {getDirectionsUrl() && (
                      <Button variant="outline" className="w-full gap-2" asChild>
                        <a href={getDirectionsUrl()!} target="_blank" rel="noopener noreferrer">
                          <Navigation className="h-4 w-4" />
                          Obter direcoes
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Data e hora</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">
                          {format(startDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: pt })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(startDate, 'HH:mm', { locale: pt })}
                          {endDate && ` - ${format(endDate, 'HH:mm', { locale: pt })}`}
                        </p>
                      </div>
                    </div>
                    {event.address && (
                      <>
                        <Separator />
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <p className="text-sm">{event.address}</p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
