'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Loader2, ArrowLeft, Check } from 'lucide-react'

export default function CriarEventoProfissionalPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [categories, setCategories] = useState<{ id: string; name: string; emoji: string | null }[]>([])
  const [formData, setFormData] = useState({
    title: '', description: '', category_id: '',
    address: '', start_date: '', end_date: '',
    capacity: '', price_min: '', price_max: '',
    image_url: '',
  })

  useEffect(() => {
    const supabase = createClient()
    supabase.from('categories').select('id, name, emoji').then(({ data }) => {
      setCategories(data || [])
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Não autenticado')

      const { error: insertError } = await supabase.from('events').insert({
        title: formData.title,
        description: formData.description,
        category_id: formData.category_id || null,
        address: formData.address,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        price_min: formData.price_min ? parseFloat(formData.price_min) : null,
        price_max: formData.price_max ? parseFloat(formData.price_max) : null,
        image_url: formData.image_url || null,
        created_by: user.id,
        status: 'pending',
      })

      if (insertError) throw insertError
      setSuccess(true)
      setTimeout(() => router.push('/dashboard/eventos'), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar evento')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="mt-4 text-xl font-bold">Evento Criado! 🎉</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            O teu evento foi submetido para aprovação.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      <Link href="/dashboard/eventos" className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-1 h-4 w-4" /> Voltar aos Eventos
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Criar Novo Evento</CardTitle>
          <CardDescription>Preenche os dados para criares um evento desportivo.</CardDescription>
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
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Selecionar categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.emoji || '📌'} {cat.name}
                      </SelectItem>
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

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacidade</Label>
                <Input id="capacity" type="number" placeholder="Nº lugares" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price_min">Preço Mín. (€)</Label>
                <Input id="price_min" type="number" step="0.01" placeholder="0.00" value={formData.price_min} onChange={(e) => setFormData({ ...formData, price_min: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price_max">Preço Máx. (€)</Label>
                <Input id="price_max" type="number" step="0.01" placeholder="0.00" value={formData.price_max} onChange={(e) => setFormData({ ...formData, price_max: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">URL da Imagem</Label>
              <Input id="image_url" type="url" placeholder="https://..." value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calendar className="mr-2 h-4 w-4" />}
              {loading ? 'A criar...' : 'Criar Evento'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
