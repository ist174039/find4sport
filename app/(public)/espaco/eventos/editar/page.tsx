'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar, Loader2, ArrowLeft, Save, AlertCircle } from 'lucide-react'

export default function EspacoEditarEventoPage() {
  return (
    <Suspense fallback={<div className="space-y-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>}>
      <EspacoEditarEventoForm />
    </Suspense>
  )
}

function EspacoEditarEventoForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const eventId = searchParams.get('id')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [categories, setCategories] = useState<{ id: string; name: string; emoji: string | null }[]>([])
  const [formData, setFormData] = useState({
    title: '', description: '', category_id: '',
    start_date: '', end_date: '',
    capacity: '', price: '', image_url: '', address: '',
  })

  useEffect(() => {
    if (!eventId) { setLoading(false); return }

    const supabase = createClient()
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: event, error: evErr } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single()

      if (evErr || !event) { setError('Evento não encontrado'); setLoading(false); return }

      const { data: space } = await supabase
        .from('sport_spaces')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!space || event.space_id !== space.id) { setError('Não tens permissão para editar este evento'); setLoading(false); return }

      setFormData({
        title: event.title || '',
        description: event.description || '',
        category_id: event.category_id || '',
        start_date: event.start_date ? event.start_date.slice(0, 16) : '',
        end_date: event.end_date ? event.end_date.slice(0, 16) : '',
        capacity: event.capacity?.toString() || '',
        price: event.price_min?.toString() || '',
        image_url: event.image_url || '',
        address: event.address || '',
      })

      const { data: cats } = await supabase.from('categories').select('id, name, emoji')
      setCategories(cats || [])
      setLoading(false)
    }
    load()
  }, [eventId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventId) return
    setSaving(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase
        .from('events')
        .update({
          title: formData.title,
          description: formData.description,
          category_id: formData.category_id || null,
          address: formData.address,
          start_date: formData.start_date,
          end_date: formData.end_date || null,
          capacity: formData.capacity ? parseInt(formData.capacity) : null,
          price_min: formData.price ? parseFloat(formData.price) : null,
          image_url: formData.image_url || null,
        })
        .eq('id', eventId)

      if (updateError) throw updateError
      setSuccess(true)
      setTimeout(() => router.push('/espaco/eventos'), 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar evento')
    } finally {
      setSaving(false)
    }
  }

  if (!eventId) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center py-12 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-amber-500" />
          <h2 className="text-xl font-bold">Evento não especificado</h2>
          <p className="mt-2 text-sm text-muted-foreground">Seleciona um evento para editar.</p>
          <Button asChild className="mt-4">
            <Link href="/espaco/eventos">Voltar aos Eventos</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return <div className="space-y-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
  }

  if (success) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Save className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="mt-4 text-xl font-bold">Evento Atualizado! ✅</h2>
          <p className="mt-2 text-sm text-muted-foreground">As alterações foram guardadas com sucesso.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      <Link href="/espaco/eventos" className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-1 h-4 w-4" /> Voltar aos Eventos
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Editar Evento</CardTitle>
          <CardDescription>Atualiza os dados do evento.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select value={formData.category_id} onValueChange={(v) => setFormData({ ...formData, category_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.emoji || '📌'} {c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Localização</Label>
                <Input id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="start_date">Data de Início *</Label>
                <Input id="start_date" type="datetime-local" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">Data de Fim</Label>
                <Input id="end_date" type="datetime-local" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacidade</Label>
                <Input id="capacity" type="number" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Preço (€)</Label>
                <Input id="price" type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">URL da Imagem</Label>
              <Input id="image_url" type="url" placeholder="https://..." value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {saving ? 'A guardar...' : 'Guardar Alterações'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
