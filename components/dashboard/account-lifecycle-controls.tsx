'use client'

import { useState } from 'react'
import { Loader2, Power, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useModal } from '@/components/providers/modal-provider'
import { deactivateAccountAction, deleteOrRequestAccountDeletionAction } from '@/app/actions/account-lifecycle'

export function AccountLifecycleControls() {
  const { showConfirm, showAlert } = useModal()
  const [busy, setBusy] = useState<'deactivate' | 'delete' | null>(null)

  async function deactivate() {
    const confirmed = await showConfirm('Desativar conta?', 'A sessão será terminada e o teu perfil deixará de ter acesso ao dashboard até reativares a conta.', { confirmLabel: 'Desativar', destructive: true })
    if (!confirmed) return
    setBusy('deactivate')
    try { await deactivateAccountAction() }
    catch (error: any) { setBusy(null); showAlert('Erro', error?.message || 'Não foi possível desativar a conta.', 'error') }
  }

  async function remove() {
    const confirmed = await showConfirm('Eliminar conta?', 'Se não existir histórico transacional, a conta será eliminada definitivamente. Se existirem reservas, pagamentos ou subscrições, a conta será desativada e ficará marcada para eliminação controlada.', { confirmLabel: 'Eliminar conta', destructive: true })
    if (!confirmed) return
    setBusy('delete')
    try { await deleteOrRequestAccountDeletionAction() }
    catch (error: any) { setBusy(null); showAlert('Erro', error?.message || 'Não foi possível processar a eliminação da conta.', 'error') }
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-2xl border border-border p-4"><div className="flex items-start gap-3"><Power className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" /><div className="min-w-0"><p className="font-semibold">Desativar conta</p><p className="mt-1 text-sm text-muted-foreground">Reversível. Preserva dados e permite reativação após novo login.</p></div></div><Button type="button" variant="outline" onClick={deactivate} disabled={Boolean(busy)} className="mt-4 min-h-11 w-full">{busy === 'deactivate' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Desativar</Button></div>
      <div className="rounded-2xl border border-destructive/30 p-4"><div className="flex items-start gap-3"><Trash2 className="mt-0.5 h-5 w-5 shrink-0 text-destructive" /><div className="min-w-0"><p className="font-semibold text-destructive">Eliminar conta</p><p className="mt-1 text-sm text-muted-foreground">Eliminação imediata quando não há histórico transacional; caso contrário inicia eliminação controlada e desativa o acesso.</p></div></div><Button type="button" variant="destructive" onClick={remove} disabled={Boolean(busy)} className="mt-4 min-h-11 w-full">{busy === 'delete' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Eliminar conta</Button></div>
    </div>
  )
}
