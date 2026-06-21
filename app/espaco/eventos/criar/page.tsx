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

export default function EspacoCriarEventoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [spaceId, setSpaceId] = useState<string | null>(null)
  const [subSpaces, setSubSpaces] = useState<{ id: string; name: string }[]>([])
  const [categories, setCategories] = useState<{ id: string; name: string; emoji: string | null }[]>([])
  const [formData, setFormData] = useState({
    title: '', description: '', category_id: '',
    sub_space_id: '', start_date: '', end_date: '',
    capacity: '', price: '', image_url: '', address: '',
  })

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: space } = await supabase
        .from('sport_spaces')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (space) {
        setSpaceId(space.id)
        const { data: subs } = await supabase
          .from('sub_spaces')
          .select('id, name')
          .eq('space_id', space.id)
        setSubSpaces(subs || [])
      }

      const { data: cats } = await supabase.from('categories').select('id, name, emoji')
      setCategories(cats || [])
    }
    load()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !spaceId) throw new Error('Não autenticado')

      const { error: insertError } = await supabase.from('events').insert({
        title: formData.title,
        description: formData.description,
        category_id: formData.category_id || null,
        sub_space_id: formData.sub_space_id || null,
        space_id: spaceId,
        address: formData.address,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        price_min: formData.price ? parseFloat(formData.price) : null,
        image_url: formData.image_url || null,
        created_by: user.id,
        status: 'approved',
      })

      if (insertError) throw insertError
      setSuccess(true)
      setTimeout(() => router.push('/espaco/eventos'), 2000)
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
          <p className="mt-2 text-sm text-muted-foreground">O evento foi adicionado ao teu espaço.</p>
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
          <CardTitle>Criar Evento no Espaço</CardTitle>
          <CardDescription>Adiciona um evento que ocorrerá no teu espaço.</CardDescription>
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
              {subSpaces.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="sub_space">Sub-Espaço</Label>
                  <Select value={formData.sub_space_id} onValueChange={(v) => setFormData({ ...formData, sub_space_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {subSpaces.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Localização</Label>
              <Input id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
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
                <Input id="capacity" type="number" placeholder="Nº lugares" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Preço (€)</Label>
                <Input id="price" type="number" step="0.01" placeholder="0.00" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
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
