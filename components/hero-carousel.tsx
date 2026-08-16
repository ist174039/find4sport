'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { HomeSearchForm } from '@/components/home-search-form'
import { Button } from '@/components/ui/button'

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
    const timer = window.setInterval(() => setCurrent(prev => (prev + 1) % slides.length), 6000)
    return () => window.clearInterval(timer)
  }, [slides.length])

  const discovery = (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-4 flex gap-2 overflow-x-auto px-1 pb-1 sm:justify-center">
        <Button asChild size="sm" className="min-h-10 shrink-0 rounded-full"><Link href="/espacos">Espaços</Link></Button>
        <Button asChild size="sm" variant="secondary" className="min-h-10 shrink-0 rounded-full"><Link href="/profissionais">Profissionais</Link></Button>
        <Button asChild size="sm" variant="secondary" className="min-h-10 shrink-0 rounded-full"><Link href="/eventos">Eventos</Link></Button>
        <Button asChild size="sm" variant="secondary" className="min-h-10 shrink-0 rounded-full"><Link href="/comunidades">Comunidades</Link></Button>
      </div>
      <HomeSearchForm />
      <div className="mt-6 grid grid-cols-3 gap-3 text-center text-xs font-medium text-white/85 sm:mx-auto sm:max-w-lg">
        <span><strong className="block text-lg text-white">{spacesCount}</strong>Espaços</span>
        <span><strong className="block text-lg text-white">{profsCount}</strong>Profissionais</span>
        <span><strong className="block text-lg text-white">{eventsCount}</strong>Eventos</span>
      </div>
    </div>
  )

  if (slides.length === 0) {
    return (
      <section className="relative flex min-h-[520px] items-center overflow-hidden border-b border-border bg-gradient-to-br from-primary via-primary/80 to-teal-700 px-4 py-16 sm:min-h-[580px]">
        <div className="mx-auto w-full max-w-7xl text-center text-primary-foreground">
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">Encontre desporto, profissionais e espaços perto de si</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/85 sm:text-lg">Pesquise, compare, participe e ligue-se à comunidade desportiva.</p>
          <div className="mt-8">{discovery}</div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative flex min-h-[540px] items-center justify-center overflow-hidden border-b border-border sm:min-h-[620px]">
      <div className="absolute inset-0">
        {slides.map((slide, index) => <div key={slide.id} className={`absolute inset-0 transition-opacity duration-700 ${index === current ? 'opacity-100' : 'pointer-events-none opacity-0'}`}><img src={slide.image_url} alt={slide.title || ''} className="h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/30 to-black/70" /></div>)}
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-16 text-center sm:px-6">
        <div className="mx-auto min-h-44 max-w-4xl">
          {slides.map((slide, index) => <div key={slide.id} className={index === current ? 'animate-in fade-in duration-500' : 'hidden'}>
            {slide.title && <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow sm:text-5xl lg:text-6xl">{slide.title}</h1>}
            {slide.subtitle && <p className="mx-auto mt-4 max-w-2xl text-base font-medium text-white/90 sm:text-lg">{slide.subtitle}</p>}
            {slide.button_text && slide.button_link && <Button asChild size="lg" className="mt-6 min-h-11"><Link href={slide.button_link}>{slide.button_text}</Link></Button>}
          </div>)}
        </div>
        <div className="mt-4">{discovery}</div>
      </div>

      {slides.length > 1 && <>
        <button onClick={() => setCurrent(prev => (prev - 1 + slides.length) % slides.length)} className="absolute left-2 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/30 text-white backdrop-blur sm:flex" aria-label="Slide anterior"><ChevronLeft className="h-5 w-5" /></button>
        <button onClick={() => setCurrent(prev => (prev + 1) % slides.length)} className="absolute right-2 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/30 text-white backdrop-blur sm:flex" aria-label="Próximo slide"><ChevronRight className="h-5 w-5" /></button>
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">{slides.map((_, index) => <button key={index} onClick={() => setCurrent(index)} className={`h-2 rounded-full transition-all ${index === current ? 'w-6 bg-white' : 'w-2 bg-white/50'}`} aria-label={`Ir para slide ${index + 1}`} />)}</div>
      </>}
    </section>
  )
}
