import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EventGrid } from '@/components/event-card'
import type { Event, Category } from '@/lib/types'

interface UpcomingEventsSectionProps {
  events: (Event & { category?: Category })[]
}

export function UpcomingEventsSection({ events }: UpcomingEventsSectionProps) {
  const displayEvents = events.length > 0 ? events : defaultEvents

  return (
    <section className="bg-muted/30 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              Proximos Eventos
            </h2>
            <p className="mt-2 text-muted-foreground">
              Nao perca os melhores eventos desportivos
            </p>
          </div>
          <Button variant="ghost" asChild className="hidden sm:flex">
            <Link href="/eventos">
              Ver todos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-8">
          <EventGrid events={displayEvents.slice(0, 6)} columns={3} />
        </div>

        <div className="mt-8 text-center">
          <Button variant="outline" asChild>
            <Link href="/eventos">
              Ver Calendario Completo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

// Get future dates for demo events
const getFutureDate = (daysFromNow: number) => {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  date.setHours(10, 0, 0, 0)
  return date.toISOString()
}

const defaultEvents: (Event & { category?: Category })[] = [
  {
    id: '1',
    title: 'Maratona de Lisboa 2024',
    slug: 'maratona-lisboa-2024',
    description: 'A maior maratona de Portugal',
    category_id: '7',
    space_id: null,
    professional_id: null,
    organizer_name: 'Camara Municipal de Lisboa',
    organizer_email: 'eventos@cm-lisboa.pt',
    address: 'Praca do Comercio, Lisboa',
    latitude: null,
    longitude: null,
    start_date: getFutureDate(15),
    end_date: getFutureDate(15),
    capacity: 30000,
    price_min: 25,
    price_max: 50,
    image_url: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=600&h=400&fit=crop',
    gallery_urls: null,
    source: 'manual',
    external_url: null,
    source_type: null,
    status: 'published',
    is_featured: true,
    is_verified: true,
    views_count: 5000,
    created_by: null,
    created_at: '',
    updated_at: '',
    category: { id: '7', name: 'Corrida', slug: 'corrida', emoji: '🏃', color: '#8b5cf6', pro_count: 0, space_count: 0, event_count: 0, created_at: '' }
  },
  {
    id: '2',
    title: 'Workshop de Yoga ao Ar Livre',
    slug: 'workshop-yoga-ar-livre',
    description: 'Sessao de yoga no parque',
    category_id: '3',
    space_id: null,
    professional_id: null,
    organizer_name: 'Yoga Lisboa',
    organizer_email: 'info@yogalisboa.pt',
    address: 'Parque das Nacoes, Lisboa',
    latitude: null,
    longitude: null,
    start_date: getFutureDate(3),
    end_date: getFutureDate(3),
    capacity: 50,
    price_min: 0,
    price_max: 0,
    image_url: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&h=400&fit=crop',
    gallery_urls: null,
    source: 'manual',
    external_url: null,
    source_type: null,
    status: 'published',
    is_featured: false,
    is_verified: true,
    views_count: 1200,
    created_by: null,
    created_at: '',
    updated_at: '',
    category: { id: '3', name: 'Yoga', slug: 'yoga', emoji: '🧘', color: '#14b8a6', pro_count: 0, space_count: 0, event_count: 0, created_at: '' }
  },
  {
    id: '3',
    title: 'Torneio de Padel Amador',
    slug: 'torneio-padel-amador',
    description: 'Torneio para jogadores amadores',
    category_id: '6',
    space_id: null,
    professional_id: null,
    organizer_name: 'Padel Club Porto',
    organizer_email: 'torneios@padelclubporto.pt',
    address: 'Boavista, Porto',
    latitude: null,
    longitude: null,
    start_date: getFutureDate(7),
    end_date: getFutureDate(8),
    capacity: 32,
    price_min: 20,
    price_max: 20,
    image_url: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&h=400&fit=crop',
    gallery_urls: null,
    source: 'manual',
    external_url: null,
    source_type: null,
    status: 'published',
    is_featured: false,
    is_verified: true,
    views_count: 800,
    created_by: null,
    created_at: '',
    updated_at: '',
    category: { id: '6', name: 'Padel', slug: 'padel', emoji: '🎾', color: '#a855f7', pro_count: 0, space_count: 0, event_count: 0, created_at: '' }
  },
]
