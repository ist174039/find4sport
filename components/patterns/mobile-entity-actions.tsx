'use client'

import { Children, type ReactNode, useState } from 'react'
import { MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export function MobileEntityActions({ children }: { children: ReactNode }) {
  const actions = Children.toArray(children).filter(Boolean)
  const primary = actions[0]
  const secondary = actions.slice(1)
  const [open, setOpen] = useState(false)
  if (!primary) return null

  return (
    <>
      <div className="h-16 md:hidden" aria-hidden />
      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-40 border-t border-border bg-background/96 px-3 py-2.5 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-[minmax(0,1fr)_auto] gap-2 [&>*]:min-h-11 [&>*]:min-w-0">
          <div className="min-w-0 [&>*]:w-full">{primary}</div>
          {secondary.length > 0 && <Button type="button" variant="outline" className="h-11 w-12 rounded-xl px-0" onClick={() => setOpen(true)} aria-label="Mais ações"><MoreHorizontal className="h-5 w-5" /></Button>}
        </div>
      </div>
      {secondary.length > 0 && <Dialog open={open} onOpenChange={setOpen}><DialogContent className="bottom-[calc(4rem+env(safe-area-inset-bottom))] top-auto translate-y-0 rounded-b-none rounded-t-3xl md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:rounded-2xl"><DialogHeader><DialogTitle>Mais ações</DialogTitle></DialogHeader><div className="grid gap-2 pt-2 [&>*]:min-h-11 [&>*]:w-full">{secondary}</div></DialogContent></Dialog>}
    </>
  )
}
