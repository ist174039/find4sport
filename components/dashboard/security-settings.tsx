'use client'

import { useState } from 'react'
import { KeyRound, Loader2 } from 'lucide-react'
import { updatePasswordAction } from '@/app/dashboard/definicoes/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useModal } from '@/components/providers/modal-provider'

export function SecuritySettings() {
  const { showAlert } = useModal()
  const [saving, setSaving] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    try {
      await updatePasswordAction(password, confirmPassword)
      setPassword('')
      setConfirmPassword('')
      showAlert('Password atualizada', 'A nova password foi guardada.', 'success')
    } catch (error) {
      showAlert('Erro', error instanceof Error ? error.message : 'Não foi possível alterar a password.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label htmlFor="new-password">Nova password</Label><Input id="new-password" type="password" autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} className="min-h-11 text-base" required minLength={10} /></div>
        <div className="space-y-2"><Label htmlFor="confirm-password">Confirmar password</Label><Input id="confirm-password" type="password" autoComplete="new-password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} className="min-h-11 text-base" required minLength={10} /></div>
      </div>
      <p className="text-xs text-muted-foreground">Mínimo de 10 caracteres, incluindo pelo menos uma letra e um número.</p>
      <Button type="submit" disabled={saving} className="min-h-11 w-full sm:w-auto">{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}Alterar password</Button>
    </form>
  )
}
