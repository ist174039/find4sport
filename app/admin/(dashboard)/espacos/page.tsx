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
  const [spaces, setSpaces] = useState<any[]>([])
  const [claims, setClaims] = useState<any[]>([])
  const [filteredSpaces, setFilteredSpaces] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'draft' | 'pending'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'created_at'>('name')
  
  const [stats, setStats] = useState({ total: 0, new30d: 0, pendingClaims: 0 })
  
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', address: '' })

  const [simulatingImport, setSimulatingImport] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10
  const paginatedData = filteredSpaces.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  const totalPages = Math.ceil(filteredSpaces.length / ITEMS_PER_PAGE)

  useEffect(() => {
    setCurrentPage(1)
  }, [filteredSpaces.length])

 useEffect(() => {
  async function load() {
   const supabase = createClient()
   
   const [
    { data: spacesData },
    { data: claimsData }
   ] = await Promise.all([
    supabase.from('sport_spaces').select('*').order(sortBy, { ascending: sortBy === 'name' ? true : false }),
    supabase.from('space_claims').select('*, sport_spaces(name), auth_users:user_id(email)').eq('status', 'pending')
   ])

   const loadedSpaces = spacesData || []
   setSpaces(loadedSpaces)
   setFilteredSpaces(loadedSpaces)
   
   setClaims(claimsData || [])

   // Stats
   const total = loadedSpaces.length
   const thirtyDaysAgo = new Date()
   thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
   const new30d = loadedSpaces.filter(s => new Date(s.created_at) > thirtyDaysAgo).length
   
   setStats({
    total,
    new30d,
    pendingClaims: (claimsData || []).length
   })
   
   setLoading(false)
  }
  load()
 }, [sortBy])

 useEffect(() => {
  if (activeFilter === 'all') {
   setFilteredSpaces(spaces)
  } else if (activeFilter === 'active') {
   setFilteredSpaces(spaces.filter(s => s.status === 'published' || s.is_verified))
  } else if (activeFilter === 'draft') {
   setFilteredSpaces(spaces.filter(s => s.status === 'draft'))
  } else if (activeFilter === 'pending') {
   setFilteredSpaces(spaces.filter(s => !s.is_verified))
  }
 }, [activeFilter, spaces])

 const handleCreate = async () => {
  if (!createForm.name || !createForm.address) return
  setCreating(true)
  const supabase = createClient()
  
  const newSpace = {
   name: createForm.name,
   address: createForm.address,
   status: 'draft',
   is_verified: false
  }
  
  const { data, error } = await supabase.from('sport_spaces').insert([newSpace]).select()
  
  if (!error && data) {
   setSpaces(prev => [...prev, data[0]])
   await supabase.from('audit_logs').insert([{
    action: 'INSERT',
    table_name: 'sport_spaces',
    user_email: 'admin@find4sport.pt',
    new_data: { action: `Espaço ${createForm.name} criado` }
   }])
  }
  
  setCreating(false)
  setIsCreateOpen(false)
  setCreateForm({ name: '', address: '' })
 }

 const handleClaim = async (id: string, action: 'approved' | 'rejected') => {
  const supabase = createClient()
  const { error } = await supabase.from('space_claims').update({ status: action }).eq('id', id)
  if (!error) {
   setClaims(prev => prev.filter(c => c.id !== id))
  }
 }

 const simulateGoogleImport = () => {
  setSimulatingImport(true)
  setTimeout(() => {
   setSimulatingImport(false)
   alert('Importação simulada com sucesso (mock)')
  }, 1500)
 }

 return (
  <div className="space-y-6">
   {/* Welcome & Actions */}
   <section className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
    <div>
     <h1 className="text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl tracking-tight">Gestão de Espaços Esportivos</h1>
     <p className="text-muted-foreground mt-1 text-sm">Administre, valide e importe novos locais para o ecossistema.</p>
    </div>
    <div className="flex gap-3">
     <button 
      onClick={simulateGoogleImport}
      disabled={simulatingImport}
      className="flex items-center gap-2 px-5 py-2.5 bg-muted border border-border rounded-lg font-medium text-sm hover:bg-muted transition-all disabled:opacity-50"
     >
      {simulatingImport ? <Loader2 className="w-4 h-4 animate-spin" /> : (
       <img alt="Google Logo" className="w-4 h-4" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwFewsTcDPucJ8u_tKlx0Hxt5G2r2qQU4BKY62WYYKr3dmMBs8t8lJDc2-Uj6wWWDzGC_LD9O7eAtMpeCDTf8LsTQK6wKwzCq8lOFy_KQ7VMKPsNPYwJIbCbePvLVhPiOaRhTl1KJZcjjFQwXA5llJxwlEKH_ET50WYouIF76JV_Y3WHms3SZjWjobwekhV2L2KDo3AQ53Qhw9oxRa7aVcAUmnGPDONzM0REp6u0Yb0LtdkV7ysBV6UwmHOQxffYhls1lwgY6A" />
      )}
      Importar do Google Places
     </button>

     <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
      <DialogTrigger className="flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-lg font-medium text-sm hover:shadow-lg hover:shadow-primary/20 transition-all">
<span className="material-symbols-outlined text-[20px]">add</span>
        Cadastrar Espaço
</DialogTrigger>
      <DialogContent>
       <DialogHeader>
        <DialogTitle>Novo Espaço Desportivo</DialogTitle>
       </DialogHeader>
       <div className="space-y-4 pt-4">
        <div className="space-y-2">
         <Label>Nome do Espaço</Label>
         <Input value={createForm.name} onChange={e => setCreateForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Ex: Clube de Ténis de Cascais" />
        </div>
        <div className="space-y-2">
         <Label>Morada/Endereço</Label>
         <Input value={createForm.address} onChange={e => setCreateForm(prev => ({ ...prev, address: e.target.value }))} placeholder="Av. Principal, Lote 2" />
        </div>
        <Button className="w-full bg-primary hover:bg-primary/90 text-white" onClick={handleCreate} disabled={creating}>
         {creating ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
         Cadastrar
        </Button>
       </div>
      </DialogContent>
     </Dialog>
    </div>
   </section>

   {/* Stats Overview */}
   <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
    <div className="bg-card p-6 rounded-xl border border-border relative overflow-hidden group">
     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
      <span className="material-symbols-outlined text-[64px]" data-icon="stadium">stadium</span>
     </div>
     <p className="text-muted-foreground font-medium text-sm mb-2">Total de Espaços</p>
     <h3 className="text-2xl font-bold text-foreground">{loading ? '...' : stats.total}</h3>
    </div>
    <div className="bg-card p-6 rounded-xl border border-border relative overflow-hidden group">
     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-primary">
      <span className="material-symbols-outlined text-[64px]" data-icon="add_business">add_business</span>
     </div>
     <p className="text-muted-foreground font-medium text-sm mb-2">Novos (30 dias)</p>
     <div className="flex items-end gap-2">
      <h3 className="text-2xl font-bold text-foreground">{loading ? '...' : stats.new30d}</h3>
      <span className="text-primary font-medium text-sm bg-primary/10 px-2 py-0.5 rounded-full mb-1">+12%</span>
     </div>
    </div>
    <div className="bg-destructive/10 p-6 rounded-xl border border-destructive/20 relative overflow-hidden group">
     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-destructive">
      <span className="material-symbols-outlined text-[64px]" data-icon="assignment_late">assignment_late</span>
     </div>
     <p className="text-muted-foreground font-medium text-sm mb-2">Aguardando Aprovação</p>
     <div className="flex items-end gap-2">
      <h3 className="text-2xl font-bold text-destructive">{loading ? '...' : stats.pendingClaims}</h3>
      <span className="text-destructive font-medium text-sm">Reivindicações</span>
     </div>
    </div>
    <div className="bg-card p-6 rounded-xl border border-border relative overflow-hidden group">
     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-secondary-foreground">
      <span className="material-symbols-outlined text-[64px]" data-icon="analytics">analytics</span>
     </div>
     <p className="text-muted-foreground font-medium text-sm mb-2">Ocupação Média</p>
     <div className="flex items-end gap-2">
      <h3 className="text-2xl font-bold text-foreground">68%</h3>
      <span className="text-muted-foreground font-medium text-sm mb-1">Horário Nobre</span>
     </div>
    </div>
   </section>

   {/* Claims Section */}
   {claims.length > 0 && (
    <section className="bg-card rounded-xl border border-border overflow-hidden">
     <div className="p-6 border-b border-border flex justify-between items-center bg-destructive/5">
      <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
       <span className="material-symbols-outlined text-destructive">notification_important</span>
       Solicitações de Propriedade
      </h3>
      <span className="bg-destructive text-white font-medium text-sm px-3 py-1 rounded-full">{claims.length} Pendentes</span>
     </div>
     <div className="divide-y divide-outline-variant">
      {claims.map(claim => (
       <div key={claim.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-muted/50 transition-colors">
        <div className="flex gap-4 items-start">
         <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-muted-foreground">store</span>
         </div>
         <div>
          <h4 className="text-lg font-bold">{claim.sport_spaces?.name || 'Espaço Desconhecido'}</h4>
          <p className="text-sm text-muted-foreground">Solicitado por: <span className="font-bold">{claim.auth_users?.email || claim.user_id}</span></p>
          {claim.message && <p className="text-sm text-muted-foreground mt-1 italic">"{claim.message}"</p>}
         </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
         <button className="flex-1 md:flex-none px-4 py-2 border border-border rounded-lg font-medium text-sm text-foreground hover:bg-muted transition-all flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[18px]">description</span> Docs
         </button>
         <button onClick={() => handleClaim(claim.id, 'rejected')} className="flex-1 md:flex-none px-4 py-2 border border-destructive text-destructive rounded-lg font-medium text-sm hover:bg-destructive/10 transition-all">Negar</button>
         <button onClick={() => handleClaim(claim.id, 'approved')} className="flex-1 md:flex-none px-4 py-2 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary/90 transition-all shadow-sm">Aprovar</button>
        </div>
       </div>
      ))}
     </div>
    </section>
   )}

   {/* Spaces List Section */}
   <section className="bg-card rounded-xl border border-border overflow-hidden">
    <div className="p-6 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
     <div className="flex items-center gap-2">
      <h3 className="text-xl font-bold text-foreground">Diretório de Espaços</h3>
     </div>
     <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
      <div className="flex bg-muted/30 p-1 rounded-lg">
       <button onClick={() => setActiveFilter('all')} className={`px-4 py-1.5 font-medium text-sm rounded-md transition-all ${activeFilter === 'all' ? 'bg-white shadow-sm font-bold text-primary' : 'text-muted-foreground'}`}>Todos</button>
       <button onClick={() => setActiveFilter('active')} className={`px-4 py-1.5 font-medium text-sm rounded-md transition-all ${activeFilter === 'active' ? 'bg-white shadow-sm font-bold text-primary' : 'text-muted-foreground'}`}>Ativos</button>
       <button onClick={() => setActiveFilter('draft')} className={`px-4 py-1.5 font-medium text-sm rounded-md transition-all ${activeFilter === 'draft' ? 'bg-white shadow-sm font-bold text-primary' : 'text-muted-foreground'}`}>Rascunhos</button>
       <button onClick={() => setActiveFilter('pending')} className={`px-4 py-1.5 font-medium text-sm rounded-md transition-all ${activeFilter === 'pending' ? 'bg-white shadow-sm font-bold text-primary' : 'text-muted-foreground'}`}>Pendentes</button>
      </div>
      <div className="relative">
       <select 
        className="appearance-none pl-4 pr-10 py-2 bg-background border border-border rounded-lg font-medium text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary h-full w-full sm:w-auto"
        value={sortBy}
        onChange={e => setSortBy(e.target.value as any)}
       >
        <option value="name">Ordenar por Nome</option>
        <option value="created_at">Mais Recentes</option>
       </select>
       <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">arrow_drop_down</span>
      </div>
     </div>
    </div>

    <div className="overflow-x-auto">
     <table className="w-full text-left">
      <thead className="bg-muted/30 border-b border-border">
       <tr>
        <th className="px-6 py-4 font-medium text-sm text-muted-foreground uppercase text-xs">Espaço / Nome</th>
        <th className="px-6 py-4 font-medium text-sm text-muted-foreground uppercase text-xs hidden md:table-cell">Localização</th>
        <th className="px-6 py-4 font-medium text-sm text-muted-foreground uppercase text-xs">Status</th>
        <th className="px-6 py-4 font-medium text-sm text-muted-foreground uppercase text-xs hidden md:table-cell">Gestor</th>
        <th className="px-6 py-4 font-medium text-sm text-muted-foreground uppercase text-xs text-right">Ações</th>
       </tr>
      </thead>
      <tbody className="divide-y divide-border">
       {loading ? (
        <tr><td colSpan={5} className="text-center py-10 text-muted-foreground">A carregar espaços...</td></tr>
       ) : filteredSpaces.length === 0 ? (
        <tr><td colSpan={5} className="text-center py-10 text-muted-foreground">Nenhum espaço encontrado.</td></tr>
       ) : (
        paginatedData.map((space) => (
         <tr key={space.id} className="hover:bg-muted/30 transition-colors">
          <td className="px-6 py-4">
           <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded-lg border border-border flex items-center justify-center overflow-hidden shrink-0">
             {space.image_url ? (
              <img src={space.image_url} alt={space.name} className="w-full h-full object-cover" />
             ) : (
              <span className="material-symbols-outlined text-muted-foreground">image</span>
             )}
            </div>
            <div>
             <p className="font-semibold text-foreground truncate max-w-[200px]">{space.name}</p>
             <p className="text-xs text-muted-foreground mt-0.5">Criado em {new Date(space.created_at).toLocaleDateString('pt-PT')}</p>
            </div>
           </div>
          </td>
          <td className="px-6 py-4 hidden md:table-cell">
           <p className="text-sm text-foreground max-w-[200px] truncate" title={space.address}>{space.address || 'Não definido'}</p>
          </td>
          <td className="px-6 py-4">
           <div className="flex gap-2">
            {space.is_verified ? (
             <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-500/20 text-green-600 dark:text-green-400 rounded-full text-[11px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Verificado
             </span>
            ) : (
             <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-muted text-muted-foreground rounded-full text-[11px] font-bold uppercase tracking-wider">
              Pendente
             </span>
            )}
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
             space.status === 'published' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
            }`}>
             {space.status === 'published' ? 'Publicado' : 'Rascunho'}
            </span>
           </div>
          </td>
          <td className="px-6 py-4">
           {space.owner_id ? (
            <div className="flex items-center gap-2">
             <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">ID</div>
             <span className="text-sm">Reivindicado</span>
            </div>
           ) : (
            <span className="text-sm text-muted-foreground italic">Sem Gestor</span>
           )}
          </td>
          <td className="px-6 py-4 text-right">
           <div className="flex justify-end gap-1">
            <button className="p-2 hover:bg-muted text-muted-foreground hover:text-primary rounded-lg transition-colors" title="Editar">
             <span className="material-symbols-outlined text-[20px]">edit</span>
            </button>
            <button className="p-2 hover:bg-muted text-muted-foreground hover:text-primary rounded-lg transition-colors" title="Ver Público">
             <span className="material-symbols-outlined text-[20px]">open_in_new</span>
            </button>
            <button className="p-2 hover:bg-destructive/20 text-muted-foreground hover:text-destructive rounded-lg transition-colors" title="Remover">
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
