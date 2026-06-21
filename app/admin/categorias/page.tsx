'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Edit2, Trash2, Loader2, Hash } from 'lucide-react'

type Category = {
  id: string
  name: string
  emoji: string | null
  color: string | null
  description: string | null
  parent_id: string | null
  created_at: string
}

export default function AdminCategoriasPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({ name: '', emoji: '', color: '', description: '' })

  async function load() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') { router.push('/'); return }

    const { data } = await supabase.from('categories').select('*').order('name')
    setCategories(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [router])

  const openNew = () => {
    setEditing(null)
    setFormData({ name: '', emoji: '', color: '', description: '' })
    setDialogOpen(true)
  }

  const openEdit = (cat: Category) => {
    setEditing(cat)
    setFormData({ name: cat.name, emoji: cat.emoji || '', color: cat.color || '', description: cat.description || '' })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    if (editing) {
      await supabase.from('categories').update({
        name: formData.name, emoji: formData.emoji || null,
        color: formData.color || null, description: formData.description || null,
      }).eq('id', editing.id)
    } else {
      await supabase.from('categories').insert({
        name: formData.name, emoji: formData.emoji || null,
        color: formData.color || null, description: formData.description || null,
      })
    }
    setSaving(false)
    setDialogOpen(false)
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tens a certeza?')) return
    const supabase = createClient()
    await supabase.from('categories').delete().eq('id', id)
    setCategories(categories.filter(c => c.id !== id))
  }

  if (loading) return <div className="space-y-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Categorias</h1>
          <p className="text-sm text-muted-foreground">Gerir categorias desportivas da plataforma.</p>
        </div>
        <Button onClick={openNew} className="bg-teal-600 hover:bg-teal-700">
          <Plus className="mr-2 h-4 w-4" /> Nova Categoria
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {categories.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">Nenhuma categoria encontrada.</div>
            ) : (
              categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-lg">
                      {cat.emoji || <Hash className="h-5 w-5 text-muted-foreground" />}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{cat.name}</p>
                      {cat.description && <p className="text-xs text-muted-foreground">{cat.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(cat)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(cat.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Emoji</Label>
                <Input value={formData.emoji} onChange={(e) => setFormData({ ...formData, emoji: e.target.value })} placeholder="⚽" />
              </div>
              <div className="space-y-2">
                <Label>Cor</Label>
                <Input value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} placeholder="#14b8a6" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <Button onClick={handleSave} className="w-full bg-teal-600 hover:bg-teal-700" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? 'Guardar Alterações' : 'Criar Categoria'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
