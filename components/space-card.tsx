import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Star, BadgeCheck, Heart, Clock, Phone } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { SportSpace, Category } from '@/lib/types'

interface SpaceCardProps {
  space: SportSpace & { categories?: Category[] }
  variant?: 'default' | 'compact' | 'horizontal'
  showFavoriteButton?: boolean
  isFavorited?: boolean
  onFavoriteToggle?: (id: string) => void
  className?: string
}

export function SpaceCard({
  space,
  variant = 'default',
  showFavoriteButton = false,
  isFavorited = false,
  onFavoriteToggle,
  className,
}: SpaceCardProps) {
  const placeholderImage = `https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop`

  if (variant === 'horizontal') {
    return (
      <Card className={cn('overflow-hidden transition-shadow hover:shadow-md', className)}>
        <Link href={`/espacos/${space.slug || space.id}`}>
          <CardContent className="flex gap-4 p-0">
            <div className="relative h-32 w-40 shrink-0">
              <Image
                src={space.gallery_urls?.[0] || placeholderImage}
                alt={space.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-center py-4 pr-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="flex items-center gap-1.5 font-semibold text-foreground">
                    {space.name}
                    {space.is_verified && (
                      <BadgeCheck className="h-4 w-4 text-primary" />
                    )}
                  </h3>
                  {space.address && (
                    <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {space.address}
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
                      onFavoriteToggle?.(space.id)
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
              {space.categories && space.categories.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {space.categories.slice(0, 3).map((cat) => (
                    <Badge key={cat.id} variant="secondary" className="text-xs">
                      {cat.emoji} {cat.name}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="mt-2 flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1 text-amber-500">
                  <Star className="h-4 w-4 fill-current" />
                  {space.rating_avg.toFixed(1)}
                </span>
                <span className="text-muted-foreground">
                  ({space.review_count} avaliacoes)
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
      <Link href={`/espacos/${space.slug || space.id}`}>
        {/* Image Section */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <Image
            src={space.gallery_urls?.[0] || placeholderImage}
            alt={space.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          {showFavoriteButton && (
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-2 top-2 h-8 w-8 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
              onClick={(e) => {
                e.preventDefault()
                onFavoriteToggle?.(space.id)
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
          {space.ownership_status === 'unclaimed' && (
            <Badge variant="outline" className="absolute left-2 top-2 bg-background/90">
              Sem proprietario
            </Badge>
          )}
        </div>

        {/* Content */}
        <CardContent className={cn('p-4', variant === 'compact' && 'p-3')}>
          <div className="flex items-start justify-between gap-2">
            <h3
              className={cn(
                'flex items-center gap-1.5 font-semibold text-foreground',
                variant === 'compact' && 'text-sm'
              )}
            >
              {space.name}
              {space.is_verified && (
                <BadgeCheck className="h-4 w-4 text-primary" />
              )}
            </h3>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-sm font-medium">{space.rating_avg.toFixed(1)}</span>
            </div>
          </div>

          {space.address && (
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{space.address}</span>
            </p>
          )}

          {space.categories && space.categories.length > 0 && variant !== 'compact' && (
            <div className="mt-3 flex flex-wrap gap-1">
              {space.categories.slice(0, 2).map((cat) => (
                <Badge key={cat.id} variant="secondary" className="text-xs">
                  {cat.emoji} {cat.name}
                </Badge>
              ))}
              {space.categories.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{space.categories.length - 2}
                </Badge>
              )}
            </div>
          )}

          {space.amenities && space.amenities.length > 0 && variant !== 'compact' && (
            <div className="mt-2 flex flex-wrap gap-1">
              {space.amenities.slice(0, 3).map((amenity) => (
                <span
                  key={amenity}
                  className="text-xs text-muted-foreground"
                >
                  {amenity}
                  {space.amenities!.indexOf(amenity) < Math.min(space.amenities!.length - 1, 2) && ' • '}
                </span>
              ))}
            </div>
          )}

          <p className="mt-2 text-xs text-muted-foreground">
            {space.review_count} avaliacoes
          </p>
        </CardContent>
      </Link>
    </Card>
  )
}

interface SpaceGridProps {
  spaces: (SportSpace & { categories?: Category[] })[]
  variant?: 'default' | 'compact' | 'horizontal'
  columns?: 2 | 3 | 4
  showFavoriteButton?: boolean
  favoritedIds?: string[]
  onFavoriteToggle?: (id: string) => void
  className?: string
}

export function SpaceGrid({
  spaces,
  variant = 'default',
  columns = 3,
  showFavoriteButton = false,
  favoritedIds = [],
  onFavoriteToggle,
  className,
}: SpaceGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }

  if (variant === 'horizontal') {
    return (
      <div className={cn('flex flex-col gap-4', className)}>
        {spaces.map((space) => (
          <SpaceCard
            key={space.id}
            space={space}
            variant="horizontal"
            showFavoriteButton={showFavoriteButton}
            isFavorited={favoritedIds.includes(space.id)}
            onFavoriteToggle={onFavoriteToggle}
          />
        ))}
      </div>
    )
  }

  return (
    <div className={cn('grid gap-4 sm:gap-6', gridCols[columns], className)}>
      {spaces.map((space) => (
        <SpaceCard
          key={space.id}
          space={space}
          variant={variant}
          showFavoriteButton={showFavoriteButton}
          isFavorited={favoritedIds.includes(space.id)}
          onFavoriteToggle={onFavoriteToggle}
        />
      ))}
    </div>
  )
}
