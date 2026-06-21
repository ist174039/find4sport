import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { pt } from 'date-fns/locale'
import { Calendar, MapPin, Users, Heart, Clock, Euro } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Event, Category } from '@/lib/types'

interface EventCardProps {
  event: Event & { category?: Category }
  variant?: 'default' | 'compact' | 'horizontal'
  showFavoriteButton?: boolean
  isFavorited?: boolean
  onFavoriteToggle?: (id: string) => void
  className?: string
}

export function EventCard({
  event,
  variant = 'default',
  showFavoriteButton = false,
  isFavorited = false,
  onFavoriteToggle,
  className,
}: EventCardProps) {
  const placeholderImage = `https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=400&fit=crop`
  const startDate = new Date(event.start_date)
  const endDate = event.end_date ? new Date(event.end_date) : null

  const formatEventDate = () => {
    const day = format(startDate, 'd', { locale: pt })
    const month = format(startDate, 'MMM', { locale: pt }).toUpperCase()
    return { day, month }
  }

  const { day, month } = formatEventDate()

  const formatPrice = () => {
    if (!event.price_min && !event.price_max) return 'Gratis'
    if (event.price_min === event.price_max) return `${event.price_min}€`
    return `${event.price_min || 0}€ - ${event.price_max}€`
  }

  if (variant === 'horizontal') {
    return (
      <Card className={cn('overflow-hidden transition-shadow hover:shadow-md', className)}>
        <Link href={`/eventos/${event.slug || event.id}`}>
          <CardContent className="flex gap-4 p-0">
            <div className="relative h-32 w-40 shrink-0">
              <Image
                src={event.image_url || placeholderImage}
                alt={event.title}
                fill
                className="object-cover"
              />
              <div className="absolute left-2 top-2 flex flex-col items-center rounded-lg bg-primary px-2 py-1 text-center text-primary-foreground">
                <span className="text-lg font-bold leading-none">{day}</span>
                <span className="text-[10px] font-medium uppercase">{month}</span>
              </div>
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-center py-4 pr-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-foreground">{event.title}</h3>
                  <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {format(startDate, 'HH:mm', { locale: pt })}
                    {endDate && ` - ${format(endDate, 'HH:mm', { locale: pt })}`}
                  </p>
                  {event.address && (
                    <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {event.address}
                    </p>
                  )}
                </div>
                {showFavoriteButton && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={(e) => {
                      e.preventDefault()
                      onFavoriteToggle?.(event.id)
                    }}
                  >
                    <Heart
                      className={cn(
                        'h-5 w-5',
                        isFavorited && 'fill-destructive text-destructive'
                      )}
                    />
                  </Button>
                )}
              </div>
              <div className="mt-2 flex items-center gap-3">
                {event.category && (
                  <Badge variant="secondary" className="text-xs">
                    {event.category.emoji} {event.category.name}
                  </Badge>
                )}
                <span className="flex items-center gap-1 text-sm font-medium text-primary">
                  <Euro className="h-3.5 w-3.5" />
                  {formatPrice()}
                </span>
              </div>
            </div>
          </CardContent>
        </Link>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        'group overflow-hidden transition-all hover:shadow-lg',
        variant === 'compact' && 'hover:shadow-md',
        className
      )}
    >
      <Link href={`/eventos/${event.slug || event.id}`}>
        {/* Image Section */}
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          <Image
            src={event.image_url || placeholderImage}
            alt={event.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute left-3 top-3 flex flex-col items-center rounded-lg bg-primary px-3 py-1.5 text-center text-primary-foreground shadow-lg">
            <span className="text-xl font-bold leading-none">{day}</span>
            <span className="text-xs font-medium uppercase">{month}</span>
          </div>
          {showFavoriteButton && (
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-2 top-2 h-8 w-8 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
              onClick={(e) => {
                e.preventDefault()
                onFavoriteToggle?.(event.id)
              }}
            >
              <Heart
                className={cn(
                  'h-4 w-4',
                  isFavorited && 'fill-destructive text-destructive'
                )}
              />
            </Button>
          )}
          {event.is_featured && (
            <Badge className="absolute right-2 top-2 bg-amber-500 hover:bg-amber-600">
              Destaque
            </Badge>
          )}
        </div>

        {/* Content */}
        <CardContent className={cn('p-4', variant === 'compact' && 'p-3')}>
          <div className="flex items-start justify-between gap-2">
            <h3
              className={cn(
                'line-clamp-2 font-semibold text-foreground',
                variant === 'compact' && 'text-sm'
              )}
            >
              {event.title}
            </h3>
          </div>

          <div className="mt-2 space-y-1">
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              {format(startDate, 'HH:mm', { locale: pt })}
              {endDate && ` - ${format(endDate, 'HH:mm', { locale: pt })}`}
            </p>
            {event.address && (
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{event.address}</span>
              </p>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {event.category && (
                <Badge variant="secondary" className="text-xs">
                  {event.category.emoji} {event.category.name}
                </Badge>
              )}
            </div>
            <span className="flex items-center gap-1 text-sm font-semibold text-primary">
              {formatPrice()}
            </span>
          </div>

          {event.capacity && variant !== 'compact' && (
            <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              {event.capacity} lugares disponiveis
            </p>
          )}
        </CardContent>
      </Link>
    </Card>
  )
}

interface EventGridProps {
  events: (Event & { category?: Category })[]
  variant?: 'default' | 'compact' | 'horizontal'
  columns?: 2 | 3 | 4
  showFavoriteButton?: boolean
  favoritedIds?: string[]
  onFavoriteToggle?: (id: string) => void
  className?: string
}

export function EventGrid({
  events,
  variant = 'default',
  columns = 3,
  showFavoriteButton = false,
  favoritedIds = [],
  onFavoriteToggle,
  className,
}: EventGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }

  if (variant === 'horizontal') {
    return (
      <div className={cn('flex flex-col gap-4', className)}>
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            variant="horizontal"
            showFavoriteButton={showFavoriteButton}
            isFavorited={favoritedIds.includes(event.id)}
            onFavoriteToggle={onFavoriteToggle}
          />
        ))}
      </div>
    )
  }

  return (
    <div className={cn('grid gap-4 sm:gap-6', gridCols[columns], className)}>
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          variant={variant}
          showFavoriteButton={showFavoriteButton}
          isFavorited={favoritedIds.includes(event.id)}
          onFavoriteToggle={onFavoriteToggle}
        />
      ))}
    </div>
  )
}
