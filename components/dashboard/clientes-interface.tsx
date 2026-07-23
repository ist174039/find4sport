'use client'

import { useState } from 'react'
import { Search, UserPlus, Filter, MoreHorizontal, Mail, Phone, Calendar as CalendarIcon, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export type Cliente = {
  id: string
  name: string
  email: string
  avatar: string
  total_bookings: number
  last_booking: string
  status: string
}

export function ClientesInterface({ initialClientes }: { initialClientes: Cliente[] }) {
  const [clientes, setClientes] = useState<Cliente[]>(initialClientes)
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [searchUserQuery, setSearchUserQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [addingUserId, setAddingUserId] = useState<string | null>(null)

  const handleSearchUsers = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchUserQuery.trim()) return

    setIsSearching(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('platform_users')
        .select('id, full_name, email, avatar_url')
        .ilike('full_name', `%${searchUserQuery}%`)
        .limit(10)

      if (error) throw error
      
      // Filter out users that are already in the clients list
      const existingIds = new Set(clientes.map(c => c.id))
      setSearchResults((data || []).filter(u => !existingIds.has(u.id)))
    } catch (error) {
      console.error('Error searching users:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddClient = async (user: any) => {
    setAddingUserId(user.id)
    try {
      // Aqui idealmente faríamos um insert na tabela professional_clients
      // Por agora, adicionamos apenas ao state local para dar o feedback visual correto
      
      const newClient: Cliente = {
        id: user.id,
        name: user.full_name || 'Utilizador',
        email: user.email,
        avatar: user.avatar_url,
        total_bookings: 0,
        last_booking: new Date().toISOString(),
        status: 'Novo'
      }
      
      setClientes(prev => [newClient, ...prev])
      setSearchResults(prev => prev.filter(u => u.id !== user.id))
      
      // Fechar o modal após 1 segundo
      setTimeout(() => {
        setAddingUserId(null)
        setIsAddModalOpen(false)
        setSearchUserQuery('')
        setSearchResults([])
      }, 800)
    } catch (error) {
      console.error('Error adding client:', error)
      setAddingUserId(null)
    }
  }

  const filteredClientes = clientes.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Gestão de Clientes</h1>
          <p className="mt-2 text-muted-foreground">Consulte e faça a gestão da sua carteira de clientes.</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg h-10 px-4 flex items-center justify-center gap-2 text-sm font-medium transition-colors">
              <UserPlus className="h-4 w-4" /> Novo Cliente
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Cliente</DialogTitle>
                <DialogDescription>
                  Pesquise por utilizadores registados na plataforma para os adicionar à sua carteira de clientes.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSearchUsers} className="flex gap-2 mt-4">
                <Input
                  placeholder="Nome do utilizador..."
                  value={searchUserQuery}
                  onChange={(e) => setSearchUserQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={isSearching || !searchUserQuery.trim()}>
                  {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </form>

              <div className="mt-6 max-h-[300px] overflow-y-auto pr-2 space-y-2">
                {searchResults.length === 0 && searchUserQuery && !isSearching ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Nenhum utilizador encontrado.</p>
                ) : (
                  searchResults.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <img 
                          src={user.avatar_url || 'https://i.pravatar.cc/150'} 
                          alt={user.full_name} 
                          className="w-10 h-10 rounded-full object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">{user.full_name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant={addingUserId === user.id ? "default" : "outline"}
                        disabled={addingUserId !== null}
                        onClick={() => handleAddClient(user)}
                        className="shrink-0 ml-2"
                      >
                        {addingUserId === user.id ? (
                          <><Check className="h-4 w-4 mr-1.5" /> Adicionado</>
                        ) : (
                          'Adicionar'
                        )}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Pesquisar por nome ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          />
        </div>
        <Button variant="outline" className="w-full sm:w-auto rounded-lg border-border hover:bg-muted gap-2 text-sm h-10">
          <Filter className="h-4 w-4" /> Filtros
        </Button>
      </div>

      {/* List / Empty State */}
      {filteredClientes.length === 0 ? (
        <div className="bg-card border border-border p-16 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <UserPlus className="h-8 w-8 text-muted-foreground opacity-50" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Nenhum cliente encontrado</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">
            {searchQuery 
              ? 'Não encontrámos nenhum cliente que corresponda à sua pesquisa.' 
              : 'Ainda não tem clientes na sua lista. Os seus clientes aparecerão aqui automaticamente quando fizerem uma reserva ou pode adicioná-los manualmente.'}
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Última Reserva</th>
                  <th className="px-6 py-4 text-center">Reservas Totais</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredClientes.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0 border border-border/50 overflow-hidden">
                          {cliente.avatar ? (
                            <img src={cliente.avatar} alt={cliente.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-bold text-secondary-foreground text-xs">{cliente.name.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-foreground text-sm">{cliente.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Mail className="h-3 w-3" /> {cliente.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600 border border-green-500/20">
                        {cliente.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-xs">
                      <div className="flex items-center gap-1.5">
                        <CalendarIcon className="h-3.5 w-3.5 opacity-70" />
                        {format(new Date(cliente.last_booking), "dd 'de' MMM, yyyy", { locale: ptBR })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-foreground">
                      {cliente.total_bookings}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg">
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
