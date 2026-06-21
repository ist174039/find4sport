import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProfessionalGrid } from '@/components/professional-card'
import type { Professional, Category } from '@/lib/types'

interface FeaturedProfessionalsSectionProps {
  professionals: (Professional & { categories: Category[] })[]
}

export function FeaturedProfessionalsSection({ professionals }: FeaturedProfessionalsSectionProps) {
  const displayProfessionals = professionals.length > 0 ? professionals : defaultProfessionals

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-muted/50 to-background py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              Destaques
            </span>
            <h2 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">
              Profissionais em Destaque
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Os melhores profissionais avaliados pela nossa comunidade
            </p>
          </div>
          <Button variant="outline" asChild className="hidden sm:flex">
            <Link href="/profissionais">
              Ver todos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-10">
          <ProfessionalGrid professionals={displayProfessionals.slice(0, 3)} columns={3} />
        </div>

        <div className="mt-10 text-center">
          <Button size="lg" asChild>
            <Link href="/profissionais">
              Explorar Profissionais
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

const defaultProfessionals: (Professional & { categories: Category[] })[] = [
  {
    id: '1',
    user_id: '1',
    full_name: 'Joao Silva',
    professional_name: 'Coach Joao',
    bio: 'Personal trainer certificado com 10 anos de experiencia',
    avatar_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop&crop=face',
    phone: null,
    whatsapp: null,
    email: 'joao@example.com',
    nif: null,
    address: 'Lisboa',
    latitude: null,
    longitude: null,
    service_radius_km: 15,
    status: 'active',
    public_slug: 'coach-joao',
    contact_methods: ['email', 'whatsapp'],
    rating_avg: 4.9,
    review_count: 127,
    views_count: 1500,
    website: null,
    social_links: {},
    is_verified: true,
    is_premium: true,
    gallery_urls: ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop'],
    created_at: '',
    updated_at: '',
    categories: [{ id: '2', name: 'Fitness', slug: 'fitness', emoji: '💪', color: '#ef4444', pro_count: 0, space_count: 0, event_count: 0, created_at: '' }]
  },
  {
    id: '2',
    user_id: '2',
    full_name: 'Ana Santos',
    professional_name: 'Ana Yoga',
    bio: 'Instrutora de Yoga e meditacao',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
    phone: null,
    whatsapp: null,
    email: 'ana@example.com',
    nif: null,
    address: 'Porto',
    latitude: null,
    longitude: null,
    service_radius_km: 10,
    status: 'active',
    public_slug: 'ana-yoga',
    contact_methods: ['email'],
    rating_avg: 4.8,
    review_count: 89,
    views_count: 980,
    website: null,
    social_links: {},
    is_verified: true,
    is_premium: false,
    gallery_urls: ['https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&h=400&fit=crop'],
    created_at: '',
    updated_at: '',
    categories: [{ id: '3', name: 'Yoga', slug: 'yoga', emoji: '🧘', color: '#14b8a6', pro_count: 0, space_count: 0, event_count: 0, created_at: '' }]
  },
  {
    id: '3',
    user_id: '3',
    full_name: 'Pedro Costa',
    professional_name: null,
    bio: 'Treinador de natacao olimpico',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    phone: null,
    whatsapp: null,
    email: 'pedro@example.com',
    nif: null,
    address: 'Faro',
    latitude: null,
    longitude: null,
    service_radius_km: 20,
    status: 'active',
    public_slug: 'pedro-costa',
    contact_methods: ['email', 'phone'],
    rating_avg: 4.7,
    review_count: 56,
    views_count: 720,
    website: null,
    social_links: {},
    is_verified: true,
    is_premium: false,
    gallery_urls: ['https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=600&h=400&fit=crop'],
    created_at: '',
    updated_at: '',
    categories: [{ id: '4', name: 'Natacao', slug: 'natacao', emoji: '🏊', color: '#06b6d4', pro_count: 0, space_count: 0, event_count: 0, created_at: '' }]
  },
]
