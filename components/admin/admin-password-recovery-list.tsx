'use client'

import { KeyRound } from 'lucide-react'
import { sendAdministratorPasswordRecoveryAction } from '@/app/admin/(dashboard)/administradores/actions'
import { Button } from '@/components/ui/button'
import { useModal } from '@/components/providers/modal-provider'

export function AdminPasswordRecoveryList({ rows }: { rows: Array<{ id: string; email: string }> }) {
  const { showAlert, showConfirm } = useModal()
  async function send(id: string, email: string) {
    if (!await showConfirm('Recuperar palavra-passe', `Enviar instruções de recuperação para ${email}?`, { confirmLabel: 'Enviar email' })) return
    try { await sendAdministratorPasswordRecoveryAction(id); showAlert('Email enviado', 'As instruções de recuperação foram enviadas.', 'success') }
    catch (error) { showAlert('Erro', error instanceof Error ? error.message : 'Não foi possível enviar o email.', 'error') }
  }
  return <section className="rounded-2xl border bg-card p-4"><h2 className="font-semibold">Recuperação de palavra-passe</h2><p className="mt-1 text-sm text-muted-foreground">Envie um link seguro de recuperação para qualquer administrador.</p><div className="mt-4 flex flex-wrap gap-2">{rows.map(row => <Button key={row.id} variant="outline" onClick={() => void send(row.id, row.email)}><KeyRound className="mr-2 h-4 w-4" />{row.email}</Button>)}</div></section>
}
