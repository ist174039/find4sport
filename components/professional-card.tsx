import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Star, BadgeCheck, Heart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Professional, Category } from '@/lib/types'

interface ProfessionalCardProps {
  professional: Professional & { categories?: Category[] }
  variant?: 'default' | 'compact' | 'horizontal'
  showFavoriteButton?: boolean
  isFavorited?: boolean
  onFavoriteToggle?: (id: string) => void
  className?: string
}

export function ProfessionalCard({
  professional,
  variant = 'default',
  showFavoriteButton = false,
  isFavorited = false,
  onFavoriteToggle,
  className,
}: ProfessionalCardProps) {
  const displayName = professional.professional_name || professional.full_name
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  if (variant === 'horizontal') {
    return (
      <Card className={cn('overflow-hidden transition-shadow hover:shadow-md', className)}>
        <Link href={`/profissionais/${professional.public_slug || professional.id}`}>
          <CardContent className="flex gap-4 p-4">
            <Avatar className="h-20 w-20 shrink-0">
              <AvatarImage src={professional.avatar_url || undefined} alt={displayName} />
              <AvatarFallback className="bg-primary text-lg text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="flex items-center gap-1.5 font-semibold text-foreground">
                    {displayName}
                    {professional.is_verified && (
                      <BadgeCheck className="h-4 w-4 text-primary" />
                    )}
                  </h3>
                  {professional.address && (
                    <p className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {professional.address}
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
                      onFavoriteToggle?.(professional.id)
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
              {professional.categories && professional.categories.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {professional.categories.slice(0, 3).map((cat) => (
                    <Badge key={cat.id} variant="secondary" className="text-xs">
                      {cat.emoji} {cat.name}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="mt-2 flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1 text-amber-500">
                  <Star className="h-4 w-4 fill-current" />
                  {professional.rating_avg.toFixed(1)}
                </span>
                <span className="text-muted-foreground">
                  ({professional.review_count} avaliacoes)
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
        'group overflow-hidden border-border/60 transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5',
        variant === 'compact' && 'hover:shadow-lg',
        className
      )}
    >
      <Link href={`/profissionais/${professional.public_slug || professional.id}`}>
        {/* Image/Avatar Section */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {professional.gallery_urls && professional.gallery_urls[0] ? (
            <Image
              src={professional.gallery_urls[0]}
              alt={displayName}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={professional.avatar_url || undefined} alt={displayName} />
                <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
          {showFavoriteButton && (
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-2 top-2 h-8 w-8 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
              onClick={(e) => {
                e.preventDefault()
                onFavoriteToggle?.(professional.id)
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
          {professional.is_premium && (
            <Badge className="absolute left-2 top-2 bg-amber-500 hover:bg-amber-600">
              Premium
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
              {displayName}
              {professional.is_verified && (
                <BadgeCheck className="h-4 w-4 text-primary" />
              )}
            </h3>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-sm font-medium">
                {professional.rating_avg.toFixed(1)}
              </span>
            </div>
          </div>

          {professional.address && (
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{professional.address}</span>
            </p>
          )}

          {professional.categories && professional.categories.length > 0 && variant !== 'compact' && (
            <div className="mt-3 flex flex-wrap gap-1">
              {professional.categories.slice(0, 2).map((cat) => (
                <Badge key={cat.id} variant="secondary" className="text-xs">
                  {cat.emoji} {cat.name}
                </Badge>
              ))}
              {professional.categories.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{professional.categories.length - 2}
                </Badge>
              )}
            </div>
          )}

          <p className="mt-2 text-xs text-muted-foreground">
            {professional.review_count} avaliacoes
          </p>
        </CardContent>
      </Link>
    </Card>
  )
}

interface ProfessionalGridProps {
  professionals: (Professional & { categories?: Category[] })[]
  variant?: 'default' | 'compact' | 'horizontal'
  columns?: 2 | 3 | 4
  showFavoriteButton?: boolean
  favoritedIds?: string[]
  onFavoriteToggle?: (id: string) => void
  className?: string
}

export function ProfessionalGrid({
  professionals,
  variant = 'default',
  columns = 3,
  showFavoriteButton = false,
  favoritedIds = [],
  onFavoriteToggle,
  className,
}: ProfessionalGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }

  if (variant === 'horizontal') {
    return (
      <div className={cn('flex flex-col gap-4', className)}>
        {professionals.map((pro) => (
          <ProfessionalCard
            key={pro.id}
            professional={pro}
            variant="horizontal"
            showFavoriteButton={showFavoriteButton}
            isFavorited={favoritedIds.includes(pro.id)}
            onFavoriteToggle={onFavoriteToggle}
          />
        ))}
      </div>
    )
  }

  return (
    <div className={cn('grid gap-4 sm:gap-6', gridCols[columns], className)}>
      {professionals.map((pro) => (
        <ProfessionalCard
          key={pro.id}
          professional={pro}
          variant={variant}
          showFavoriteButton={showFavoriteButton}
          isFavorited={favoritedIds.includes(pro.id)}
          onFavoriteToggle={onFavoriteToggle}
        />
      ))}
    </div>
  )
}
