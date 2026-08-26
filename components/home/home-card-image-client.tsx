'use client'

import { AppImage } from '@/components/ui/app-image'
import { CalendarDays, Users, UserRound, Building2 } from 'lucide-react'

export function HomeCardImageClient({ src, alt, kind }: { src?: string | null; alt: string; kind: 'space' | 'event' | 'community' | 'professional' }) {
  const fallbackSrc = '/placeholder.jpg'
  const FallbackIcon = kind === 'space' ? Building2 : kind === 'event' ? CalendarDays : kind === 'community' ? Users : UserRound

  return (
    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-primary/15 via-muted to-secondary/20">
      {src ? <AppImage src={src} fallbackSrc={fallbackSrc} alt={alt} fill sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 16vw" className="object-cover" /> : <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-primary"><div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/15 bg-background/70"><FallbackIcon className="h-7 w-7" /></div><span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{kind === 'space' ? 'Espaço desportivo' : kind === 'event' ? 'Evento desportivo' : kind === 'community' ? 'Comunidade desportiva' : 'Profissional'}</span></div>}
    </div>
  )
}
