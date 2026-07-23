'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Activity, Ban, ChevronLeft, ChevronRight, Clock, Edit, Eye, Filter, Flag, Loader2, MapPin, Star, UserMinus, UserPlus, Users } from 'lucide-react'
import { TablePagination } from '@/components/ui/table-pagination'

export default function Page() {
  const [professionals, setProfessionals] = useState<any[]>([])
  const [filteredProfessionals, setFilteredProfessionals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'pending'>('all')
  const [stats, setStats] = useState({ total: 0, pending: 0, avgRating: 0, reports: 0 })
  const [logs, setLogs] = useState<any[]>([])
  
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [inviteForm, setInviteForm] = useState({ name: '', email: '' })

  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10
  const paginatedData = filteredProfessionals.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  const totalPages = Math.ceil(filteredProfessionals.length / ITEMS_PER_PAGE)

  useEffect(() => {
    setCurrentPage(1)
  }, [filteredProfessionals.length])

 useEffect(() => {
  async function load() {
   const supabase = createClient()
   
   const [
    { data: profs },
    { data: reviewData },
    { data: auditLogs }
   ] = await Promise.all([
    supabase.from('professionals').select('*').order('full_name', { ascending: true }),
    supabase.from('reviews').select('rating, professional_id').not('professional_id', 'is', null),
    supabase.from('audit_logs').select('*').eq('table_name', 'professionals').order('created_at', { ascending: false }).limit(5)
   ])

   const loadedProfs = profs || []
   setProfessionals(loadedProfs)
   setFilteredProfessionals(loadedProfs)
   
   if (auditLogs) setLogs(auditLogs)

   // Calculate Stats
   const total = loadedProfs.length
   const pending = loadedProfs.filter(p => !p.is_verified).length
   
   let sumRating = 0
   let countRating = 0
   loadedProfs.forEach(p => {
    if (p.rating_avg) {
     sumRating += Number(p.rating_avg)
     countRating++
    }
   })
   const avgRating = countRating > 0 ? (sumRating / countRating).toFixed(1) : '0.0'
   
   const reports = (reviewData || []).filter(r => r.rating <= 2).length

   setStats({ total, pending, avgRating: Number(avgRating), reports })
   setLoading(false)
  }
  load()
 }, [])

 useEffect(() => {
  if (activeFilter === 'all') {
   setFilteredProfessionals(professionals)
  } else if (activeFilter === 'active') {
   setFilteredProfessionals(professionals.filter(p => p.is_verified))
  } else if (activeFilter === 'pending') {
   setFilteredProfessionals(professionals.filter(p => !p.is_verified))
  }
 }, [activeFilter, professionals])

 const handleInvite = async () => {
  if (!inviteForm.name || !inviteForm.email) return
  setInviting(true)
  const supabase = createClient()
  
  // Create a dummy record just for the UI simulation
  const newProf = {
   full_name: inviteForm.name,
   email: inviteForm.email,
   is_verified: false,
   public_slug: 'convidado-' + Date.now()
  }
  
  const { data, error } = await supabase.from('professionals').insert([newProf]).select()
  
  if (!error && data) {
   setProfessionals(prev => [...prev, data[0]])
   // Also log it
   await supabase.from('audit_logs').insert([{
    action: 'INSERT',
    table_name: 'professionals',
    user_email: 'admin@find4sport.pt',
    new_data: { action: `Profissional ${inviteForm.name} convidado` }
   }])
  }
  
  setInviting(false)
  setIsInviteOpen(false)
  setInviteForm({ name: '', email: '' })
 }

 const exportPDF = () => {
  window.print()
 }

 return (
  <div className="space-y-6 print:m-0 print:p-0">
   {/* Page Header Area */}
   <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 print:hidden">
    <div>
     <h1 className="text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl mb-2">Gestão de Profissionais</h1>
     <p className="text-lg text-muted-foreground">Aprovação, moderação e monitoramento da base de dados.</p>
    </div>
    <div className="flex gap-3">
     <button className="flex items-center gap-2 px-4 py-2.5 bg-background border border-border rounded-lg text-foreground font-medium text-sm hover:bg-muted transition-all">
      <Filter className="h-5 w-5" />
      Filtros Avançados
     </button>
     
     <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
      <DialogTrigger className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium text-sm hover:opacity-90 shadow-sm transition-all">
<UserPlus className="h-5 w-5" />
        Convidar Profissional
</DialogTrigger>
      <DialogContent>
       <DialogHeader>
        <DialogTitle>Convidar Novo Profissional</DialogTitle>
       </DialogHeader>
       <div className="space-y-4 pt-4">
        <div className="space-y-2">
         <Label>Nome Completo</Label>
         <Input value={inviteForm.name} onChange={e => setInviteForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Ex: Carlos Silva" />
        </div>
        <div className="space-y-2">
         <Label>Email</Label>
         <Input type="email" value={inviteForm.email} onChange={e => setInviteForm(prev => ({ ...prev, email: e.target.value }))} placeholder="carlos@exemplo.com" />
        </div>
        <Button className="w-full bg-primary hover:bg-primary/90 text-white" onClick={handleInvite} disabled={inviting}>
         {inviting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
         Enviar Convite
        </Button>
       </div>
      </DialogContent>
     </Dialog>
    </div>
   </div>

   {/* Stats Overview */}
   <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-section-gap print:hidden">
    <div className="bg-card p-6 rounded-lg border border-border hover:shadow-md transition-all">
     <div className="flex justify-between items-start mb-4">
      <Users className="p-2 bg-primary/20 text-primary rounded-lg h-5 w-5" />
     </div>
     <p className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Total de Profissionais</p>
     <p className="text-3xl font-bold text-foreground mt-1">{loading ? '...' : stats.total}</p>
    </div>
    <div className="bg-card p-6 rounded-lg border border-border hover:shadow-md transition-all">
     <div className="flex justify-between items-start mb-4">
      <Clock className="p-2 bg-secondary/50 text-secondary-foreground-variant rounded-lg h-5 w-5" />
      {stats.pending > 0 && <span className="bg-destructive/20 text-destructive font-semibold font-medium text-sm px-2 py-0.5 rounded-full">Urgente</span>}
     </div>
     <p className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Aguardando Aprovação</p>
     <p className="text-3xl font-bold text-foreground mt-1">{loading ? '...' : stats.pending}</p>
    </div>
    <div className="bg-card p-6 rounded-lg border border-border hover:shadow-md transition-all">
     <div className="flex justify-between items-start mb-4">
      <Star className="p-2 bg-secondary text-secondary-foreground-variant rounded-lg h-5 w-5" />
      <span className="text-amber-500 font-medium text-sm">Global</span>
     </div>
     <p className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Média de Avaliação</p>
     <p className="text-3xl font-bold text-foreground mt-1">{loading ? '...' : stats.avgRating}</p>
    </div>
    <div className="bg-card p-6 rounded-lg border border-border hover:shadow-md transition-all">
     <div className="flex justify-between items-start mb-4">
      <Flag className="p-2 bg-mutedest text-foreground rounded-lg h-5 w-5" />
     </div>
     <p className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Denúncias Ativas</p>
     <p className="text-3xl font-bold text-foreground mt-1">{loading ? '...' : stats.reports}</p>
    </div>
   </div>

   {/* Professional Management Table Container */}
   <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden print:border-none print:shadow-none">
    <div className="p-6 border-b border-border flex flex-col md:flex-row justify-between items-center gap-4 print:hidden">
     <h3 className="text-xl font-bold text-foreground">Base de Profissionais</h3>
     <div className="flex gap-2">
      <div className="bg-muted/30 p-1 rounded-lg flex">
       <button 
        onClick={() => setActiveFilter('all')}
        className={`px-4 py-1.5 font-medium text-sm rounded shadow-sm transition-all ${activeFilter === 'all' ? 'bg-white text-green-600 dark:text-green-400' : 'text-muted-foreground hover:text-foreground'}`}
       >Todos</button>
       <button 
        onClick={() => setActiveFilter('active')}
        className={`px-4 py-1.5 font-medium text-sm rounded shadow-sm transition-all ${activeFilter === 'active' ? 'bg-white text-green-600 dark:text-green-400' : 'text-muted-foreground hover:text-foreground'}`}
       >Ativos</button>
       <button 
        onClick={() => setActiveFilter('pending')}
        className={`px-4 py-1.5 font-medium text-sm rounded shadow-sm transition-all ${activeFilter === 'pending' ? 'bg-white text-green-600 dark:text-green-400' : 'text-muted-foreground hover:text-foreground'}`}
       >Pendentes</button>
      </div>
     </div>
    </div>
    
    <div className="hidden print:block mb-4">
     <h2 className="text-2xl font-bold">Relatório de Profissionais - FIND4SPORT</h2>
     <p className="text-gray-500">{new Date().toLocaleDateString('pt-PT')}</p>
    </div>

    <div className="overflow-x-auto">
     <table className="w-full text-left border-collapse">
      <thead>
       <tr className="bg-muted/50">
        <th className="px-6 py-4 font-medium text-sm text-muted-foreground uppercase">Profissional</th>
        <th className="px-6 py-4 font-medium text-sm text-muted-foreground uppercase hidden md:table-cell">Especialidade</th>
        <th className="px-6 py-4 font-medium text-sm text-muted-foreground uppercase hidden lg:table-cell">Localização</th>
        <th className="px-6 py-4 font-medium text-sm text-muted-foreground uppercase">Status</th>
        <th className="px-6 py-4 font-medium text-sm text-muted-foreground uppercase text-right print:hidden">Ações</th>
       </tr>
      </thead>
      <tbody className="divide-y divide-border-subtle">
       {loading ? (
        <tr>
         <td colSpan={5} className="text-center py-10 text-muted-foreground text-sm">A carregar profissionais...</td>
        </tr>
       ) : filteredProfessionals.length === 0 ? (
        <tr>
         <td colSpan={5} className="text-center py-10 text-muted-foreground text-sm">Nenhum profissional encontrado.</td>
        </tr>
       ) : (
        paginatedData.map((prof) => (
         <tr key={prof.id} className="hover:bg-card/50 transition-colors group">
          <td className="px-6 py-5">
           <div className="flex items-center gap-4">
            <div className="relative">
             <img 
              alt={prof.full_name} 
              className="w-12 h-12 rounded-full object-cover border border-border" 
              src={prof.avatar_url || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=150"} 
             />
            </div>
            <div>
             <p className="text-lg font-semibold text-foreground max-w-[200px] truncate">{prof.full_name}</p>
             <p className="text-sm text-sm text-muted-foreground max-w-[200px] truncate">{prof.email || 'Sem email'}</p>
            </div>
           </div>
          </td>
          <td className="px-6 py-5 hidden md:table-cell">
           <span className="inline-flex px-3 py-1 bg-secondary/50 text-secondary-foreground text-sm font-medium rounded-full">
            {prof.professional_name || 'Profissional'}
           </span>
          </td>
          <td className="px-6 py-5 hidden lg:table-cell">
           <p className="text-foreground text-sm flex items-center gap-1.5 truncate max-w-[150px]">
            <MapPin className="text-[16px] text-muted-foreground" />
            {prof.address || 'Não definida'}
           </p>
          </td>
          <td className="px-6 py-5">
           <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-medium text-sm ${
            prof.is_verified ? 'bg-emerald-500/10 text-green-600 dark:text-green-400' : 'bg-secondary/50 text-secondary-foreground-variant'
           }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${prof.is_verified ? 'bg-primary' : 'bg-secondary'}`}></span>
            {prof.is_verified ? 'Verificado' : 'Pendente'}
           </span>
          </td>
          <td className="px-6 py-5 text-right print:hidden">
           <div className="flex justify-end gap-2">
            <button className="p-2 text-muted-foreground hover:text-green-600 dark:text-green-400 hover:bg-primary/20/20 rounded-lg transition-all" title="Ver Detalhes">
             <Eye className="h-5 w-5" />
            </button>
            <button className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all" title="Bloquear">
             <Ban className="h-5 w-5" />
            </button>
           </div>
          </td>
         </tr>
        ))
       )}
      </tbody>
     </table>
    </div>
    
    {/* Pagination Footer */}
    <div className="p-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 bg-muted/30 print:hidden">
     <p className="text-sm text-sm text-muted-foreground">Mostrando <strong>{filteredProfessionals.length}</strong> profissionais</p>
     <div className="flex gap-2">
      <button className="p-2 border border-border rounded-lg text-muted-foreground hover:bg-white transition-all disabled:opacity-50" disabled>
       <ChevronLeft className="h-5 w-5" />
      </button>
      <button className="p-2 border border-border rounded-lg text-muted-foreground hover:bg-white transition-all disabled:opacity-50" disabled>
       <ChevronRight className="h-5 w-5" />
      </button>
     </div>
    </div>
   </div>

   {/* Activity Logs & Report Card */}
   <div className="mt-section-gap grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
    <div className="lg:col-span-2 bg-card p-8 rounded-lg border border-border shadow-sm">
     <h3 className="text-xl font-bold text-foreground mb-6">Logs de Atividade Recente</h3>
     <div className="space-y-6">
      {logs.length === 0 ? (
       <p className="text-muted-foreground text-sm">Nenhum log encontrado para profissionais.</p>
      ) : (
       logs.map((log) => (
        <div key={log.id} className="flex gap-4">
         <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center ${
          log.action === 'INSERT' ? 'bg-emerald-500/10 text-green-600 dark:text-green-400' : 
          log.action === 'DELETE' ? 'bg-destructive/10 text-destructive' : 
          'bg-secondary text-secondary-foreground'
         }`}>
           {log.action === 'INSERT' ? <UserPlus className="h-4.5 w-4.5" /> : log.action === 'DELETE' ? <UserMinus className="h-4.5 w-4.5" /> : <Edit className="h-4.5 w-4.5" />}
          </div>
         <div>
          <p className="text-sm text-sm text-foreground">
           <span className="font-bold">{log.user_email || 'Sistema'}</span>{' '}
           {log.new_data?.action || `${log.action} em Profissionais`}
          </p>
          <p className="font-medium text-sm text-muted-foreground mt-1">
           {new Date(log.created_at).toLocaleString('pt-PT')}
          </p>
         </div>
        </div>
       ))
      )}
     </div>
    </div>
    
    <div className="bg-primary p-8 rounded-lg text-primary relative overflow-hidden flex flex-col justify-between">
     <div className="relative z-10">
      <h4 className="text-xl font-bold font-bold mb-4">Relatório de Profissionais</h4>
      <p className="text-sm text-sm mb-6 text-white/90">
       Mantenha o acompanhamento offline ou envie relatórios para a diretoria da FIND4SPORT.
      </p>
     </div>
     <button 
      onClick={exportPDF}
      className="w-full py-3 bg-white text-green-600 dark:text-green-400 font-bold rounded-lg hover:bg-muted transition-all z-10"
     >
      Exportar Lista (PDF/Imprimir)
     </button>
     <Activity className="absolute -right-4 -bottom-4 text-[160px] opacity-10 pointer-events-none" />
    </div>
   </div>
  </div>
 )
}
