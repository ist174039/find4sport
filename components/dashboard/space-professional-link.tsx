'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, CheckCircle, XCircle, Clock, Building2, User } from 'lucide-react'
import { useModal } from '@/components/providers/modal-provider'

export function SpaceProfessionalLink({ 
  mode, 
  targetId 
}: { 
  mode: 'professional' | 'space', 
  targetId: string 
}) {
  const [links, setLinks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const { showAlert } = useModal()

  useEffect(() => {
    loadLinks()
  }, [mode, targetId])

  async function loadLinks() {
    setLoading(true)
    const supabase = createClient()
    
    let query = supabase.from('space_professionals').select(`
      id, status, initiated_by,
      space:sport_spaces(id, name),
      professional:professionals(id, full_name)
    `)

    if (mode === 'professional') {
      query = query.eq('professional_id', targetId)
    } else {
      query = query.eq('space_id', targetId)
    }

    const { data, error } = await query
    if (!error && data) {
      setLinks(data)
    }
    setLoading(false)
  }

  const handleSearch = async () => {
    if (!searchQuery.trim() || searchQuery.length < 3) return
    setSearching(true)
    const supabase = createClient()

    if (mode === 'professional') {
      // Search for spaces
      const { data } = await supabase.from('sport_spaces')
        .select('id, name')
        .ilike('name', `%${searchQuery}%`)
        .limit(5)
      setSearchResults(data || [])
    } else {
      // Search for professionals
      const { data } = await supabase.from('professionals')
        .select('id, full_name')
        .ilike('full_name', `%${searchQuery}%`)
        .limit(5)
      setSearchResults(data || [])
    }
    setSearching(false)
  }

  const handleRequestLink = async (resultId: string) => {
    const supabase = createClient()
    
    const spaceId = mode === 'professional' ? resultId : targetId
    const profId = mode === 'professional' ? targetId : resultId

    const { error } = await supabase.from('space_professionals').insert({
      space_id: spaceId,
      professional_id: profId,
      status: 'pending',
      initiated_by: mode
    })

    if (error) {
      if (error.code === '23505') { // Unique violation
        showAlert('Aviso', 'Já existe um pedido ou associação com este registo.', 'error')
      } else {
        showAlert('Erro', 'Não foi possível enviar o pedido.', 'error')
      }
    } else {
      showAlert('Sucesso', 'Pedido de associação enviado! Aguarda aprovação.', 'success')
      setSearchResults([])
      setSearchQuery('')
      loadLinks()
    }
  }

  const handleUpdateStatus = async (linkId: string, status: 'active' | 'rejected') => {
    const supabase = createClient()
    const { error } = await supabase.from('space_professionals').update({ status }).eq('id', linkId)
    if (error) {
      showAlert('Erro', 'Não foi possível atualizar o estado.', 'error')
    } else {
      loadLinks()
    }
  }

  const handleDelete = async (linkId: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('space_professionals').delete().eq('id', linkId)
    if (error) {
      showAlert('Erro', 'Não foi possível remover a associação.', 'error')
    } else {
      loadLinks()
    }
  }

  return (
    <div className="bg-card border rounded-2xl p-6">
      <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
        {mode === 'professional' ? <Building2 className="w-5 h-5 text-primary" /> : <User className="w-5 h-5 text-primary" />}
        {mode === 'professional' ? 'Espaços Associados' : 'Profissionais da Equipa'}
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        {mode === 'professional' 
          ? 'Procura espaços desportivos para te associares. Eles deverão aprovar o teu pedido.' 
          : 'Gere os profissionais associados ao teu espaço ou procura para os convidar.'}
      </p>

      {/* Search Bar */}
      <div className="flex gap-2 mb-6">
        <Input 
          placeholder={mode === 'professional' ? "Pesquisar espaço pelo nome..." : "Pesquisar profissional..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={searching || searchQuery.length < 3}>
          <Search className="w-4 h-4 mr-2" /> Procurar
        </Button>
      </div>

      {searchResults.length > 0 && (
        <div className="bg-muted p-4 rounded-xl mb-6 space-y-2 border">
          <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">Resultados da Pesquisa</h4>
          {searchResults.map(res => (
            <div key={res.id} className="flex items-center justify-between bg-background p-3 rounded-lg border shadow-sm">
              <span className="font-semibold text-sm">{res.name || res.full_name}</span>
              <Button size="sm" variant="outline" onClick={() => handleRequestLink(res.id)}>
                Enviar Pedido
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Existing Links */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">A carregar...</p>
        ) : links.length === 0 ? (
          <div className="text-center py-6 border border-dashed rounded-xl text-muted-foreground bg-muted/20">
            Nenhuma associação encontrada.
          </div>
        ) : (
          links.map(link => {
            const isMyRequest = link.initiated_by === mode
            const targetName = mode === 'professional' ? link.space?.name : link.professional?.full_name
            const needsMyApproval = link.status === 'pending' && !isMyRequest

            return (
              <div key={link.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-xl bg-background shadow-sm gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${link.status === 'active' ? 'bg-green-500' : link.status === 'rejected' ? 'bg-red-500' : 'bg-amber-500'}`} />
                  <div>
                    <p className="font-bold text-sm">{targetName}</p>
                    <p className="text-xs text-muted-foreground capitalize flex items-center gap-1">
                      {link.status === 'pending' && <Clock className="w-3 h-3" />}
                      {link.status} {link.status === 'pending' && isMyRequest ? '(Aguardando Aprovação)' : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {needsMyApproval && (
                    <>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8" onClick={() => handleUpdateStatus(link.id, 'active')}>
                        <CheckCircle className="w-4 h-4 mr-1" /> Aceitar
                      </Button>
                      <Button size="sm" variant="destructive" className="h-8" onClick={() => handleUpdateStatus(link.id, 'rejected')}>
                        <XCircle className="w-4 h-4 mr-1" /> Rejeitar
                      </Button>
                    </>
                  )}
                  {(link.status === 'active' || isMyRequest || link.status === 'rejected') && (
                    <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10 h-8" onClick={() => handleDelete(link.id)}>
                      Remover
                    </Button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
