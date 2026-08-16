'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Building2, Check, Loader2, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { registerSpaceInitial } from '@/app/actions/register'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

function safeNext(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/dashboard'
  return value
}

export default function RegisterSpacePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = safeNext(searchParams.get('next'))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', description: '', address: '', phone: '', email: '', website: '', amenities: '' })

  useEffect(() => {
    void (async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace(`/auth/registar?type=venue_manager&next=${encodeURIComponent(next)}`)
        return
      }
      const { data: existing } = await supabase.from('sport_spaces').select('id').eq('owner_user_id', user.id).limit(1).maybeSingle()
      if (existing) {
        router.replace('/dashboard/espaco')
        return
      }
      setUserId(user.id)
      setFormData(prev => ({ ...prev, email: user.email || '' }))
      setLoading(false)
    })()
  }, [next, router])

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!userId || saving) return
    setError(null)
    if (formData.name.trim().length < 2) return setError('Indica o nome do espaço.')
    if (formData.address.trim().length < 5) return setError('Indica uma morada válida.')

    setSaving(true)
    try {
      const result = await registerSpaceInitial(userId, {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        address: formData.address.trim(),
        phone: formData.phone.trim() || null,
        email: formData.email.trim() || null,
        website: formData.website.trim() || null,
        amenities: formData.amenities ? formData.amenities.split(',').map(item => item.trim()).filter(Boolean) : [],
        status: 'pending',
      }, formData.name.trim())
      if (result.error) throw new Error(result.error)
      const supabase = createClient()
      await supabase.auth.updateUser({ data: { type: 'venue_manager' } })
      router.replace(next === '/dashboard' ? '/dashboard' : next)
    } catch (err: any) {
      setError(err?.message || 'Não foi possível registar o espaço.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>

  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-muted/15 px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6"><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Onboarding · Espaço</p><h1 className="mt-2 text-3xl font-black tracking-tight">Configura o teu espaço</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">A conta já está criada. Agora só precisamos da informação necessária para publicar e validar o espaço.</p></div>
        <Card className="overflow-hidden rounded-3xl"><CardHeader className="border-b border-border bg-primary/5"><div className="flex items-start gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Building2 className="h-5 w-5" /></div><div><CardTitle>Informação do espaço</CardTitle><CardDescription className="mt-1">Podes gerir salas, horários, imagens e reservas depois no dashboard.</CardDescription></div></div></CardHeader><CardContent className="p-5 sm:p-7"><form onSubmit={submit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2"><label className="space-y-2"><Label>Nome do espaço *</Label><Input value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="Ex.: Clube Padel Lisboa" className="min-h-11" /></label><label className="space-y-2"><Label>E-mail da conta</Label><Input value={formData.email} readOnly className="min-h-11 bg-muted/40" /></label></div>
          <label className="block space-y-2"><Label>Descrição</Label><Textarea rows={4} value={formData.description} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} placeholder="O que distingue este espaço? Modalidades, instalações e público." /></label>
          <label className="block space-y-2"><Label>Morada *</Label><div className="relative"><MapPin className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" /><Input value={formData.address} onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))} placeholder="Rua, número, localidade" className="min-h-11 pl-9" /></div></label>
          <div className="grid gap-4 sm:grid-cols-2"><label className="space-y-2"><Label>Telefone</Label><Input value={formData.phone} onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))} inputMode="tel" className="min-h-11" /></label><label className="space-y-2"><Label>Website</Label><Input value={formData.website} onChange={e => setFormData(prev => ({ ...prev, website: e.target.value }))} placeholder="https://..." className="min-h-11" /></label></div>
          <label className="block space-y-2"><Label>Comodidades</Label><Input value={formData.amenities} onChange={e => setFormData(prev => ({ ...prev, amenities: e.target.value }))} placeholder="Balneários, estacionamento, cafetaria…" className="min-h-11" /><p className="text-xs text-muted-foreground">Separa por vírgulas. Isto será convertido numa lista estruturada.</p></label>
          {error && <div role="alert" className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
          <div className="rounded-2xl border border-border bg-muted/20 p-4 text-sm"><p className="flex items-center gap-2 font-semibold"><Check className="h-4 w-4 text-primary" />Depois deste passo</p><p className="mt-1 text-muted-foreground">O espaço fica pendente/ativo conforme a política de aprovação. Fotografias, campos/salas, preços e disponibilidade são geridos no dashboard.</p></div>
          <Button type="submit" disabled={saving} className="min-h-12 w-full rounded-xl text-sm font-bold">{saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />A guardar…</> : 'Concluir configuração'}</Button>
        </form></CardContent></Card>
      </div>
    </main>
  )
}
