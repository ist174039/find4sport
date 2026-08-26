'use client'

import { AppImage } from '@/components/ui/app-image'

export function HomeCardImageClient({ src, alt, kind }: { src?: string | null; alt: string; kind: 'space' | 'people' }) {
  const fallbackSrc = kind === 'people' ? '/placeholder-user.jpg' : '/placeholder.jpg'

  return (
    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-primary/15 via-muted to-secondary/20">
      <AppImage src={src || fallbackSrc} fallbackSrc={fallbackSrc} alt={alt} fill sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 16vw" className="object-cover" />
    </div>
  )
}
