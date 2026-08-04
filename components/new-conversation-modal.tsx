'use client'

import { useState, useEffect } from 'react'
import { Search, X, Loader2, MessageSquarePlus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type SearchResult = {
  id: string
  full_name: string
  avatar_url: string
  type: string
}

export function NewConversationModal({ 
  open, 
  onClose,
  onSelectContact,
  currentUserRole
}: {
  open: boolean
  onClose: () => void
  onSelectContact: (contact: any) => void
  currentUserRole: string
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) {
      setQuery('')
      setResults([])
    }
  }, [open])

  useEffect(() => {
    const searchContacts = async () => {
      if (query.trim().length < 2) {
        setResults([])
        return
      }

      setLoading(true)
      const supabase = createClient()
      
      // Construir query base (procurar por nome)
      let dbQuery = supabase
        .from('platform_users')
        .select('id, full_name, avatar_url, type')
        .ilike('full_name', `%${query}%`)
        .limit(10)

      const { data } = await dbQuery
      setResults(data || [])
      setLoading(false)
    }

    const timer = setTimeout(searchContacts, 400)
    return () => clearTimeout(timer)
  }, [query, currentUserRole])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-md flex flex-col rounded-3xl overflow-hidden shadow-xl relative animate-in zoom-in-95 duration-200 h-[500px] max-h-[80vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <MessageSquarePlus className="w-5 h-5 text-primary" />
            Nova Conversa
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pesquisar utilizadores, profissionais ou espaços..."
              className="w-full bg-muted/30 border border-border rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="flex items-center justify-center h-full text-primary">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              {results.map((user) => (
                <button
                  key={user.id}
                  onClick={() => onSelectContact({
                    id: user.id,
                    name: user.full_name,
                    avatar: user.avatar_url,
                    role: user.type === 'professional' ? 'Profissional' : (user.type === 'sport_space' ? 'Espaço' : 'Utilizador'),
                    unread: 0,
                    lastMsg: '',
                    lastMsgDate: new Date().toISOString()
                  })}
                  className="w-full text-left p-3 flex items-center gap-3 rounded-xl hover:bg-muted/50 transition-all"
                >
                  <img
                    src={user.avatar_url || 'https://i.pravatar.cc/150'}
                    alt={user.full_name}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">{user.full_name || 'Utilizador'}</h3>
                    <p className="text-xs text-primary font-medium">{user.type === 'professional' ? 'Profissional' : (user.type === 'sport_space' ? 'Espaço' : 'Utilizador')}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : query.trim().length >= 2 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6 text-center">
              <Search className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-sm">Nenhum resultado encontrado para "{query}"</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6 text-center opacity-70">
              <MessageSquarePlus className="w-8 h-8 mb-3 opacity-20" />
              <p className="text-sm">Escreva o nome de quem procura para iniciar uma nova conversa.</p>
              <p className="text-xs mt-2 opacity-60 max-w-[250px]">
                Pode contactar qualquer utilizador, profissional ou espaço desportivo na rede.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
