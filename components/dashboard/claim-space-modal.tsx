'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2, ShieldCheck } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useModal } from '@/components/providers/modal-provider'
import { submitSpaceClaimAction } from '@/app/dashboard/espaco/actions'

interface ClaimSpaceModalProps {
  isOpen: boolean
  onClose: () => void
  space: { id: string; name: string; address?: string | null } | null
  onSuccess: () => void
}

export function ClaimSpaceModal({ isOpen, onClose, space, onSuccess }: ClaimSpaceModalProps) {
  const { showAlert } = useModal()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function submit() {
    if (!space) return
    setLoading(true)
    try {
      await submitSpaceClaimAction(space.id, message)
      setSubmitted(true)
    } catch (error) {
      showAlert('Não foi possível submeter', error instanceof Error ? error.message : 'Erro inesperado.', 'error')
    } finally { setLoading(false) }
  }

  function close() {
    onClose()
    setSubmitted(false)
    setMessage('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && close()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" />Reivindicar espaço</DialogTitle>
          <DialogDescription>{submitted ? 'Pedido registado.' : 'Explique a sua relação com o espaço. A equipa administrativa irá validar o pedido.'}</DialogDescription>
        </DialogHeader>

        {!submitted && space ? (
          <div className="space-y-5 py-2">
            <div className="rounded-xl border bg-muted/30 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Espaço</p><p className="mt-1 font-semibold">{space.name}</p>{space.address && <p className="mt-1 text-xs text-muted-foreground">{space.address}</p>}</div>
            <div className="space-y-2"><Label htmlFor="claim-message">Justificação</Label><Textarea id="claim-message" value={message} onChange={event => setMessage(event.target.value)} rows={5} maxLength={3000} placeholder="Ex.: Sou o responsável legal pelo recinto e pretendo gerir a sua presença na FIND4SPORT..." /><p className="text-right text-xs text-muted-foreground">{message.length}/3000</p></div>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs leading-relaxed text-muted-foreground">Documentos comprovativos não são aceites neste formulário até existir armazenamento privado validado. A equipa poderá solicitar documentação por um canal seguro durante a análise.</div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button variant="outline" onClick={close} disabled={loading}>Cancelar</Button><Button onClick={() => void submit()} disabled={loading || message.trim().length < 20}>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Submeter pedido</Button></div>
          </div>
        ) : submitted ? (
          <div className="flex flex-col items-center py-8 text-center"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600"><CheckCircle2 className="h-8 w-8" /></div><h3 className="mt-4 text-lg font-bold">Pedido submetido</h3><p className="mt-2 max-w-xs text-sm text-muted-foreground">A reivindicação está pendente de análise administrativa.</p><Button className="mt-6" onClick={() => { close(); onSuccess() }}>Concluir</Button></div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
