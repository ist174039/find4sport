import Link from 'next/link'
import { Images } from 'lucide-react'

type PhotoGalleryItem = {
  url: string
  alt: string
  href?: string
  label?: string
}

type InstagramPhotoGalleryProps = {
  title?: string
  subtitle?: string
  items: PhotoGalleryItem[]
  maxItems?: number
  className?: string
}

function uniqueItems(items: PhotoGalleryItem[]): PhotoGalleryItem[] {
  const seen = new Set<string>()
  const clean = items.filter((item) => item.url && item.url.trim().length > 0)
  const result: PhotoGalleryItem[] = []

  for (const item of clean) {
    if (seen.has(item.url)) continue
    seen.add(item.url)
    result.push(item)
  }

  return result
}

export function InstagramPhotoGallery({
  title = 'Galeria de Fotos',
  subtitle = 'Visual estilo feed para explorar momentos',
  items,
  maxItems = 12,
  className = '',
}: InstagramPhotoGalleryProps) {
  const deduped = uniqueItems(items)

  if (deduped.length === 0) {
    return null
  }

  const visibleItems = deduped.slice(0, maxItems)
  const hiddenCount = Math.max(0, deduped.length - visibleItems.length)

  return (
    <section className={`rounded-2xl border border-border bg-card p-4 sm:p-5 md:p-6 shadow-sm ${className}`}>
      <div className="mb-4 flex items-center justify-between gap-3 sm:mb-5">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground sm:text-lg md:text-xl">
            <Images className="h-5 w-5 text-primary" />
            {title}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{subtitle}</p>
        </div>
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary sm:text-xs">
          {deduped.length} fotos
        </span>
      </div>

      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 md:gap-3">
        {visibleItems.map((item, index) => {
          const isLastVisible = index === visibleItems.length - 1
          const showHiddenOverlay = hiddenCount > 0 && isLastVisible

          const imageCard = (
            <div className="group relative aspect-square overflow-hidden rounded-xl border border-border/60 bg-muted/30">
              <img
                src={item.url}
                alt={item.alt}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/10 opacity-80 transition-opacity group-hover:opacity-100" />
              <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between gap-2">
                <span className="truncate rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm sm:text-[11px]">
                  {item.label || `Foto ${index + 1}`}
                </span>
                <span className="rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm sm:text-[11px]">
                  {index + 1}
                </span>
              </div>
              {showHiddenOverlay && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 text-lg font-black text-white">
                  +{hiddenCount}
                </div>
              )}
            </div>
          )

          if (item.href) {
            return (
              <Link key={`${item.url}-${index}`} href={item.href} className="block" aria-label={item.alt}>
                {imageCard}
              </Link>
            )
          }

          return (
            <a
              key={`${item.url}-${index}`}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
              aria-label={item.alt}
            >
              {imageCard}
            </a>
          )
        })}
      </div>
    </section>
  )
}
