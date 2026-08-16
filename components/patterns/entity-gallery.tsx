'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Images, X } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function EntityGallery({ images, alt }: { images: string[]; alt: string }) {
  const clean = images.filter(Boolean)
  const [selected, setSelected] = useState(0)
  const [open, setOpen] = useState(false)
  if (!clean.length) return null

  const move = (delta: number) => setSelected(index => (index + delta + clean.length) % clean.length)

  return <>
    <div className="space-y-3">
      <button type="button" onClick={() => setOpen(true)} className="group relative block aspect-[4/3] w-full overflow-hidden rounded-2xl bg-muted sm:aspect-[16/9]" aria-label="Abrir galeria">
        <img src={clean[selected]} alt={`${alt} — fotografia ${selected + 1}`} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]" />
        <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/65 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur"><Images className="h-3.5 w-3.5" />{selected + 1}/{clean.length}</span>
      </button>
      {clean.length > 1 && <div className="grid grid-cols-4 gap-2">{clean.slice(0, 4).map((url, index) => <button key={`${url}-${index}`} type="button" onClick={() => setSelected(index)} className={`aspect-square overflow-hidden rounded-xl border-2 bg-muted transition ${selected === index ? 'border-primary' : 'border-transparent opacity-80 hover:opacity-100'}`}><img src={url} alt="" className="h-full w-full object-cover" /></button>)}</div>}
    </div>

    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="h-[100dvh] max-h-[100dvh] w-screen max-w-none rounded-none border-0 bg-black p-0 text-white sm:h-[90vh] sm:max-h-[90vh] sm:w-[92vw] sm:max-w-6xl sm:rounded-2xl">
        <DialogTitle className="sr-only">Galeria de {alt}</DialogTitle>
        <div className="relative flex h-full items-center justify-center overflow-hidden">
          <img src={clean[selected]} alt={`${alt} — fotografia ${selected + 1}`} className="max-h-full max-w-full object-contain" />
          <Button type="button" variant="secondary" size="icon" className="absolute right-3 top-3 rounded-full bg-black/55 text-white hover:bg-black/75" onClick={() => setOpen(false)} aria-label="Fechar"><X className="h-5 w-5" /></Button>
          {clean.length > 1 && <><Button type="button" variant="secondary" size="icon" className="absolute left-3 rounded-full bg-black/55 text-white hover:bg-black/75" onClick={() => move(-1)} aria-label="Anterior"><ChevronLeft className="h-5 w-5" /></Button><Button type="button" variant="secondary" size="icon" className="absolute right-3 rounded-full bg-black/55 text-white hover:bg-black/75" onClick={() => move(1)} aria-label="Seguinte"><ChevronRight className="h-5 w-5" /></Button></>}
          <div className="absolute bottom-4 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold backdrop-blur">{selected + 1} de {clean.length}</div>
        </div>
      </DialogContent>
    </Dialog>
  </>
}
