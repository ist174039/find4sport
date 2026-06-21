'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Pencil, Trash2, Loader2, Clock, Euro } from 'lucide-react'
import type { Service } from '@/lib/types'

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [professionalId, setProfessionalId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration_minutes: 60,
    price: '',
    price_unit: 'sessao',
    modality: 'presencial',
  })

  useEffect(() => {
    async function fetchServices() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      const { data: professional } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (professional) {
        setProfessionalId(professional.id)
        
        const { data: servicesData } = await supabase
          .from('services')
          .select('*')
          .eq('professional_id', professional.id)
          .order('created_at', { ascending: false })

        if (servicesData) setServices(servicesData)
      }

      setLoading(false)
    }

    fetchServices()
  }, [])

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      duration_minutes: 60,
      price: '',
      price_unit: 'sessao',
      modality: 'presencial',
    })
    setEditingService(null)
  }

  const openEditDialog = (service: Service) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      description: service.description || '',
      duration_minutes: service.duration_minutes || 60,
      price: service.price ? String(service.price) : '',
      price_unit: service.price_unit || 'sessao',
      modality: service.modality || 'presencial',
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!professionalId) return

    setSaving(true)
    const supabase = createClient()

    try {
      const serviceData = {
        professional_id: professionalId,
        name: formData.name,
        description: formData.description || null,
        duration_minutes: formData.duration_minutes,
        price: formData.price ? parseFloat(formData.price) : null,
        price_unit: formData.price_unit,
        modality: formData.modality,
        is_active: true,
      }

      if (editingService) {
        const { data, error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', editingService.id)
          .select()
          .single()

        if (error) throw error
        setServices((prev) =>
          prev.map((s) => (s.id === editingService.id ? data : s))
        )
      } else {
        const { data, error } = await supabase
          .from('services')
          .insert(serviceData)
          .select()
          .single()

        if (error) throw error
        setServices((prev) => [data, ...prev])
      }

      setDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error saving service:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (serviceId: string) => {
    if (!confirm('Tem certeza que deseja eliminar este servico?')) return

    const supabase = createClient()
    const { error } = await supabase.from('services').delete().eq('id', serviceId)

    if (!error) {
      setServices((prev) => prev.filter((s) => s.id !== serviceId))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!professionalId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Servicos</h1>
          <p className="text-muted-foreground">Gerir os servicos que oferece</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">
              Precisa de criar um perfil profissional antes de adicionar servicos.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Servicos</h1>
          <p className="text-muted-foreground">Gerir os servicos que oferece</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Servico
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingService ? 'Editar Servico' : 'Novo Servico'}
              </DialogTitle>
              <DialogDescription>
                {editingService
                  ? 'Edite as informacoes do servico'
                  : 'Adicione um novo servico ao seu perfil'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do servico *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Treino Personalizado"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descricao</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva o servico..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duracao (minutos)</Label>
                  <Select
                    value={String(formData.duration_minutes)}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, duration_minutes: Number(value) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 min</SelectItem>
                      <SelectItem value="45">45 min</SelectItem>
                      <SelectItem value="60">60 min</SelectItem>
                      <SelectItem value="90">90 min</SelectItem>
                      <SelectItem value="120">120 min</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="modality">Modalidade</Label>
                  <Select
                    value={formData.modality}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, modality: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="presencial">Presencial</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="ambos">Ambos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Preco (EUR)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price_unit">Unidade</Label>
                  <Select
                    value={formData.price_unit}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, price_unit: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sessao">Por sessao</SelectItem>
                      <SelectItem value="hora">Por hora</SelectItem>
                      <SelectItem value="mes">Por mes</SelectItem>
                      <SelectItem value="pack">Por pack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingService ? 'Guardar' : 'Criar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {services.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold mb-2">Sem servicos</h3>
              <p className="text-muted-foreground mb-4">
                Ainda nao adicionou nenhum servico ao seu perfil.
              </p>
              <Button onClick={() => setDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar primeiro servico
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {services.map((service) => (
            <Card key={service.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(service)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleDelete(service.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {service.description && (
                  <CardDescription>{service.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm">
                  {service.duration_minutes && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {service.duration_minutes} min
                    </div>
                  )}
                  {service.price && (
                    <div className="flex items-center gap-1 font-medium text-primary">
                      <Euro className="h-4 w-4" />
                      {service.price.toFixed(2)} / {service.price_unit || 'sessao'}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
