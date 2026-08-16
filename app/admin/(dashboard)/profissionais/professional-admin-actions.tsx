'use client'

import { useState } from 'react'
import { Loader2, UserPlus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { adminCreateProfessional, adminUpdateProfessional } from '@/app/actions/auth'
import { useModal } from '@/components/providers/modal-provider'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function CreateProfessionalButton() {
  const router = useRouter()
  const { showAlert } = useModal()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', email: '' })

  const submit = async () => {
    if (!form.name.trim() || !form.email.trim()) return showAlert('Dados em falta', 'Nome e email são obrigatórios.', 'error')
    setSaving(true)
    try {
      const result = await adminCreateProfessional({ full_name: form.name.trim(), email: form.email.trim(), professional_name: form.name.trim(), public_slug: `convidado-${crypto.randomUUID().slice(0, 8)}` })
      if (result.error) throw new Error(result.error)
      setOpen(false); setForm({ name: '', email: '' }); router.refresh()
      showAlert('Profissional criado', 'A identidade e o perfil foram criados.', 'success')
    } catch (error) { showAlert('Não foi possível criar', error instanceof Error ? error.message : 'Erro inesperado.', 'error') }
    finally { setSaving(false) }
  }

  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger render={<Button className="min-h-11"><UserPlus className="mr-2 h-4 w-4" />Criar profissional</Button>} /><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Novo profissional</DialogTitle></DialogHeader><div className="grid gap-4 pt-2"><label className="space-y-2"><Label>Nome *</Label><Input value={form.name} onChange={e=>setForm(v=>({...v,name:e.target.value}))} className="min-h-11 text-base" /></label><label className="space-y-2"><Label>Email *</Label><Input type="email" value={form.email} onChange={e=>setForm(v=>({...v,email:e.target.value}))} className="min-h-11 text-base" /></label><Button onClick={submit} disabled={saving} className="min-h-11">{saving&&<Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Criar identidade e perfil</Button></div></DialogContent></Dialog>
}

export function ProfessionalStateActions({ id, name, isVerified, status }: { id: string; name: string; isVerified: boolean; status: string | null }) {
  const router = useRouter()
  const { showAlert, showConfirm } = useModal()
  const [busy, setBusy] = useState(false)

  const update = async (input: { status: 'active'|'pending'|'suspended'|'rejected'; is_verified: boolean }, success: string) => {
    setBusy(true)
    try {
      const result = await adminUpdateProfessional(id, input)
      if (result.error) throw new Error(result.error)
      router.refresh(); showAlert(success, success === 'Profissional aprovado' ? 'O perfil está ativo e verificado.' : 'O estado do perfil foi atualizado.', 'success')
    } catch (error) { showAlert('Erro', error instanceof Error ? error.message : 'Não foi possível atualizar o perfil.', 'error') }
    finally { setBusy(false) }
  }

  if (status === 'suspended') return <Button variant="outline" disabled={busy} className="min-h-10" onClick={()=>update({status:'active',is_verified:true},'Profissional reativado')}>{busy&&<Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Reativar</Button>
  if (!isVerified || status !== 'active') return <Button disabled={busy} className="min-h-10" onClick={()=>update({status:'active',is_verified:true},'Profissional aprovado')}>{busy&&<Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Aprovar</Button>
  return <Button variant="outline" disabled={busy} className="min-h-10 text-destructive" onClick={async()=>{if(await showConfirm('Suspender profissional',`Suspender “${name}”?`,{confirmLabel:'Suspender',destructive:true})) await update({status:'suspended',is_verified:false},'Profissional suspenso')}}>Suspender</Button>
}
