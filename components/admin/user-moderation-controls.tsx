'use client'

import { useState } from 'react'
import { Ban, CheckCircle2, Clock3 } from 'lucide-react'
import { moderateUserAction } from '@/app/admin/(dashboard)/utilizadores/actions'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useModal } from '@/components/providers/modal-provider'

export function UserModerationControls({ userId, initialStatus }: { userId: string; initialStatus: string }) {
  const { showAlert } = useModal()
  const [status, setStatus] = useState(initialStatus || 'active')
  const [target, setTarget] = useState<'suspended' | 'blocked' | null>(null)
  const [reason, setReason] = useState('')
  const [days, setDays] = useState(7)
  const [busy, setBusy] = useState(false)
  async function apply(next: 'active' | 'suspended' | 'blocked') {
    setBusy(true)
    try { await moderateUserAction(userId, next, reason, days); setStatus(next); setTarget(null); setReason(''); showAlert('Estado atualizado', next === 'active' ? 'A conta foi reativada.' : 'A restrição já está em vigor.', 'success') }
    catch (error) { showAlert('Erro', error instanceof Error ? error.message : 'Não foi possível alterar a conta.', 'error') }
    finally { setBusy(false) }
  }
  if (status !== 'active') return <Button size="sm" variant="outline" disabled={busy} onClick={() => void apply('active')}><CheckCircle2 className="mr-2 h-4 w-4" />Reativar</Button>
  return <><Button size="sm" variant="outline" onClick={() => setTarget('suspended')}><Clock3 className="mr-2 h-4 w-4" />Suspender</Button><Button size="sm" variant="outline" className="text-destructive" onClick={() => setTarget('blocked')}><Ban className="mr-2 h-4 w-4" />Bloquear</Button><Dialog open={Boolean(target)} onOpenChange={open => !open && setTarget(null)}><DialogContent><DialogHeader><DialogTitle>{target === 'blocked' ? 'Bloquear utilizador' : 'Suspender utilizador'}</DialogTitle></DialogHeader><div className="space-y-4"><div><Label>Justificação obrigatória</Label><Textarea className="mt-2 min-h-28" value={reason} onChange={event => setReason(event.target.value)} maxLength={2000} /></div>{target === 'suspended' && <div><Label>Duração (dias)</Label><Input className="mt-2" type="number" min={1} max={365} value={days} onChange={event => setDays(Number(event.target.value))} /></div>}<Button className="w-full" variant={target === 'blocked' ? 'destructive' : 'default'} disabled={busy || reason.trim().length < 10} onClick={() => target && void apply(target)}>Confirmar</Button></div></DialogContent></Dialog></>
}
