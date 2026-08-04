'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  AlertCircle, BarChart, BellRing, Building, Building2, ChevronDown, 
  Edit, ExternalLink, FileText, Image, Loader2, Plus, Store, Trash2, CheckCircle2, Power, Eye, Users
} from 'lucide-react'
import { TablePagination } from '@/components/ui/table-pagination'
import Link from 'next/link'

export default function Page() {
  const [spaces, setSpaces] = useState<any[]>([])
  const [claims, setClaims] = useState<any[]>([])
  const [filteredSpaces, setFilteredSpaces] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClaimModal, setSelectedClaimModal] = useState<any | null>(null)
  const [reviewSpace, setReviewSpace] = useState<any | null>(null)
  
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'draft' | 'pending' | 'with_manager' | 'no_manager'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'created_at'>('name')
  
  const [stats, setStats] = useState({ total: 0, activeCount: 0, pendingClaims: 0, noManager: 0 })
  
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', address: '' })

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
        { data: spacesData, error: spacesError },
        { data: claimsData }
      ] = await Promise.all([
        supabase.from('sport_spaces').select('*').order(sortBy, { ascending: sortBy === 'name' ? true : false }),
        supabase.from('space_claims').select('*, sport_spaces(name, address), platform_users(full_name, email)').eq('status', 'pending')
      ])

      if (spacesError) {
        console.error('Error loading spaces:', spacesError)
      }

      const loadedSpaces = spacesData || []

      // Fetch owner profiles for spaces that have an owner_user_id
      const ownerIds = [...new Set(loadedSpaces.map(s => s.owner_user_id).filter(Boolean))]
      let ownerMap: Record<string, any> = {}
      
      if (ownerIds.length > 0) {
        const { data: ownersData } = await supabase
          .from('platform_users')
          .select('id, full_name, email, type')
          .in('id', ownerIds)
        
        for (const owner of ownersData || []) {
          ownerMap[owner.id] = owner
        }
      }

      // Merge owner data into spaces
      const spacesWithOwner = loadedSpaces.map(s => ({
        ...s,
        owner: s.owner_user_id ? ownerMap[s.owner_user_id] || null : null
      }))

      setSpaces(spacesWithOwner)
      setFilteredSpaces(spacesWithOwner)
      
      setClaims(claimsData || [])

      const total = spacesWithOwner.length
      const activeCount = spacesWithOwner.filter(s => s.status === 'active' || s.status === 'published' || s.is_verified).length
      const noManager = spacesWithOwner.filter(s => !s.owner_user_id).length
      
      setStats({
        total,
        activeCount,
        pendingClaims: (claimsData || []).length,
        noManager
      })
      
      setLoading(false)
    }
    load()
  }, [sortBy])


  useEffect(() => {
    let filtered = spaces
    if (activeFilter === 'active') {
      filtered = filtered.filter(s => s.status === 'active' || s.status === 'published' || s.is_verified)
    } else if (activeFilter === 'draft') {
      filtered = filtered.filter(s => s.status !== 'active' && s.status !== 'published' && !s.is_verified)
    } else if (activeFilter === 'pending') {
      filtered = filtered.filter(s => s.status === 'pending' || !s.is_verified)
    } else if (activeFilter === 'with_manager') {
      filtered = filtered.filter(s => !!s.owner_user_id)
    } else if (activeFilter === 'no_manager') {
      filtered = filtered.filter(s => !s.owner_user_id)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(s =>
        (s.name || '').toLowerCase().includes(q) ||
        (s.address || '').toLowerCase().includes(q)
      )
    }
    setFilteredSpaces(filtered)
  }, [activeFilter, searchQuery, spaces])

  // Toggle Space Status (Draft -> Active / Online)
  const handleToggleStatus = async (spaceId: string, currentStatus: string) => {
    const isCurrentlyActive = currentStatus === 'active' || currentStatus === 'published'
    const newStatus = isCurrentlyActive ? 'pending' : 'active'
    const newVerified = !isCurrentlyActive

    const supabase = createClient()
    const { error } = await supabase
      .from('sport_spaces')
      .update({ status: newStatus, is_verified: newVerified })
      .eq('id', spaceId)

    if (!error) {
      setSpaces(prev => prev.map(s => s.id === spaceId ? { ...s, status: newStatus, is_verified: newVerified } : s))
      
      // Audit log
      await supabase.from('audit_logs').insert([{
        action: 'UPDATE_STATUS',
        table_name: 'sport_spaces',
        user_email: 'admin@find4sport.pt',
        new_data: { space_id: spaceId, status: newStatus }
      }])
    }
  }

  const handleReviewAction = async (space: any, action: 'approve' | 'reject') => {
    if (action === 'approve') {
      await handleToggleStatus(space.id, 'pending') // passing 'pending' means it will turn 'active'
    } else {
      await handleToggleStatus(space.id, 'active') // passing 'active' means it will turn 'pending'
    }
    setReviewSpace(null)
  }

  const handleCreate = async () => {
    if (!createForm.name || !createForm.address) return
    setCreating(true)
    const supabase = createClient()
    
    const slug = createForm.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4)
    
    const newSpace = {
      name: createForm.name,
      slug,
      address: createForm.address,
      status: 'active', // Default to Active so it appears online immediately!
      is_verified: true
    }
    
    const { data, error } = await supabase.from('sport_spaces').insert([newSpace]).select()
    
    if (!error && data) {
      setSpaces(prev => [data[0], ...prev])
      await supabase.from('audit_logs').insert([{
        action: 'INSERT',
        table_name: 'sport_spaces',
        user_email: 'admin@find4sport.pt',
        new_data: { action: `Espaço ${createForm.name} criado e ativado` }
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

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja apagar este espaço?')) return
    const supabase = createClient()
    const { error } = await supabase.from('sport_spaces').delete().eq('id', id)
    if (!error) {
      setSpaces(prev => prev.filter(s => s.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome & Actions */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl tracking-tight">Gestão de Espaços Desportivos</h1>
          <p className="text-base text-muted-foreground mt-1">Administre os locais cadastrados, altere o estado para Ativo/Online e gira solicitações.</p>
        </div>

        <div className="flex gap-3">
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 shadow-sm transition-colors">
              <Plus className="h-4 w-4" />
              Cadastrar Novo Espaço
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Novo Espaço Desportivo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Nome do Espaço</Label>
                  <Input 
                    value={createForm.name} 
                    onChange={e => setCreateForm(prev => ({ ...prev, name: e.target.value }))} 
                    placeholder="Ex: Clube de Ténis de Cascais" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Morada / Endereço</Label>
                  <Input 
                    value={createForm.address} 
                    onChange={e => setCreateForm(prev => ({ ...prev, address: e.target.value }))} 
                    placeholder="Av. Principal, Lote 2, Lisboa" 
                  />
                </div>
                <Button className="w-full" onClick={handleCreate} disabled={creating}>
                  {creating ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                  Cadastrar e Ativar Espaço
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
            <Building2 className="h-16 w-16" />
          </div>
          <p className="text-muted-foreground font-medium text-xs uppercase tracking-wider mb-2">Total de Espaços</p>
          <h3 className="text-3xl font-bold text-foreground">{loading ? '...' : stats.total}</h3>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-emerald-500">
            <Building className="h-16 w-16" />
          </div>
          <p className="text-muted-foreground font-medium text-xs uppercase tracking-wider mb-2">Espaços Ativos / Online</p>
          <h3 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{loading ? '...' : stats.activeCount}</h3>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-amber-500">
            <AlertCircle className="h-16 w-16" />
          </div>
          <p className="text-muted-foreground font-medium text-xs uppercase tracking-wider mb-2">Reivindicações Pendentes</p>
          <h3 className="text-3xl font-bold text-amber-600 dark:text-amber-400">{loading ? '...' : stats.pendingClaims}</h3>
        </div>

        <div
          className="bg-card p-6 rounded-xl border border-orange-200 dark:border-orange-900/40 relative overflow-hidden group cursor-pointer hover:border-orange-400 transition-colors"
          onClick={() => setActiveFilter('no_manager')}
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-orange-500">
            <Users className="h-16 w-16" />
          </div>
          <p className="text-muted-foreground font-medium text-xs uppercase tracking-wider mb-2">Sem Gestor</p>
          <h3 className="text-3xl font-bold text-orange-600 dark:text-orange-400">{loading ? '...' : stats.noManager}</h3>
          <p className="text-xs text-orange-500 mt-1">Clique para filtrar</p>
        </div>
      </section>

      {/* Claims Section */}
      {claims.length > 0 && (
        <section className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
          <div className="p-4 border-b border-border flex justify-between items-center bg-amber-500/10">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <BellRing className="text-amber-500 h-5 w-5" />
              Solicitações de Propriedade Pendentes
            </h3>
            <Badge variant="warning">{claims.length} Pendentes</Badge>
          </div>
          <div className="divide-y divide-border">
            {claims.map(claim => (
              <div key={claim.id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-muted/50 transition-colors">
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center shrink-0">
                    <Store className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-foreground">{claim.sport_spaces?.name || 'Espaço'}</h4>
                    <p className="text-xs text-muted-foreground">Solicitado por: <span className="font-semibold">{claim.platform_users?.full_name || claim.user_id}</span></p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedClaimModal(claim)}>
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    Ver Mensagem
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive border-destructive/40" onClick={() => handleClaim(claim.id, 'rejected')}>
                    Negar
                  </Button>
                  <Button size="sm" onClick={() => handleClaim(claim.id, 'approved')}>
                    Aprovar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Claim Detail Modal */}
      {selectedClaimModal && (
        <Dialog open={!!selectedClaimModal} onOpenChange={() => setSelectedClaimModal(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Store className="h-5 w-5 text-amber-500" />
                Reivindicação — {selectedClaimModal.sport_spaces?.name || 'Espaço'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/40 p-3 rounded-lg">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Requerente</p>
                  <p className="text-sm font-semibold text-foreground">{selectedClaimModal.platform_users?.full_name || '—'}</p>
                  <p className="text-xs text-muted-foreground">{selectedClaimModal.platform_users?.email || selectedClaimModal.user_id}</p>
                </div>
                <div className="bg-muted/40 p-3 rounded-lg">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Espaço</p>
                  <p className="text-sm font-semibold text-foreground">{selectedClaimModal.sport_spaces?.name || '—'}</p>
                  <p className="text-xs text-muted-foreground">{selectedClaimModal.sport_spaces?.address || 'Sem morada'}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Data do Pedido</p>
                <p className="text-sm text-foreground">{new Date(selectedClaimModal.created_at).toLocaleString('pt-PT')}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Mensagem / Justificação</p>
                <div className="bg-muted/30 border border-border rounded-lg p-4">
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedClaimModal.message || 'Sem mensagem fornecida.'}
                  </p>
                </div>
              </div>
              {selectedClaimModal.documents_url && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Documento Comprovativo</p>
                  <a href={selectedClaimModal.documents_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-primary font-bold hover:underline">
                    <FileText className="h-4 w-4" /> Visualizar Documento
                  </a>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button variant="outline" onClick={() => setSelectedClaimModal(null)}>Fechar</Button>
                <Button variant="outline" className="text-destructive border-destructive/40" onClick={() => { handleClaim(selectedClaimModal.id, 'rejected'); setSelectedClaimModal(null) }}>Rejeitar</Button>
                <Button onClick={() => { handleClaim(selectedClaimModal.id, 'approved'); setSelectedClaimModal(null) }}>Aprovar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Spaces Directory List Section */}
      <section className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-muted/20">
          <h3 className="text-lg font-bold text-foreground shrink-0">Diretório de Espaços</h3>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Pesquisar por nome ou morada..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-lg w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <div className="flex bg-muted p-1 rounded-lg flex-wrap gap-1">
              <button 
                onClick={() => setActiveFilter('all')} 
                className={`px-3 py-1 font-medium text-xs rounded-md transition-all ${activeFilter === 'all' ? 'bg-background shadow-sm font-bold text-foreground' : 'text-muted-foreground'}`}
              >
                Todos ({spaces.length})
              </button>
              <button 
                onClick={() => setActiveFilter('active')} 
                className={`px-3 py-1 font-medium text-xs rounded-md transition-all ${activeFilter === 'active' ? 'bg-background shadow-sm font-bold text-primary' : 'text-muted-foreground'}`}
              >
                Ativos ({spaces.filter(s => s.status === 'active' || s.status === 'published' || s.is_verified).length})
              </button>
              <button 
                onClick={() => setActiveFilter('draft')} 
                className={`px-3 py-1 font-medium text-xs rounded-md transition-all ${activeFilter === 'draft' ? 'bg-background shadow-sm font-bold text-foreground' : 'text-muted-foreground'}`}
              >
                Inativos ({spaces.filter(s => s.status !== 'active' && s.status !== 'published' && !s.is_verified).length})
              </button>
              <button 
                onClick={() => setActiveFilter('with_manager')} 
                className={`px-3 py-1 font-medium text-xs rounded-md transition-all ${activeFilter === 'with_manager' ? 'bg-background shadow-sm font-bold text-emerald-600' : 'text-muted-foreground'}`}
              >
                Com Gestor ({spaces.filter(s => !!s.owner_user_id).length})
              </button>
              <button 
                onClick={() => setActiveFilter('no_manager')} 
                className={`px-3 py-1 font-medium text-xs rounded-md transition-all ${activeFilter === 'no_manager' ? 'bg-background shadow-sm font-bold text-orange-600' : 'text-muted-foreground'}`}
              >
                Sem Gestor ({spaces.filter(s => !s.owner_user_id).length})
              </button>
            </div>

            <div className="relative">
              <select 
                className="appearance-none pl-3 pr-8 py-1.5 bg-background border border-border rounded-lg font-medium text-xs focus:outline-none focus:ring-1 focus:ring-primary h-full w-full sm:w-auto"
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
              >
                <option value="name">Ordenar por Nome</option>
                <option value="created_at">Mais Recentes</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground h-4 w-4" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-3.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Espaço</th>
                <th className="px-6 py-3.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider hidden md:table-cell">Endereço</th>
                <th className="px-6 py-3.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Gestor</th>
                <th className="px-6 py-3.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-sm">A carregar diretório de espaços...</p>
                  </td>
                </tr>
              ) : filteredSpaces.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    <Building2 className="h-10 w-10 mx-auto mb-2 opacity-40 text-primary" />
                    <p className="text-sm font-medium">Nenhum espaço encontrado no filtro selecionado.</p>
                  </td>
                </tr>
              ) : (
                paginatedData.map((space) => {
                  const isOnline = space.status === 'active' || space.status === 'published' || space.is_verified

                  return (
                    <tr key={space.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl border border-border flex items-center justify-center overflow-hidden shrink-0">
                            {space.image_url ? (
                              <img src={space.image_url} alt={space.name} className="w-full h-full object-cover" />
                            ) : (
                              <Building className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-foreground truncate max-w-[220px]">{space.name}</p>
                            <p className="text-xs text-muted-foreground">Criado em {new Date(space.created_at).toLocaleDateString('pt-PT')}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 hidden md:table-cell">
                        <p className="text-xs text-muted-foreground max-w-[240px] truncate" title={space.address}>
                          {space.address || 'Endereço não definido'}
                        </p>
                      </td>

                      {/* Manager Column */}
                      <td className="px-6 py-4">
                        {space.owner?.full_name ? (
                          <div>
                            <p className="text-sm font-semibold text-foreground truncate max-w-[160px]">{space.owner.full_name}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[160px]">{space.owner.email}</p>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 bg-orange-50 dark:bg-orange-950/30 px-2 py-0.5 rounded-full border border-orange-200 dark:border-orange-900/50">
                            <AlertCircle className="h-3 w-3" /> Sem Gestor
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {isOnline ? (
                            <Badge variant="success" className="gap-1 font-semibold text-xs w-fit">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Ativo / Online
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1 text-xs w-fit">
                              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground"></span>
                              Inativo
                            </Badge>
                          )}
                          {space.is_verified && (
                            <Badge variant="outline" className="gap-1 text-xs text-amber-600 border-amber-300 w-fit">
                              <CheckCircle2 className="h-3 w-3" /> Verificado
                            </Badge>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          {/* Main Action Button: Pass to Active / Online */}
                          {!isOnline ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setReviewSpace(space)}
                              className="gap-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white border-0"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Analisar
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleStatus(space.id, space.status)}
                              className="gap-1.5 text-xs font-semibold"
                            >
                              <Power className="h-3.5 w-3.5" />
                              Desativar
                            </Button>
                          )}

                          <Link href={`/espacos/${space.slug || space.id}`} target="_blank">
                            <Button variant="ghost" size="icon" title="Ver Página Pública">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>

                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(space.id)}
                            className="text-muted-foreground hover:text-destructive"
                            title="Remover Espaço"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Review Space Modal */}
      <Dialog open={!!reviewSpace} onOpenChange={(o) => !o && setReviewSpace(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Analisar Espaço</DialogTitle>
          </DialogHeader>
          {reviewSpace && (
            <div className="space-y-6 pt-4">
              <div className="flex gap-4 items-start">
                <div className="w-20 h-20 bg-primary/10 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                  {reviewSpace.image_url ? (
                    <img src={reviewSpace.image_url} alt={reviewSpace.name} className="w-full h-full object-cover" />
                  ) : (
                    <Building className="h-8 w-8 text-primary" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{reviewSpace.name}</h2>
                  <p className="text-muted-foreground">{reviewSpace.address || 'Sem morada'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Gestor / Responsável</Label>
                  <p className="font-medium">{reviewSpace.owner?.full_name || 'Sem Gestor Associado'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Data de Registo</Label>
                  <p className="font-medium">{new Date(reviewSpace.created_at).toLocaleDateString('pt-PT')}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Descrição</Label>
                  <p className="bg-muted/50 p-3 rounded-lg text-sm whitespace-pre-wrap mt-1">{reviewSpace.description || 'Sem descrição fornecida...'}</p>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setReviewSpace(null)}>Cancelar</Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleReviewAction(reviewSpace, 'approve')}>Ativar / Publicar Espaço</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
