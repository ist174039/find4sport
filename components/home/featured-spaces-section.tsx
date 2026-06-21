import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SpaceGrid } from '@/components/space-card'
import type { SportSpace, Category } from '@/lib/types'

interface FeaturedSpacesSectionProps {
  spaces: (SportSpace & { categories: Category[] })[]
}

export function FeaturedSpacesSection({ spaces }: FeaturedSpacesSectionProps) {
  const displaySpaces = spaces.length > 0 ? spaces : defaultSpaces

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              Espacos Desportivos
            </h2>
            <p className="mt-2 text-muted-foreground">
              Descubra ginasios, campos e instalacoes perto de si
            </p>
          </div>
          <Button variant="ghost" asChild className="hidden sm:flex">
            <Link href="/espacos">
              Ver todos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-8">
          <SpaceGrid spaces={displaySpaces.slice(0, 6)} columns={3} />
        </div>

        <div className="mt-8 text-center">
          <Button variant="outline" asChild>
            <Link href="/espacos">
              Explorar Espacos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

const defaultSpaces: (SportSpace & { categories: Category[] })[] = [
  {
    id: '1',
    name: 'Fitness Hut Marques',
    slug: 'fitness-hut-marques',
    description: 'Ginasio moderno com equipamentos de ultima geracao',
    address: 'Marques de Pombal, Lisboa',
    latitude: null,
    longitude: null,
    phone: '21 000 0000',
    email: 'marques@fitnesshut.pt',
    website: 'https://fitnesshut.pt',
    opening_hours: {},
    amenities: ['Piscina', 'Spa', 'Aulas de Grupo'],
    source: 'manual',
    google_places_id: null,
    status: 'active',
    is_verified: true,
    rating_avg: 4.6,
    review_count: 234,
    views_count: 3500,
    gallery_urls: ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop'],
    created_by: null,
    owner_user_id: null,
    ownership_status: 'claimed',
    claimed_at: null,
    created_at: '',
    updated_at: '',
    categories: [{ id: '2', name: 'Fitness', slug: 'fitness', emoji: '💪', color: '#ef4444', pro_count: 0, space_count: 0, event_count: 0, created_at: '' }]
  },
  {
    id: '2',
    name: 'Padel Club Porto',
    slug: 'padel-club-porto',
    description: 'O melhor clube de padel do Porto',
    address: 'Boavista, Porto',
    latitude: null,
    longitude: null,
    phone: '22 000 0000',
    email: 'info@padelclubporto.pt',
    website: null,
    opening_hours: {},
    amenities: ['6 Campos', 'Balnearios', 'Cafetaria'],
    source: 'manual',
    google_places_id: null,
    status: 'active',
    is_verified: true,
    rating_avg: 4.8,
    review_count: 156,
    views_count: 2800,
    gallery_urls: ['https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&h=400&fit=crop'],
    created_by: null,
    owner_user_id: null,
    ownership_status: 'claimed',
    claimed_at: null,
    created_at: '',
    updated_at: '',
    categories: [{ id: '6', name: 'Padel', slug: 'padel', emoji: '🎾', color: '#a855f7', pro_count: 0, space_count: 0, event_count: 0, created_at: '' }]
  },
  {
    id: '3',
    name: 'Piscina Municipal de Faro',
    slug: 'piscina-municipal-faro',
    description: 'Complexo aquatico municipal',
    address: 'Centro, Faro',
    latitude: null,
    longitude: null,
    phone: '289 000 000',
    email: 'piscina@cm-faro.pt',
    website: null,
    opening_hours: {},
    amenities: ['Piscina Olimpica', 'Piscina Infantil', 'Jacuzzi'],
    source: 'manual',
    google_places_id: null,
    status: 'active',
    is_verified: false,
    rating_avg: 4.3,
    review_count: 89,
    views_count: 1200,
    gallery_urls: ['https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=600&h=400&fit=crop'],
    created_by: null,
    owner_user_id: null,
    ownership_status: 'unclaimed',
    claimed_at: null,
    created_at: '',
    updated_at: '',
    categories: [{ id: '4', name: 'Natacao', slug: 'natacao', emoji: '🏊', color: '#06b6d4', pro_count: 0, space_count: 0, event_count: 0, created_at: '' }]
  },
]
