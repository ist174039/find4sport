'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Flag, Loader2, AlertCircle, Check } from 'lucide-react'

const reportReasons = [
  { value: 'spam', label: 'Spam ou publicidade' },
  { value: 'inappropriate', label: 'Conteúdo inapropriado' },
  { value: 'fake', label: 'Informação falsa' },
  { value: 'offensive', label: 'Linguagem ofensiva' },
  { value: 'scam', label: 'Burla ou fraude' },
  { value: 'other', label: 'Outro motivo' },
]

type ReportModalProps = {
  reviewId?: string
  professionalId?: string
  spaceId?: string
  eventId?: string
  commentId?: string
  children?: React.ReactNode
}

export function ReportModal({ reviewId, professionalId, spaceId, eventId, commentId, children }: ReportModalProps) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reason) return
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      const { error: flagError } = await supabase.from('moderation_flags').insert({
        review_id: reviewId || null,
        professional_id: professionalId || null,
        space_id: spaceId || null,
        event_id: eventId || null,
        comment_id: commentId || null,
        reason,
        details: details || null,
        status: 'pending',
        reported_by: user?.id || null,
      })

      if (flagError) throw flagError
      setSuccess(true)
      setTimeout(() => { setOpen(false); setSuccess(false); setReason(''); setDetails('') }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar denúncia')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button variant="ghost" size="sm"><Flag className="mr-1 h-3 w-3" /> Denunciar</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Denunciar Conteúdo</DialogTitle>
          <DialogDescription>
            Ajude-nos a manter a comunidade segura. Indique o motivo da denúncia.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center py-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
              <Check className="h-6 w-6 text-green-500" />
            </div>
            <p className="font-medium">Denúncia enviada!</p>
            <p className="text-sm text-muted-foreground">A nossa equipa irá analisar o conteúdo.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"><AlertCircle className="h-4 w-4" />{error}</div>}

            <div className="space-y-2">
              <Label>Motivo *</Label>
              <div className="grid grid-cols-1 gap-2">
                {reportReasons.map((r) => (
                  <label key={r.value} className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm hover:bg-accent">
                    <input type="radio" name="reason" value={r.value} checked={reason === r.value} onChange={() => setReason(r.value)} className="accent-primary" />
                    {r.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Detalhes adicionais (opcional)</Label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Descreva o motivo da denúncia..."
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!reason || loading}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> A enviar...</> : 'Enviar Denúncia'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
