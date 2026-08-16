'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createService, updateService, deleteService } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Pencil, Trash2, Loader2, Clock, Euro } from 'lucide-react'
import type { Service } from '@/lib/types'

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [professionalId, setProfessionalId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', description: '', duration_minutes: 60, price: '', price_unit: 'sessao', modality: 'presencial' })

  useEffect(() => {
    async function fetchServices() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data: professional } = await supabase.from('professionals').select('id').eq('user_id', user.id).single()
      if (professional) {
        setProfessionalId(professional.id)
        const { data } = await supabase.from('services').select('*').eq('professional_id', professional.id).order('created_at', { ascending: false })
        if (data) setServices(data)
      }
      setLoading(false)
    }
    fetchServices()
  }, [])

  const resetForm = () => {
    setFormData({ name: '', description: '', duration_minutes: 60, price: '', price_unit: 'sessao', modality: 'presencial' })
    setEditingService(null)
    setErrorMessage('')
  }

  const openEditDialog = (service: Service) => {
    setEditingService(service)
    setFormData({ name: service.name, description: service.description || '', duration_minutes: service.duration_minutes || 60, price: service.price ? String(service.price) : '', price_unit: service.price_unit || 'sessao', modality: service.modality || 'presencial' })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!professionalId) return
    setSaving(true); setErrorMessage('')
    try {
      const input = { name: formData.name, description: formData.description || null, duration_minutes: formData.duration_minutes, price: formData.price ? parseFloat(formData.price) : null, price_unit: formData.price_unit, modality: formData.modality }
      if (editingService) {
        const data = await updateService(editingService.id, input)
        setServices(prev => prev.map(s => s.id === editingService.id ? data as Service : s))
      } else {
        const data = await createService(input)
        setServices(prev => [data as Service, ...prev])
      }
      setDialogOpen(false); resetForm()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível guardar o serviço')
    } finally { setSaving(false) }
  }

  const handleDelete = async (serviceId: string) => {
    if (!confirm('Tem certeza que deseja eliminar este servico?')) return
    try { await deleteService(serviceId); setServices(prev => prev.filter(s => s.id !== serviceId)) }
    catch (error) { setErrorMessage(error instanceof Error ? error.message : 'Não foi possível eliminar o serviço') }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  if (!professionalId) return <div className="space-y-6"><div><h1 className="text-3xl font-bold">Servicos</h1><p className="text-muted-foreground">Gerir os servicos que oferece</p></div><Card><CardContent className="pt-6"><p className="text-muted-foreground text-center">Precisa de criar um perfil profissional antes de adicionar servicos.</p></CardContent></Card></div>

  return <div className="space-y-6">
    <div className="flex items-center justify-between"><div><h1 className="text-3xl font-bold">Servicos</h1><p className="text-muted-foreground">Gerir os servicos que oferece</p></div>
      <Dialog open={dialogOpen} onOpenChange={open => { setDialogOpen(open); if (!open) resetForm() }}>
        <DialogTrigger render={<Button className="gap-2"><Plus className="h-4 w-4" />Novo Servico</Button>} />
        <DialogContent className="sm:max-w-[500px]"><DialogHeader><DialogTitle>{editingService ? 'Editar Servico' : 'Novo Servico'}</DialogTitle><DialogDescription>{editingService ? 'Edite as informacoes do servico' : 'Adicione um novo servico ao seu perfil'}</DialogDescription></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{errorMessage}</div>}
            <div className="space-y-2"><Label htmlFor="name">Nome do servico *</Label><Input id="name" value={formData.name} onChange={e => setFormData(p => ({...p,name:e.target.value}))} placeholder="Ex: Treino Personalizado" required /></div>
            <div className="space-y-2"><Label htmlFor="description">Descricao</Label><Textarea id="description" value={formData.description} onChange={e => setFormData(p => ({...p,description:e.target.value}))} placeholder="Descreva o servico..." rows={3} /></div>
            <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Duracao (minutos)</Label><Select value={String(formData.duration_minutes)} onValueChange={v => setFormData(p => ({...p,duration_minutes:Number(v)}))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{[30,45,60,90,120].map(v => <SelectItem key={v} value={String(v)}>{v} min</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Modalidade</Label><Select value={formData.modality} onValueChange={v => setFormData(p => ({...p,modality:v || ''}))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="presencial">Presencial</SelectItem><SelectItem value="online">Online</SelectItem><SelectItem value="ambos">Ambos</SelectItem></SelectContent></Select></div></div>
            <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="price">Preco (EUR)</Label><Input id="price" type="number" step="0.01" min="0" value={formData.price} onChange={e => setFormData(p => ({...p,price:e.target.value}))} placeholder="0.00" /></div>
              <div className="space-y-2"><Label>Unidade</Label><Select value={formData.price_unit} onValueChange={v => setFormData(p => ({...p,price_unit:v || ''}))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="sessao">Por sessao</SelectItem><SelectItem value="hora">Por hora</SelectItem><SelectItem value="mes">Por mes</SelectItem><SelectItem value="pack">Por pack</SelectItem></SelectContent></Select></div></div>
            {Number(formData.price) > 0 && <div className="bg-primary/5 text-primary border border-primary/20 p-3 rounded-md text-sm"><strong>Taxas aplicáveis:</strong> a comissão e a service fee são determinadas pelo plano ativo.</div>}
            <DialogFooter><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button><Button type="submit" disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{editingService ? 'Guardar' : 'Criar'}</Button></DialogFooter>
          </form></DialogContent></Dialog></div>
    {errorMessage && !dialogOpen && <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{errorMessage}</div>}
    {services.length === 0 ? <Card><CardContent className="pt-6"><div className="text-center py-8"><h3 className="text-lg font-semibold mb-2">Sem servicos</h3><p className="text-muted-foreground mb-4">Ainda nao adicionou nenhum servico ao seu perfil.</p><Button onClick={() => setDialogOpen(true)} className="gap-2"><Plus className="h-4 w-4" />Adicionar primeiro servico</Button></div></CardContent></Card> :
      <div className="grid gap-4 md:grid-cols-2">{services.map(service => <Card key={service.id}><CardHeader className="pb-2"><div className="flex items-start justify-between"><CardTitle className="text-lg">{service.name}</CardTitle><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => openEditDialog(service)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(service.id)}><Trash2 className="h-4 w-4" /></Button></div></div>{service.description && <CardDescription>{service.description}</CardDescription>}</CardHeader><CardContent><div className="flex items-center gap-4 text-sm">{service.duration_minutes && <div className="flex items-center gap-1 text-muted-foreground"><Clock className="h-4 w-4" />{service.duration_minutes} min</div>}{service.price && <div className="flex items-center gap-1 font-medium text-primary"><Euro className="h-4 w-4" />{service.price.toFixed(2)} / {service.price_unit || 'sessao'}</div>}</div></CardContent></Card>)}</div>}
  </div>
}
