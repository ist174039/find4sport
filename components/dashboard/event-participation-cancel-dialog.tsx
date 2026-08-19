'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { cancelEventParticipationAction } from '@/app/actions/events'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export function EventParticipationCancelDialog({ participantId, eventTitle, paid }: { participantId: string; eventTitle: string; paid: boolean }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function cancelParticipation() {
    setError(null)
    startTransition(async () => {
      try {
        await cancelEventParticipationAction(participantId)
        setOpen(false)
        router.refresh()
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Não foi possível cancelar a inscrição.')
      }
    })
  }

  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger render={<Button type="button" variant="outline" className="text-destructive hover:text-destructive" />}>Cancelar</DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Cancelar inscrição?</DialogTitle>
        <DialogDescription>
          {paid
            ? `A inscrição em “${eventTitle}” será cancelada e o reembolso integral será solicitado ao Stripe. Esta operação não deve ser repetida.`
            : `A inscrição em “${eventTitle}” será cancelada e a vaga ficará novamente disponível.`}
        </DialogDescription>
      </DialogHeader>
      {error && <p className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}
      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" disabled={pending} />}>Manter inscrição</DialogClose>
        <Button type="button" variant="destructive" disabled={pending} onClick={cancelParticipation}>
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {paid ? 'Cancelar e reembolsar' : 'Cancelar inscrição'}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
}
