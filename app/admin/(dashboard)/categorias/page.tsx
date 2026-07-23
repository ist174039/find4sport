'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { TablePagination } from '@/components/ui/table-pagination'

export default function Page() {
  const [categories, setCategories] = useState<any[]>([])
  const [filteredCategories, setFilteredCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [stats, setStats] = useState({ total: 0, new30d: 0 })
  
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', slug: '', description: '' })
  
  const [search, setSearch] = useState('')

  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10
  const paginatedData = filteredCategories.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE)

  useEffect(() => {
    setCurrentPage(1)
  }, [filteredCategories.length])

 useEffect(() => {
  async function load() {
   const supabase = createClient()
   
   const { data } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

   const loadedCats = data || []
   setCategories(loadedCats)
   setFilteredCategories(loadedCats)

   const total = loadedCats.length
   const thirtyDaysAgo = new Date()
   thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
   const new30d = loadedCats.filter(c => new Date(c.created_at) > thirtyDaysAgo).length

   setStats({ total, new30d })
   setLoading(false)
  }
  load()
 }, [])

 useEffect(() => {
  if (!search) {
   setFilteredCategories(categories)
  } else {
   const lower = search.toLowerCase()
   setFilteredCategories(categories.filter(c => c.name.toLowerCase().includes(lower) || (c.description && c.description.toLowerCase().includes(lower))))
  }
 }, [search, categories])

 const handleCreate = async () => {
  if (!createForm.name || !createForm.slug) return
  setCreating(true)
  const supabase = createClient()
  
  const newCategory = {
   name: createForm.name,
   slug: createForm.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
   description: createForm.description
  }
  
  const { data, error } = await supabase.from('categories').insert([newCategory]).select()
  
  if (!error && data) {
   setCategories(prev => [...prev, data[0]].sort((a, b) => a.name.localeCompare(b.name)))
   await supabase.from('audit_logs').insert([{
    action: 'INSERT',
    table_name: 'categories',
    user_email: 'admin@find4sport.pt',
    new_data: { action: `Categoria ${createForm.name} criada` }
   }])
  }
  
  setCreating(false)
  setIsCreateOpen(false)
  setCreateForm({ name: '', slug: '', description: '' })
 }

 const handleDelete = async (id: string) => {
  if (!window.confirm('Tem certeza que deseja apagar esta categoria?')) return
  const supabase = createClient()
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (!error) {
   setCategories(prev => prev.filter(c => c.id !== id))
  }
 }

 return (
  <div className="space-y-6">
   {/* Page Header Area */}
   <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
    <div>
     <h1 className="text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl mb-2">Categorias e Desportos</h1>
     <p className="text-lg text-muted-foreground">Gerencie a taxonomia de desportos disponíveis na plataforma.</p>
    </div>
    <div className="flex gap-3">
     <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
      <DialogTrigger className="flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-lg font-medium text-sm hover:opacity-90 shadow-sm transition-all">
<span className="material-symbols-outlined" data-icon="add">add</span>
        Nova Categoria
</DialogTrigger>
      <DialogContent>
       <DialogHeader>
        <DialogTitle>Criar Nova Categoria</DialogTitle>
       </DialogHeader>
       <div className="space-y-4 pt-4">
        <div className="space-y-2">
         <Label>Nome</Label>
         <Input value={createForm.name} onChange={e => setCreateForm(prev => ({ ...prev, name: e.target.value, slug: e.target.value }))} placeholder="Ex: Padel" />
        </div>
        <div className="space-y-2">
         <Label>Slug URL</Label>
         <Input value={createForm.slug} onChange={e => setCreateForm(prev => ({ ...prev, slug: e.target.value }))} placeholder="padel" />
        </div>
        <div className="space-y-2">
         <Label>Descrição</Label>
         <textarea className="w-full min-h-[100px] p-3 border border-border rounded-lg focus:ring-1 focus:ring-primary" value={createForm.description} onChange={e => setCreateForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Descrição opcional..."></textarea>
        </div>
        <Button className="w-full bg-primary hover:bg-primary/90 text-white" onClick={handleCreate} disabled={creating}>
         {creating ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
         Criar Categoria
        </Button>
       </div>
      </DialogContent>
     </Dialog>
    </div>
   </div>

   {/* Stats Overview */}
   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    <div className="bg-card p-6 rounded-xl border border-border relative overflow-hidden group">
     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
      <span className="material-symbols-outlined text-[64px]" data-icon="category">category</span>
     </div>
     <p className="font-medium text-sm text-muted-foreground uppercase tracking-wider mb-2">Total de Categorias</p>
     <p className="text-3xl font-bold text-foreground">{loading ? '...' : stats.total}</p>
    </div>
    <div className="bg-card p-6 rounded-xl border border-border relative overflow-hidden group">
     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-primary">
      <span className="material-symbols-outlined text-[64px]" data-icon="fiber_new">fiber_new</span>
     </div>
     <p className="font-medium text-sm text-muted-foreground uppercase tracking-wider mb-2">Novas (30 dias)</p>
     <p className="text-3xl font-bold text-foreground">{loading ? '...' : stats.new30d}</p>
    </div>
   </div>

   {/* Main Content Area */}
   <section className="bg-card rounded-xl border border-border overflow-hidden">
    {/* Table Toolbar */}
    <div className="p-4 border-b border-border flex flex-col sm:flex-row justify-between items-center gap-4 bg-muted/20">
     <div className="relative w-full sm:max-w-md">
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[20px]">search</span>
      <input 
       type="text" 
       placeholder="Pesquisar categoria..." 
       value={search}
       onChange={(e) => setSearch(e.target.value)}
       className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
      />
     </div>
    </div>

    {/* Table Container */}
    <div className="overflow-x-auto min-h-[400px]">
     <table className="w-full text-left">
      <thead className="bg-muted/50 border-b border-border">
       <tr>
        <th className="px-6 py-4 font-medium text-sm text-muted-foreground uppercase text-xs tracking-wider">Categoria</th>
        <th className="px-6 py-4 font-medium text-sm text-muted-foreground uppercase text-xs tracking-wider">Slug</th>
        <th className="px-6 py-4 font-medium text-sm text-muted-foreground uppercase text-xs tracking-wider">Descrição</th>
        <th className="px-6 py-4 font-medium text-sm text-muted-foreground uppercase text-xs tracking-wider text-right">Ações</th>
       </tr>
      </thead>
      <tbody className="divide-y divide-border">
       {loading ? (
        <tr>
         <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p>A carregar dados...</p>
         </td>
        </tr>
       ) : filteredCategories.length === 0 ? (
        <tr>
         <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
          <span className="material-symbols-outlined text-[48px] mb-4 opacity-50">search_off</span>
          <p>Nenhuma categoria encontrada.</p>
         </td>
        </tr>
       ) : (
        paginatedData.map((cat) => (
         <tr key={cat.id} className="hover:bg-muted/30 transition-colors group">
          <td className="px-6 py-4">
           <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center shrink-0">
             <span className="font-bold text-lg">{cat.emoji || cat.name.charAt(0)}</span>
            </div>
            <div>
             <p className="font-semibold text-foreground">{cat.name}</p>
             <p className="text-xs text-muted-foreground mt-0.5">Criado em {new Date(cat.created_at).toLocaleDateString('pt-PT')}</p>
            </div>
           </div>
          </td>
          <td className="px-6 py-4">
           <span className="bg-muted text-muted-foreground px-2.5 py-1 rounded font-mono text-xs">{cat.slug}</span>
          </td>
          <td className="px-6 py-4">
           <p className="text-sm text-muted-foreground truncate max-w-[300px]" title={cat.description}>{cat.description || 'Sem descrição'}</p>
          </td>
          <td className="px-6 py-4 text-right">
           <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-2 hover:bg-muted text-muted-foreground hover:text-primary rounded-lg transition-colors" title="Editar">
             <span className="material-symbols-outlined text-[20px]">edit</span>
            </button>
            <button onClick={() => handleDelete(cat.id)} className="p-2 hover:bg-destructive/20 text-muted-foreground hover:text-destructive rounded-lg transition-colors" title="Remover">
             <span className="material-symbols-outlined text-[20px]">delete</span>
            </button>
           </div>
          </td>
         </tr>
        ))
       )}
      </tbody>
     </table>
    </div>
   </section>
  </div>
 )
}
