'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Clock,
  Euro,
  Plus,
  Save,
  Loader2,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Users,
} from 'lucide-react'

type Resource = {
  id: string
  professional_id: string
  name: string
  description: string | null
  resource_type: string
  capacity: number | null
  price_per_hour: number | null
  is_active: boolean
  created_at: string
}

export default function ProfessionalResourcesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [professional, setProfessional] = useState<any>(null)
  const [resources, setResources] = useState<Resource[]>([])
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    description: '',
    resource_type: 'session',
    capacity: '',
    price_per_hour: '',
  })

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/auth/login'); return }

        const { data: prof } = await supabase
          .from('professionals')
          .select('id, full_name')
          .eq('user_id', user.id)
          .single()

        if (!prof) { setLoading(false); return }
        setProfessional(prof)

        const { data: res } = await supabase
          .from('resources')
          .select('*')
          .eq('professional_id', prof.id)
          .order('created_at', { ascending: false })

        setResources(res || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  const handleAdd = async () => {
    if (!form.name) { setError('Nome é obrigatório'); return }
    setSaving(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data, error: insertError } = await supabase
        .from('resources')
        .insert({
          professional_id: professional.id,
          name: form.name,
          description: form.description || null,
          resource_type: form.resource_type,
          capacity: form.capacity ? parseInt(form.capacity) : null,
          price_per_hour: form.price_per_hour ? parseFloat(form.price_per_hour) : null,
          is_active: true,
        })
        .select()
        .single()

      if (insertError) { setError(insertError.message); return }
      if (data) {
        setResources((prev) => [data as Resource, ...prev])
        setForm({ name: '', description: '', resource_type: 'session', capacity: '', price_per_hour: '' })
        setShowForm(false)
      }
    } catch (err) {
      setError('Erro ao adicionar recurso')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (resource: Resource) => {
    const supabase = createClient()
    await supabase.from('resources').update({ is_active: !resource.is_active }).eq('id', resource.id)
    setResources((prev) => prev.map((r) => (r.id === resource.id ? { ...r, is_active: !r.is_active } : r)))
  }

  const removeResource = async (id: string) => {
    const supabase = createClient()
    await supabase.from('resources').delete().eq('id', id)
    setResources((prev) => prev.filter((r) => r.id !== id))
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-4 h-64 w-full" />
      </div>
    )
  }

  if (!professional) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <Calendar className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold">Perfil Profissional necessário</h2>
        <p className="mt-1 text-muted-foreground">Precisas de ter um perfil profissional para gerir recursos.</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/perfil">Configurar Perfil</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/profissional">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Link>
      </Button>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recursos</h1>
          <p className="mt-1 text-muted-foreground">
            Gerir horários, preços e disponibilidade
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          {showForm ? 'Cancelar' : 'Novo Recurso'}
        </Button>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {showForm && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="mb-4 font-semibold">Novo Recurso</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Sessão de Personal Training" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <select
                  id="type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.resource_type}
                  onChange={(e) => setForm({ ...form, resource_type: e.target.value })}
                >
                  <option value="session">Sessão</option>
                  <option value="class">Aula</option>
                  <option value="consultation">Consulta</option>
                  <option value="equipment">Equipamento</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacidade</Label>
                <Input id="capacity" type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} placeholder="Nº máximo de participantes" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Preço por hora (€)</Label>
                <Input id="price" type="number" step="0.01" value={form.price_per_hour} onChange={(e) => setForm({ ...form, price_per_hour: e.target.value })} placeholder="0.00" />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="desc">Descrição</Label>
                <Textarea id="desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descrição do recurso..." />
              </div>
            </div>
            <Button className="mt-4" onClick={handleAdd} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Adicionar Recurso
            </Button>
          </CardContent>
        </Card>
      )}

      {resources.length === 0 && !showForm ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">Nenhum recurso ainda</h3>
            <p className="mb-4 text-sm text-muted-foreground">Adiciona recursos para começar a receber reservas.</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" /> Criar Recurso
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {resources.map((resource) => (
            <Card key={resource.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{resource.name}</h3>
                    <Badge variant={resource.is_active ? 'default' : 'secondary'}>
                      {resource.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
                    {resource.resource_type && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {resource.resource_type}
                      </span>
                    )}
                    {resource.capacity && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {resource.capacity} vagas
                      </span>
                    )}
                    {resource.price_per_hour && (
                      <span className="flex items-center gap-1">
                        <Euro className="h-3 w-3" />
                        {resource.price_per_hour.toFixed(2)}€/h
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => toggleActive(resource)}>
                    {resource.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => removeResource(resource.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
