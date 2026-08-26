'use client'

import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { AppImage } from '@/components/ui/app-image'

export function HomeCardImage({ src, alt, icon: Icon }: { src?: string | null; alt: string; icon: LucideIcon }) {
  const [failed, setFailed] = useState(false)
  const showImage = Boolean(src && !failed)

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
