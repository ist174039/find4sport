'use client'

import { useState } from 'react'
import { ArrowRight, ArrowLeft, Image as ImageIcon, MapPin, Tag, Users, CheckCircle2, Trophy, Loader2, MessageSquare, Heart, ShieldCheck } from 'lucide-react'
import { useModal } from '@/components/providers/modal-provider'
import { useRouter } from 'next/navigation'
import { createCommunityAction } from '@/app/actions/community'

export function CreateCommunityWizard() {
  const { showAlert } = useModal()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '', modality: 'Futebol', privacy: 'pub', city: '', postingPolicy: 'members' as 'members' | 'reactions_only' | 'admin_only' })
  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value })
  const nextStep = () => { if (step === 1 && (formData.name.trim().length < 3 || formData.description.trim().length < 10)) { showAlert('Dados incompletos', 'Indica um nome e uma descrição com pelo menos 10 caracteres.', 'info'); return } setStep(s => Math.min(s + 1, 3)) }
  const prevStep = () => setStep(s => Math.max(s - 1, 1))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try { const result = await createCommunityAction(formData); showAlert('Comunidade criada', 'A comunidade já está disponível.', 'success'); router.push(`/comunidades/${result.id}`) }
    catch (err: any) { showAlert('Não foi possível criar a comunidade', err.message || 'Erro ao criar comunidade.', 'error') }
    finally { setLoading(false) }
  }

  const rules = [
    { value: 'members', icon: MessageSquare, title: 'Todos publicam', text: 'Todos os membros podem criar publicações, comentar e colocar gosto.' },
    { value: 'reactions_only', icon: Heart, title: 'Membros só reagem', text: 'Administradores publicam. Os restantes membros podem acompanhar e colocar gosto.' },
    { value: 'admin_only', icon: ShieldCheck, title: 'Só administradores', text: 'Publicação e discussão ficam reservadas à equipa de administração.' },
  ] as const

  return <div className="min-h-screen bg-background px-4 py-6 sm:py-10"><div className="mx-auto max-w-3xl">
    <div className="mb-8"><h1 className="text-center text-2xl font-bold sm:text-3xl">Criar comunidade</h1><p className="mt-2 text-center text-sm text-muted-foreground">Define identidade, acesso e regras antes de publicar.</p><div className="mt-6 flex items-center gap-2">{[1,2,3].map(i => <div key={i} className={`h-2 flex-1 rounded-full ${step >= i ? 'bg-primary' : 'bg-muted'}`} />)}</div></div>
    <form onSubmit={handleSubmit} className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      {step === 1 && <div className="space-y-6 p-5 sm:p-8"><div className="text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Trophy className="h-7 w-7" /></div><h2 className="mt-4 text-xl font-bold">Identidade</h2></div><div><label className="mb-2 block text-sm font-semibold">Nome</label><input name="name" value={formData.name} onChange={handleChange} className="min-h-11 w-full rounded-xl border border-border bg-background px-4" placeholder="Ex: Lisbon Padel Club" required /></div><div><label className="mb-2 block text-sm font-semibold">Descrição</label><textarea name="description" value={formData.description} onChange={handleChange} rows={5} className="w-full rounded-xl border border-border bg-background px-4 py-3" placeholder="Objetivo, público e tipo de atividade da comunidade..." required /></div></div>}
      {step === 2 && <div className="space-y-6 p-5 sm:p-8"><div className="text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Tag className="h-7 w-7" /></div><h2 className="mt-4 text-xl font-bold">Descoberta e acesso</h2></div><div className="grid gap-4 sm:grid-cols-2"><div><label className="mb-2 block text-sm font-semibold">Modalidade principal</label><input name="modality" value={formData.modality} onChange={handleChange} className="min-h-11 w-full rounded-xl border border-border bg-background px-4" placeholder="Ex: Padel" /></div><div><label className="mb-2 block text-sm font-semibold">Localização base</label><div className="relative"><MapPin className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" /><input name="city" value={formData.city} onChange={handleChange} className="min-h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4" placeholder="Lisboa, Portugal" /></div></div></div><div><label className="mb-2 block text-sm font-semibold">Privacidade</label><div className="grid gap-3 sm:grid-cols-2">{[['pub','Pública','Adesão imediata.'],['priv','Privada','Adesão sujeita a aprovação.']].map(([value,title,text]) => <label key={value} className={`cursor-pointer rounded-xl border p-4 ${formData.privacy===value?'border-primary bg-primary/5':'border-border'}`}><input type="radio" name="privacy" value={value} checked={formData.privacy===value} onChange={handleChange} className="mr-2" /><span className="font-semibold">{title}</span><p className="mt-1 text-xs text-muted-foreground">{text}</p></label>)}</div></div><div><label className="mb-2 block text-sm font-semibold">Quem pode publicar?</label><div className="grid gap-3">{rules.map(rule => { const Icon=rule.icon; return <label key={rule.value} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${formData.postingPolicy===rule.value?'border-primary bg-primary/5':'border-border'}`}><input type="radio" name="postingPolicy" value={rule.value} checked={formData.postingPolicy===rule.value} onChange={handleChange} className="mt-1" /><Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><div><p className="font-semibold">{rule.title}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{rule.text}</p></div></label> })}</div></div></div>}
      {step === 3 && <div className="space-y-6 p-5 sm:p-8"><div className="text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><ImageIcon className="h-7 w-7" /></div><h2 className="mt-4 text-xl font-bold">Confirmar</h2></div><div className="overflow-hidden rounded-2xl border border-border"><div className="h-28 bg-gradient-to-r from-primary/20 via-muted to-secondary/20" /><div className="p-5"><div className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /><h3 className="text-lg font-bold">{formData.name || 'Nome da comunidade'}</h3></div><p className="mt-2 text-sm text-muted-foreground">{formData.description}</p><div className="mt-4 grid gap-2 text-xs sm:grid-cols-3"><span className="rounded-lg bg-muted px-3 py-2">{formData.modality || 'Sem modalidade'}</span><span className="rounded-lg bg-muted px-3 py-2">{formData.privacy==='priv'?'Privada':'Pública'}</span><span className="rounded-lg bg-muted px-3 py-2">{rules.find(r=>r.value===formData.postingPolicy)?.title}</span></div></div></div></div>}
      <div className="flex items-center justify-between border-t border-border bg-muted/20 p-4 sm:p-5">{step>1?<button type="button" onClick={prevStep} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold"><ArrowLeft className="h-4 w-4" />Anterior</button>:<span />}{step<3?<button type="button" onClick={nextStep} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground">Continuar<ArrowRight className="h-4 w-4" /></button>:<button type="submit" disabled={loading} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground disabled:opacity-60">{loading?<Loader2 className="h-4 w-4 animate-spin" />:<CheckCircle2 className="h-4 w-4" />}Criar comunidade</button>}</div>
    </form>
  </div></div>
}
