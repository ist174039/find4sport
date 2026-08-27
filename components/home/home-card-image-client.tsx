'use client'

import { AppImage } from '@/components/ui/app-image'
import { CategoryPlaceholder } from '@/components/category-placeholder'

export function HomeCardImageClient({ src, alt, kind }: { src?: string | null; alt: string; kind: 'space' | 'event' | 'community' | 'professional' }) {
  return (
    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-primary/15 via-muted to-secondary/20">
      {src ? <AppImage src={src} fallbackSrc={`/placeholder-${kind}.svg`} alt={alt} fill sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 16vw" className="object-cover" /> : <CategoryPlaceholder kind={kind} />}
    </div>
  )
}
