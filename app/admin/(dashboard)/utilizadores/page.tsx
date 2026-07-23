
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TablePagination } from '@/components/ui/table-pagination'

export default function Page() {
  const [users, setUsers] = useState<any[]>([])
  const [filteredUsers, setFilteredUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'general' | 'operacional'>('all')
  const [stats, setStats] = useState({ total: 0, professionals: 0, admins: 0 })

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', email: '', role: 'user' })

  const handleCreateUser = async () => {
    // Note: Creating auth users requires the admin service_role key server-side.
    // For now, this is a placeholder UI interaction as requested.
    alert(`Funcionalidade de criar utilizador (${createForm.email}) em desenvolvimento (requer API server-side).`)
    setIsCreateOpen(false)
    setCreateForm({ name: '', email: '', role: 'user' })
  }

  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10
  const paginatedData = filteredUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)

  useEffect(() => {
    setCurrentPage(1)
  }, [filteredUsers.length])

 useEffect(() => {
  async function load() {
   const supabase = createClient()
   const { data } = await supabase
    .from('admins')
    .select('*')
    .order('created_at', { ascending: false })

   const loadedUsers = data || []
   setUsers(loadedUsers)
   setFilteredUsers(loadedUsers)

   setStats({
    total: loadedUsers.length,
    professionals: 0,
    admins: loadedUsers.filter(u => u.admin_type === 'general').length
   })
   
   setLoading(false)
  }
  load()
 }, [])

 useEffect(() => {
  let result = users
  if (activeFilter !== 'all') {
   result = result.filter(u => u.admin_type === activeFilter)
  }
  if (search) {
   const lower = search.toLowerCase()
   result = result.filter(u => 
    (u.email && u.email.toLowerCase().includes(lower))
   )
  }
  setFilteredUsers(result)
 }, [search, activeFilter, users])

 const handleRoleChange = async (id: string, newRole: string) => {
  const supabase = createClient()
  const { error } = await supabase.from('admins').update({ admin_type: newRole }).eq('id', id)
  if (!error) {
   setUsers(prev => prev.map(u => u.id === id ? { ...u, admin_type: newRole } : u))
   await supabase.from('audit_logs').insert([{
    action: 'UPDATE', table_name: 'admins', user_email: 'admin@find4sport.pt',
    new_data: { action: `Permissões alteradas para ${newRole} (Admin ${id})` }
   }])
  }
 }

 return (
  <div className="space-y-6">
   {/* Page Header */}
   <section className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
    <div>
     <h1 className="text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl tracking-tight">Utilizadores e Permissões</h1>
     <p className="text-muted-foreground mt-1 text-sm">Gerencie contas, níveis de acesso e bloqueios de segurança.</p>
    </div>
    <div className="flex gap-3">
     <button className="flex items-center gap-2 px-5 py-2.5 bg-muted border border-border rounded-lg font-medium text-sm hover:bg-muted transition-all">
      <span className="material-symbols-outlined text-[20px]">download</span>
      Exportar CSV
     </button>
     <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
      <DialogTrigger className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary/90 transition-all shadow-sm">
       <span className="material-symbols-outlined text-[20px]">person_add</span>
       Criar Utilizador
      </DialogTrigger>
      <DialogContent>
       <DialogHeader>
        <DialogTitle>Criar Novo Utilizador</DialogTitle>
       </DialogHeader>
       <div className="space-y-4 pt-4">
        <div className="space-y-2">
         <Label>Nome Completo</Label>
         <Input value={createForm.name} onChange={e => setCreateForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Ex: João Silva" />
        </div>
        <div className="space-y-2">
         <Label>Email</Label>
         <Input type="email" value={createForm.email} onChange={e => setCreateForm(prev => ({ ...prev, email: e.target.value }))} placeholder="joao@exemplo.com" />
        </div>
        <div className="space-y-2">
         <Label>Papel</Label>
         <select 
          className="w-full p-2 border border-border rounded-lg bg-background text-sm"
          value={createForm.role} 
          onChange={e => setCreateForm(prev => ({ ...prev, role: e.target.value }))}
         >
          <option value="user">Utilizador Comum</option>
          <option value="professional">Profissional</option>
          <option value="admin">Administrador</option>
         </select>
        </div>
        <Button className="w-full bg-primary hover:bg-primary/90 text-white mt-2" onClick={handleCreateUser}>
         Criar Utilizador
        </Button>
       </div>
      </DialogContent>
     </Dialog>
    </div>
   </section>

   {/* Stats Overview */}
   <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    <div className="bg-card p-6 rounded-xl border border-border relative overflow-hidden group">
     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-primary">
      <span className="material-symbols-outlined text-[64px]" data-icon="group">group</span>
     </div>
     <p className="text-muted-foreground font-medium text-sm mb-2">Total Registados</p>
     <div className="flex items-end gap-2">
      <h3 className="text-2xl font-bold text-foreground">{loading ? '...' : stats.total}</h3>
     </div>
    </div>
    <div className="bg-card p-6 rounded-xl border border-border relative overflow-hidden group">
     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-secondary-foreground">
      <span className="material-symbols-outlined text-[64px]" data-icon="sports">sports</span>
     </div>
     <p className="text-muted-foreground font-medium text-sm mb-2">Profissionais</p>
     <div className="flex items-end gap-2">
      <h3 className="text-2xl font-bold text-foreground">{loading ? '...' : stats.professionals}</h3>
      <span className="text-secondary-foreground font-medium text-sm bg-secondary/50 px-2 py-0.5 rounded-full mb-1">Entidades</span>
     </div>
    </div>
    <div className="bg-destructive/10 p-6 rounded-xl border border-border relative overflow-hidden group">
     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-destructive">
      <span className="material-symbols-outlined text-[64px]" data-icon="admin_panel_settings">admin_panel_settings</span>
     </div>
     <p className="text-muted-foreground font-medium text-sm mb-2">Administradores</p>
     <div className="flex items-end gap-2">
      <h3 className="text-2xl font-bold text-foreground">{loading ? '...' : stats.admins}</h3>
      <span className="text-destructive font-medium text-sm">Acesso Total</span>
     </div>
    </div>
   </section>

   {/* Main List Section */}
   <section className="bg-card rounded-xl border border-border overflow-hidden">
    <div className="p-6 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
     <div className="flex flex-col sm:flex-row gap-3 w-full">
      {/* Tab Filters */}
      <div className="flex bg-muted/30 p-1 rounded-lg w-full sm:w-auto overflow-x-auto">
       <button onClick={() => setActiveFilter('all')} className={`px-4 py-1.5 font-medium text-sm rounded-md transition-all whitespace-nowrap ${activeFilter === 'all' ? 'bg-white shadow-sm font-bold text-primary' : 'text-muted-foreground hover:text-foreground'}`}>Todos</button>
       <button onClick={() => setActiveFilter('general')} className={`px-4 py-1.5 font-medium text-sm rounded-md transition-all whitespace-nowrap ${activeFilter === 'general' ? 'bg-white shadow-sm font-bold text-primary' : 'text-muted-foreground hover:text-foreground'}`}>Admin Geral</button>
       <button onClick={() => setActiveFilter('operacional')} className={`px-4 py-1.5 font-medium text-sm rounded-md transition-all whitespace-nowrap ${activeFilter === 'operacional' ? 'bg-white shadow-sm font-bold text-primary' : 'text-muted-foreground hover:text-foreground'}`}>Operacional</button>
      </div>
      
      {/* Quick Search */}
      <div className="relative flex-1 sm:max-w-xs ml-auto">
       <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[20px]">search</span>
       <input 
        type="text" 
        placeholder="Pesquisar utilizador..." 
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
       />
      </div>
     </div>
    </div>

    <div className="overflow-x-auto">
     <table className="w-full text-left">
      <thead className="bg-muted/30 border-b border-border">
       <tr>
        <th className="px-6 py-4 font-medium text-sm text-muted-foreground uppercase text-xs">Utilizador</th>
        <th className="px-6 py-4 font-medium text-sm text-muted-foreground uppercase text-xs hidden md:table-cell">Papel / Função</th>
        <th className="px-6 py-4 font-medium text-sm text-muted-foreground uppercase text-xs hidden md:table-cell">Data de Registo</th>
        <th className="px-6 py-4 font-medium text-sm text-muted-foreground uppercase text-xs text-right">Ações</th>
       </tr>
      </thead>
      <tbody className="divide-y divide-border">
       {loading ? (
        <tr><td colSpan={4} className="text-center py-10 text-muted-foreground">A carregar utilizadores...</td></tr>
       ) : filteredUsers.length === 0 ? (
        <tr><td colSpan={4} className="text-center py-10 text-muted-foreground">Nenhum utilizador encontrado.</td></tr>
       ) : (
        paginatedData.map((user) => (
         <tr key={user.id} className="hover:bg-muted/30 transition-colors">
          <td className="px-6 py-4">
           <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0 uppercase font-bold">
             {(user.full_name || 'U').charAt(0)}
            </div>
            <div>
             <p className="font-semibold text-foreground">{user.full_name || 'Utilizador sem nome'}</p>
             <p className="text-xs text-muted-foreground">{user.email || 'Email oculto'}</p>
            </div>
           </div>
          </td>
          <td className="px-6 py-4 hidden md:table-cell">
           {user.admin_type === 'general' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-destructive/20/30 text-destructive rounded-full text-[11px] font-bold uppercase tracking-wider">
             <span className="material-symbols-outlined text-[12px]">security</span> General
            </span>
           )}
           {user.admin_type === 'operacional' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-secondary/50 text-secondary-foreground rounded-full text-[11px] font-bold uppercase tracking-wider">
             <span className="material-symbols-outlined text-[12px]">store</span> Operacional
            </span>
           )}
          </td>
          <td className="px-6 py-4 hidden md:table-cell">
           <span className="text-sm text-muted-foreground">{new Date(user.created_at).toLocaleDateString('pt-PT')}</span>
          </td>
          <td className="px-6 py-4 text-right">
           <div className="flex justify-end gap-1">
            <button className="p-2 hover:bg-muted text-muted-foreground hover:text-primary rounded-lg transition-colors" title="Editar">
             <span className="material-symbols-outlined text-[20px]">edit</span>
            </button>
            <button className="p-2 hover:bg-muted text-muted-foreground hover:text-primary rounded-lg transition-colors" title="Reset Password" onClick={() => alert('Reset Password')}>
             <span className="material-symbols-outlined text-[20px]">lock_reset</span>
            </button>
            <button className="p-2 hover:bg-destructive/20 text-muted-foreground hover:text-destructive rounded-lg transition-colors" title="Bloquear Conta">
             <span className="material-symbols-outlined text-[20px]">block</span>
            </button>
           </div>
          </td>
         </tr>
        ))
       )}
      </tbody>
     </table>
    </div>
    
    <TablePagination currentPage={currentPage} totalPages={totalPages} totalItems={filteredUsers.length} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setCurrentPage} />
      </section>
  </div>
 )
}
