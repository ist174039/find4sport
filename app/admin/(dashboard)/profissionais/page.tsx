'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { adminCreateProfessional, adminUpdateProfessional } from '@/app/actions/auth'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Activity, Ban, ChevronLeft, ChevronRight, Clock, Edit, Eye, Filter, Flag, Loader2, MapPin, Star, UserMinus, UserPlus, Users } from 'lucide-react'
import { TablePagination } from '@/components/ui/table-pagination'
import { Badge } from '@/components/ui/badge'

export default function Page() {
  const [professionals, setProfessionals] = useState<any[]>([])
  const [filteredProfessionals, setFilteredProfessionals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'pending'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState({ total: 0, pending: 0, avgRating: 0, reports: 0 })
  const [logs, setLogs] = useState<any[]>([])
  
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [inviteForm, setInviteForm] = useState({ name: '', email: '' })
  
  const [reviewProf, setReviewProf] = useState<any | null>(null)

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
  let filtered = professionals
  if (activeFilter === 'active') {
   filtered = filtered.filter(p => p.is_verified)
  } else if (activeFilter === 'pending') {
   filtered = filtered.filter(p => !p.is_verified)
  }
  if (searchQuery.trim()) {
   const q = searchQuery.toLowerCase()
   filtered = filtered.filter(p =>
    (p.full_name || '').toLowerCase().includes(q) ||
    (p.specialty || '').toLowerCase().includes(q) ||
    (p.email || '').toLowerCase().includes(q) ||
    (p.location || '').toLowerCase().includes(q)
   )
  }
  setFilteredProfessionals(filtered)
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [activeFilter, searchQuery, professionals])



 const handleInvite = async () => {
  if (!inviteForm.name || !inviteForm.email) return
  setInviting(true)
  const publicSlug = 'convidado-' + Date.now()
  const result = await adminCreateProfessional({
   full_name: inviteForm.name,
   email: inviteForm.email,
   professional_name: inviteForm.name,
   public_slug: publicSlug,
  })
  
  if (result.professional) {
   setProfessionals(prev => [...prev, result.professional])
   const supabase = createClient()
   await supabase.from('audit_logs').insert([{
    action: 'INSERT',
    table_name: 'professionals',
    user_email: 'admin@find4sport.pt',
    new_data: { action: `Profissional ${inviteForm.name} convidado` }
   }])
  } else if (result.error) {
   alert(`Erro ao convidar: ${result.error}`)
  }
  
  setInviting(false)
  setIsInviteOpen(false)
  setInviteForm({ name: '', email: '' })
 }

 const handleApprove = async (profId: string) => {
  const result = await adminUpdateProfessional(profId, { status: 'active', is_verified: true })
  if (result.professional) {
   setProfessionals(prev => prev.map(p => p.id === profId ? result.professional : p))
  } else if (result.error) {
   alert(`Erro ao aprovar: ${result.error}`)
  }
 }

  const handleBan = async (profId: string) => {
   if (!window.confirm('Bloquear este profissional?')) return
   const result = await adminUpdateProfessional(profId, { status: 'suspended', is_verified: false })
   if (result.professional) {
    setProfessionals(prev => prev.map(p => p.id === profId ? result.professional : p))
   }
  }

  const handleReviewAction = async (action: 'approve' | 'reject') => {
    if (!reviewProf) return
    if (action === 'approve') {
      await handleApprove(reviewProf.id)
    } else {
      await handleBan(reviewProf.id)
    }
    setReviewProf(null)
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
    <div className="p-4 border-b border-border flex flex-col md:flex-row justify-between items-center gap-3 print:hidden">
      <h3 className="text-lg font-bold text-foreground shrink-0">Base de Profissionais</h3>
      <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
       {/* Search */}
       <div className="relative">
        <input
         type="text"
         placeholder="Pesquisar por nome, especialidade..."
         value={searchQuery}
         onChange={e => setSearchQuery(e.target.value)}
         className="pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
       </div>
       {/* Filter tabs */}
       <div className="bg-muted/30 p-1 rounded-lg flex shrink-0">
        <button onClick={() => setActiveFilter('all')} className={`px-3 py-1.5 font-medium text-xs rounded transition-all ${activeFilter === 'all' ? 'bg-white dark:bg-muted shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Todos ({professionals.length})</button>
        <button onClick={() => setActiveFilter('active')} className={`px-3 py-1.5 font-medium text-xs rounded transition-all ${activeFilter === 'active' ? 'bg-white dark:bg-muted shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Verificados</button>
        <button onClick={() => setActiveFilter('pending')} className={`px-3 py-1.5 font-medium text-xs rounded transition-all ${activeFilter === 'pending' ? 'bg-white dark:bg-muted shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Pendentes</button>
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
            {!prof.is_verified && (
             <button 
              onClick={() => setReviewProf(prof)}
              className="px-3 py-1.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-all"
              title="Analisar"
             >
              Analisar
             </button>
            )}
            <button className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all" title="Ver Perfil Público" onClick={() => window.open(`/profissionais/${prof.public_slug || prof.id}`, '_blank')}>
             <Eye className="h-4 w-4" />
            </button>
            <button 
             onClick={() => handleBan(prof.id)}
             className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all" 
             title="Bloquear"
            >
             <Ban className="h-4 w-4" />
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
     <div className="p-4 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 bg-muted/30 print:hidden">
      <p className="text-sm text-muted-foreground">
       Mostrando <strong>{Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredProfessionals.length)}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredProfessionals.length)}</strong> de <strong>{filteredProfessionals.length}</strong> profissionais
      </p>
      <div className="flex gap-2 items-center">
       <button 
        className="p-2 border border-border rounded-lg text-muted-foreground hover:bg-muted transition-all disabled:opacity-40"
        disabled={currentPage <= 1}
        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
       >
        <ChevronLeft className="h-4 w-4" />
       </button>
       <span className="text-sm font-medium text-foreground px-2">{currentPage} / {Math.max(1, totalPages)}</span>
       <button 
        className="p-2 border border-border rounded-lg text-muted-foreground hover:bg-muted transition-all disabled:opacity-40"
        disabled={currentPage >= totalPages}
        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
       >
        <ChevronRight className="h-4 w-4" />
       </button>
      </div>
     </div>
   </div>

   {/* Review Modal */}
   <Dialog open={!!reviewProf} onOpenChange={(o) => !o && setReviewProf(null)}>
    <DialogContent className="sm:max-w-2xl">
     <DialogHeader>
      <DialogTitle>Analisar Profissional</DialogTitle>
     </DialogHeader>
     {reviewProf && (
      <div className="space-y-6 pt-4">
       <div className="flex gap-4 items-start">
        <img src={reviewProf.avatar_url || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=150"} alt="Avatar" className="w-20 h-20 rounded-lg object-cover" />
        <div>
         <h2 className="text-xl font-bold">{reviewProf.full_name}</h2>
         <p className="text-muted-foreground">{reviewProf.email}</p>
         <Badge variant="outline" className="mt-2">{reviewProf.professional_name || 'Profissional'}</Badge>
        </div>
       </div>
       <div className="grid grid-cols-2 gap-4">
        <div>
         <Label className="text-muted-foreground">Especialidade</Label>
         <p className="font-medium">{reviewProf.specialty || 'Não definida'}</p>
        </div>
        <div>
         <Label className="text-muted-foreground">Localização</Label>
         <p className="font-medium">{reviewProf.address || 'Não definida'}</p>
        </div>
        <div className="col-span-2">
         <Label className="text-muted-foreground">Biografia / Sobre</Label>
         <p className="bg-muted/50 p-3 rounded-lg text-sm whitespace-pre-wrap mt-1">{reviewProf.bio || 'Sem biografia...'}</p>
        </div>
       </div>
       <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={() => setReviewProf(null)}>Cancelar</Button>
        <Button variant="destructive" onClick={() => handleReviewAction('reject')}>Rejeitar</Button>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleReviewAction('approve')}>Aprovar Perfil</Button>
       </div>
      </div>
     )}
    </DialogContent>
   </Dialog>

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
