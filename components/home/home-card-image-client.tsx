'use client'

import { Building2, Users } from 'lucide-react'
import { useState } from 'react'
import { AppImage } from '@/components/ui/app-image'

export function HomeCardImageClient({ src, alt, kind }: { src?: string | null; alt: string; kind: 'space' | 'people' }) {
  const [failed, setFailed] = useState(false)
  const showImage = Boolean(src && !failed)
  const Icon = kind === 'space' ? Building2 : Users

  return (
    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-primary/15 via-muted to-secondary/20">
      {showImage ? (
        <AppImage src={src!} alt={alt} fill sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 16vw" className="object-cover" onError={() => setFailed(true)} />
      ) : (
        <div className="flex h-full items-center justify-center"><Icon className="h-10 w-10 text-primary/35" /></div>
      )}
    </div>
  )
}
