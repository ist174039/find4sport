'use client'

import { useMemo, useState } from 'react'
import { Edit3, Plus, Search, Tag, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useModal } from '@/components/providers/modal-provider'
import { createCategoryAction, deleteCategoryAction, updateCategoryAction } from '@/app/admin/(dashboard)/categorias/actions'

type Category = { id: string; name: string; slug: string; emoji: string | null; color: string | null; created_at: string }
type FormState = { name: string; slug: string; emoji: string; color: string }
const emptyForm: FormState = { name: '', slug: '', emoji: '⚽', color: '#14b8a6' }

export function CategoriesManager({ initialCategories }: { initialCategories: Category[] }) {
  const { showAlert, showConfirm } = useModal()
  const [categories, setCategories] = useState(initialCategories)
  const [query, setQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return categories.filter(category => !q || category.name.toLowerCase().includes(q) || category.slug.toLowerCase().includes(q))
  }, [categories, query])

  const new30d = useMemo(() => {
    const threshold = Date.now() - 30 * 86400000
    return categories.filter(category => new Date(category.created_at).getTime() >= threshold).length
  }, [categories])

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(category: Category) {
    setEditingId(category.id)
    setForm({ name: category.name, slug: category.slug, emoji: category.emoji || '', color: category.color || '#14b8a6' })
    setDialogOpen(true)
  }

  function changeName(name: string) {
    const generated = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    setForm(prev => ({ ...prev, name, slug: editingId ? prev.slug : generated }))
  }

  async function save() {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      if (editingId) {
        const updated = await updateCategoryAction(editingId, form)
        setCategories(prev => prev.map(category => category.id === editingId ? updated as Category : category).sort((a, b) => a.name.localeCompare(b.name)))
        showAlert('Categoria atualizada', 'As alterações foram guardadas.', 'success')
      } else {
        const created = await createCategoryAction(form)
        setCategories(prev => [...prev, created as Category].sort((a, b) => a.name.localeCompare(b.name)))
        showAlert('Categoria criada', 'A nova modalidade já está disponível na taxonomia.', 'success')
      }
      setDialogOpen(false)
    } catch (error) {
      showAlert('Erro', error instanceof Error ? error.message : 'Não foi possível guardar a categoria.', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function remove(category: Category) {
    const confirmed = await showConfirm('Eliminar categoria', `Eliminar “${category.name}”? Se estiver associada a dados existentes, a operação será recusada.`, { confirmLabel: 'Eliminar', destructive: true })
    if (!confirmed) return
    try {
      await deleteCategoryAction(category.id)
      setCategories(prev => prev.filter(item => item.id !== category.id))
      showAlert('Categoria eliminada', 'A alteração foi registada no Audit Log.', 'success')
    } catch (error) {
      showAlert('Não foi possível eliminar', error instanceof Error ? error.message : 'Erro inesperado.', 'error')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Categorias e modalidades</h1><p className="mt-1 text-sm text-muted-foreground">Taxonomia usada em pesquisa, perfis, eventos e comunidades.</p></div>
        <Button onClick={openCreate} className="w-full sm:w-auto"><Plus className="mr-2 h-4 w-4" />Nova categoria</Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border bg-card p-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total</p><p className="mt-1 text-2xl font-bold">{categories.length}</p></div>
        <div className="rounded-xl border bg-card p-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Criadas em 30 dias</p><p className="mt-1 text-2xl font-bold">{new30d}</p></div>
      </div>

      <label className="relative block max-w-xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input value={query} onChange={event => setQuery(event.target.value)} type="search" placeholder="Pesquisar nome ou slug..." className="h-11 w-full rounded-xl border bg-background pl-10 pr-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
      </label>

      {filtered.length === 0 ? <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">Nenhuma categoria encontrada.</div> : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map(category => (
            <article key={category.id} className="flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-sm">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl" style={{ backgroundColor: `${category.color || '#14b8a6'}20`, color: category.color || '#14b8a6' }}>{category.emoji || <Tag className="h-5 w-5" />}</div>
              <div className="min-w-0 flex-1"><h2 className="truncate font-semibold">{category.name}</h2><p className="truncate font-mono text-xs text-muted-foreground">{category.slug}</p></div>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(category)} aria-label={`Editar ${category.name}`}><Edit3 className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => void remove(category)} className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label={`Eliminar ${category.name}`}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editingId ? 'Editar categoria' : 'Nova categoria'}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-[1fr_88px] gap-3">
              <div className="space-y-2"><Label htmlFor="category-name">Nome</Label><Input id="category-name" value={form.name} onChange={event => changeName(event.target.value)} placeholder="Ex.: Padel" /></div>
              <div className="space-y-2"><Label htmlFor="category-emoji">Emoji</Label><Input id="category-emoji" value={form.emoji} onChange={event => setForm(prev => ({ ...prev, emoji: event.target.value }))} className="text-center text-lg" maxLength={8} /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="category-slug">Slug</Label><Input id="category-slug" value={form.slug} onChange={event => setForm(prev => ({ ...prev, slug: event.target.value }))} placeholder="padel" /></div>
            <div className="space-y-2"><Label htmlFor="category-color">Cor</Label><div className="flex gap-2"><input id="category-color" type="color" value={form.color} onChange={event => setForm(prev => ({ ...prev, color: event.target.value }))} className="h-11 w-14 cursor-pointer rounded-lg border bg-background p-1" /><Input value={form.color} onChange={event => setForm(prev => ({ ...prev, color: event.target.value }))} placeholder="#14b8a6" /></div></div>
            <Button onClick={() => void save()} disabled={saving || !form.name.trim()} className="w-full">{saving ? 'A guardar…' : editingId ? 'Guardar alterações' : 'Criar categoria'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
