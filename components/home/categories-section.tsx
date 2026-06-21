import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CategoryGrid } from '@/components/category-card'
import type { Category } from '@/lib/types'

interface CategoriesSectionProps {
  categories: Category[]
}

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  const displayCategories = categories.length > 0 ? categories : defaultCategories

  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              Categorias
            </span>
            <h2 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">
              Explore por Modalidade
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Encontre profissionais e espacos na sua modalidade desportiva favorita
            </p>
          </div>
          <Button variant="outline" asChild className="hidden sm:flex">
            <Link href="/categorias">
              Ver todas
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-10">
          <CategoryGrid categories={displayCategories.slice(0, 8)} columns={4} />
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Button variant="outline" asChild>
            <Link href="/categorias">
              Ver todas as categorias
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

const defaultCategories: Category[] = [
  { id: '1', name: 'Futebol', slug: 'futebol', emoji: '⚽', color: '#22c55e', pro_count: 450, space_count: 120, event_count: 80, created_at: '' },
  { id: '2', name: 'Fitness', slug: 'fitness', emoji: '💪', color: '#ef4444', pro_count: 380, space_count: 95, event_count: 45, created_at: '' },
  { id: '3', name: 'Yoga', slug: 'yoga', emoji: '🧘', color: '#14b8a6', pro_count: 220, space_count: 60, event_count: 35, created_at: '' },
  { id: '4', name: 'Natacao', slug: 'natacao', emoji: '🏊', color: '#06b6d4', pro_count: 180, space_count: 45, event_count: 25, created_at: '' },
  { id: '5', name: 'Tenis', slug: 'tenis', emoji: '🎾', color: '#eab308', pro_count: 150, space_count: 70, event_count: 40, created_at: '' },
  { id: '6', name: 'Padel', slug: 'padel', emoji: '🎾', color: '#a855f7', pro_count: 140, space_count: 85, event_count: 50, created_at: '' },
  { id: '7', name: 'Corrida', slug: 'corrida', emoji: '🏃', color: '#8b5cf6', pro_count: 120, space_count: 30, event_count: 60, created_at: '' },
  { id: '8', name: 'Artes Marciais', slug: 'artes-marciais', emoji: '🥋', color: '#64748b', pro_count: 110, space_count: 40, event_count: 20, created_at: '' },
]
