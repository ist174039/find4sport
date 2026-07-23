'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Loader2, Plus, Search, Sparkles, Tag, Trash2, Upload, Image as ImageIcon, X } from 'lucide-react'
import { TablePagination } from '@/components/ui/table-pagination'

export default function Page() {
  const [categories, setCategories] = useState<any[]>([])
  const [filteredCategories, setFilteredCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [stats, setStats] = useState({ total: 0, new30d: 0 })
  
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createForm, setCreateForm] = useState({ 
    name: '', 
    slug: '', 
    description: '',
    emoji: '⚽',
    image_url: '' 
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  
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

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      setCreateForm(prev => ({ ...prev, image_url: result }))
    }
    reader.readAsDataURL(file)
  }

  const handleCreate = async () => {
    if (!createForm.name || !createForm.slug) return
    setCreating(true)
    const supabase = createClient()
    
    const newCategory = {
      name: createForm.name,
      slug: createForm.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: createForm.description,
      emoji: createForm.emoji || '⚽',
      color: '#14b8a6',
      image_url: createForm.image_url || null
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
    } else if (error) {
      // Fallback if image_url isn't in categories table schema, try without image_url
      const fallbackCat = {
        name: createForm.name,
        slug: createForm.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: createForm.description,
        emoji: createForm.emoji || '⚽'
      }
      const { data: fbData } = await supabase.from('categories').insert([fallbackCat]).select()
      if (fbData) {
        setCategories(prev => [...prev, { ...fbData[0], image_url: createForm.image_url }].sort((a, b) => a.name.localeCompare(b.name)))
      }
    }
    
    setCreating(false)
    setIsCreateOpen(false)
    setCreateForm({ name: '', slug: '', description: '', emoji: '⚽', image_url: '' })
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
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl mb-2">Categorias e Desportos</h1>
          <p className="text-base text-muted-foreground">Gerencie a taxonomia de desportos disponíveis na plataforma.</p>
        </div>
        
        <div className="flex gap-3">
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 shadow-sm transition-colors">
              <Plus className="h-4 w-4" />
              Nova Categoria
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Nova Categoria</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 pt-2">
                {/* Upload Image Section */}
                <div className="space-y-2">
                  <Label>Imagem da Categoria</Label>
                  
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    accept="image/*" 
                    onChange={handleImageFileChange} 
                    className="hidden" 
                  />

                  {createForm.image_url ? (
                    <div className="relative w-full h-36 rounded-xl border border-border overflow-hidden bg-muted group">
                      <img src={createForm.image_url} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => setCreateForm(prev => ({ ...prev, image_url: '' }))}
                        className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full hover:bg-black transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-border hover:border-primary rounded-xl p-4 text-center cursor-pointer transition-colors bg-muted/30 flex flex-col items-center justify-center gap-2"
                    >
                      <div className="p-2.5 rounded-full bg-primary/10 text-primary">
                        <Upload className="h-5 w-5" />
                      </div>
                      <p className="text-xs font-semibold text-foreground">Clique para selecionar imagem</p>
                      <p className="text-[11px] text-muted-foreground">PNG, JPG, WEBP até 5MB</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <div className="col-span-3 space-y-2">
                    <Label>Nome</Label>
                    <Input 
                      value={createForm.name} 
                      onChange={e => setCreateForm(prev => ({ 
                        ...prev, 
                        name: e.target.value, 
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') 
                      }))} 
                      placeholder="Ex: Beach Tennis" 
                    />
                  </div>

                  <div className="col-span-1 space-y-2">
                    <Label>Emoji</Label>
                    <Input 
                      value={createForm.emoji} 
                      onChange={e => setCreateForm(prev => ({ ...prev, emoji: e.target.value }))} 
                      placeholder="🎾" 
                      className="text-center font-bold text-lg"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Slug URL</Label>
                  <Input 
                    value={createForm.slug} 
                    onChange={e => setCreateForm(prev => ({ ...prev, slug: e.target.value }))} 
                    placeholder="beach-tennis" 
                  />
                </div>

                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <textarea 
                    className="w-full min-h-[80px] p-3 text-sm border border-input rounded-lg bg-transparent focus:ring-2 focus:ring-ring outline-none" 
                    value={createForm.description} 
                    onChange={e => setCreateForm(prev => ({ ...prev, description: e.target.value }))} 
                    placeholder="Descrição opcional da categoria..."
                  />
                </div>

                <Button className="w-full" onClick={handleCreate} disabled={creating}>
                  {creating ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                  Criar Categoria
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-card p-6 rounded-xl border border-border relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Tag className="h-16 w-16" />
          </div>
          <p className="font-medium text-xs text-muted-foreground uppercase tracking-wider mb-2">Total de Categorias</p>
          <p className="text-3xl font-bold text-foreground">{loading ? '...' : stats.total}</p>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-primary">
            <Sparkles className="h-16 w-16" />
          </div>
          <p className="font-medium text-xs text-muted-foreground uppercase tracking-wider mb-2">Novas (30 dias)</p>
          <p className="text-3xl font-bold text-foreground">{loading ? '...' : stats.new30d}</p>
        </div>
      </div>

      {/* Main Content Area */}
      <section className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row justify-between items-center gap-4 bg-muted/20">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input 
              type="text" 
              placeholder="Pesquisar categoria..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto min-h-[350px]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-3.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-3.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Slug</th>
                <th className="px-6 py-3.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Descrição</th>
                <th className="px-6 py-3.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-sm">A carregar categorias...</p>
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    <Search className="h-10 w-10 mx-auto mb-2 opacity-40 text-primary" />
                    <p className="text-sm font-medium">Nenhuma categoria encontrada.</p>
                  </td>
                </tr>
              ) : (
                paginatedData.map((cat) => (
                  <tr key={cat.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0 overflow-hidden border border-border">
                          {cat.image_url ? (
                            <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-bold text-lg">{cat.emoji || cat.name.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-foreground">{cat.name}</p>
                          <p className="text-xs text-muted-foreground">Criado em {new Date(cat.created_at).toLocaleDateString('pt-PT')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="font-mono text-xs">
                        {cat.slug}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-muted-foreground truncate max-w-[300px]" title={cat.description}>{cat.description || 'Sem descrição'}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDelete(cat.id)} 
                          className="text-muted-foreground hover:text-destructive" 
                          title="Remover"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
