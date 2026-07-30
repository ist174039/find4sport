'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { HomeSearchForm } from '@/components/home-search-form'

interface Slide {
  id: string
  image_url: string
  title: string | null
  subtitle: string | null
  button_text: string | null
  button_link: string | null
}

interface HeroCarouselProps {
  slides: Slide[]
  spacesCount: number
  profsCount: number
  eventsCount: number
}

export function HeroCarousel({ slides, spacesCount, profsCount, eventsCount }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [slides.length])

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % slides.length)
  }

  if (slides.length === 0) {
    return (
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden border-b border-border bg-muted">
        <div className="text-center">A carregar...</div>
      </section>
    )
  }

  return (
    <section className="relative h-[620px] flex items-center justify-center overflow-hidden border-b border-border">
      {/* Slides images with crossfade */}
      <div className="absolute inset-0 z-0">
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === current ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <img 
              className="w-full h-full object-cover" 
              alt={slide.title || 'Slide'} 
              src={slide.image_url} 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/60"></div>
          </div>
        ))}
      </div>

      {/* Hero Content (Dynamic text + Static Search Hub & Stats) */}
      <div className="relative z-10 w-full max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto text-center mt-12">
        {/* Dynamic Title / Subtitle */}
        <div className="h-44 flex flex-col justify-center mb-6">
          {slides.map((slide, idx) => (
            <div
              key={slide.id}
              className={`transition-all duration-700 ease-in-out absolute left-0 right-0 px-4 ${
                idx === current 
                  ? 'opacity-100 transform translate-y-0 scale-100' 
                  : 'opacity-0 pointer-events-none transform -translate-y-4 scale-95'
              }`}
            >
              <h1 className="text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl mb-4 tracking-tight [text-shadow:_0_2px_4px_rgb(0_0_0_/_80%),_0_0_10px_rgb(0_0_0_/_50%)] [-webkit-text-stroke:1px_rgba(0,0,0,0.5)]">
                {slide.title?.includes('Encontra a') ? (
                  <>
                    Onde a Performance <br className="hidden sm:block" />
                    <span className="text-primary [text-shadow:_0_2px_4px_rgb(0_0_0_/_80%),_0_0_10px_rgb(0_0_0_/_50%)] [-webkit-text-stroke:1px_rgba(0,0,0,0.5)]">Encontra a Reputação</span>
                  </>
                ) : (
                  slide.title
                )}
              </h1>
              <p className="text-base text-white/90 sm:text-lg max-w-2xl mx-auto font-medium [text-shadow:_0_1px_2px_rgb(0_0_0_/_80%)]">
                {slide.subtitle}
              </p>
            </div>
          ))}
        </div>

        {/* Search Hub & Stats (Static over cycling slides) */}
        <div className="max-w-4xl mx-auto mt-6">
          <div className="flex gap-2 justify-center mb-4">
            <Link href="/pesquisa?type=spaces" className="px-5 py-2 rounded-full bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/95 transition-all shadow-sm">Espaços</Link>
            <Link href="/pesquisa?type=events" className="px-5 py-2 rounded-full bg-secondary text-secondary-foreground font-semibold text-xs hover:bg-secondary/80 transition-all border border-border">Eventos</Link>
            <Link href="/pesquisa" className="px-5 py-2 rounded-full bg-secondary text-secondary-foreground font-semibold text-xs hover:bg-secondary/80 transition-all border border-border">Profissionais</Link>
          </div>
          
          <HomeSearchForm />

          <div className="mt-8 flex flex-wrap justify-center gap-6 sm:gap-10 text-muted-foreground text-xs font-semibold">
            <span className="flex flex-col sm:flex-row items-center gap-1"><strong className="text-foreground text-lg sm:text-sm">{spacesCount}+</strong> Espaços</span>
            <span className="flex flex-col sm:flex-row items-center gap-1"><strong className="text-foreground text-lg sm:text-sm">{profsCount}+</strong> Profissionais</span>
            <span className="flex flex-col sm:flex-row items-center gap-1"><strong className="text-foreground text-lg sm:text-sm">{eventsCount}+</strong> Eventos</span>
          </div>
        </div>
      </div>

      {/* Manual Slide Controls - Minimalist standard style */}
      {slides.length > 1 && (
        <>
          <button 
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/50 hover:bg-background border border-border text-foreground transition-all z-20"
            aria-label="Slide anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button 
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/50 hover:bg-background border border-border text-foreground transition-all z-20"
            aria-label="Próximo slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${idx === current ? 'w-5 bg-primary' : 'w-1.5 bg-muted-foreground/30'}`}
                aria-label={`Ir para slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
