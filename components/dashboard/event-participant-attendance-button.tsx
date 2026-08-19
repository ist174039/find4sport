'use client'

import { useTransition } from 'react'
import { Check, Loader2, RotateCcw } from 'lucide-react'
import { updateEventParticipantAttendanceAction } from '@/app/actions/events'
import { Button } from '@/components/ui/button'
import { useModal } from '@/components/providers/modal-provider'

export function EventParticipantAttendanceButton({ eventId, participantId, attended }: { eventId: string; participantId: string; attended: boolean }) {
  const [pending, startTransition] = useTransition()
  const { showAlert } = useModal()

  function update() {
    startTransition(async () => {
      try {
        await updateEventParticipantAttendanceAction(eventId, participantId, !attended)
        showAlert(attended ? 'Presença removida' : 'Presença registada', attended ? 'O participante voltou ao estado confirmado.' : 'A participação foi marcada como realizada.', 'success')
      } catch (error) {
        showAlert('Não foi possível atualizar', error instanceof Error ? error.message : 'Erro inesperado.', 'error')
      }
    })
  }

  return <Button type="button" variant={attended ? 'outline' : 'default'} size="sm" disabled={pending} onClick={update}>
    {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : attended ? <RotateCcw className="mr-2 h-4 w-4" /> : <Check className="mr-2 h-4 w-4" />}
    {attended ? 'Desmarcar presença' : 'Marcar presença'}
  </Button>
}
