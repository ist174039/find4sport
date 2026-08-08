'use client'

import { useState, useEffect } from 'react'
import { Search, Loader2, MessageSquarePlus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getUserAvatarUrl, getUserDisplayName, getUserRoleLabel } from '@/lib/user-display'
import { UserAvatar } from '@/components/user-avatar'

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
  currentUserId,
}: {
  open: boolean
  onClose: () => void
  onSelectContact: (contact: any) => void
  currentUserId: string
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

      const [usersRes, professionalsRes, spacesRes] = await Promise.all([
        supabase
          .from('platform_users')
          .select('id, full_name, avatar_url, type')
          .ilike('full_name', `%${query}%`)
          .limit(10),
        supabase
          .from('professionals')
          .select('user_id, full_name, professional_name, avatar_url')
          .or(`full_name.ilike.%${query}%,professional_name.ilike.%${query}%`)
          .limit(10),
        supabase
          .from('sport_spaces')
          .select('owner_user_id, name, logo_url')
          .ilike('name', `%${query}%`)
          .limit(10),
      ])

      const byUserId = new Map<string, SearchResult>()

      ;(usersRes.data || [])
        .filter((u) => u.id !== currentUserId)
        .forEach((u) => {
          byUserId.set(u.id, {
            id: u.id,
            full_name: u.full_name || 'Utilizador',
            avatar_url: u.avatar_url || '',
            type: u.type || 'athlete',
          })
        })

      ;(professionalsRes.data || [])
        .filter((p) => p.user_id && p.user_id !== currentUserId)
        .forEach((p) => {
          const id = p.user_id as string
          const current = byUserId.get(id)
          byUserId.set(id, {
            id,
            full_name: getUserDisplayName({
              type: 'professional',
              full_name: current?.full_name,
              professional_name: p.professional_name,
              professional_full_name: p.full_name,
            }),
            avatar_url: getUserAvatarUrl({
              type: 'professional',
              avatar_url: current?.avatar_url,
              professional_avatar_url: p.avatar_url,
            }),
            type: 'professional',
          })
        })

      ;(spacesRes.data || [])
        .filter((s) => s.owner_user_id && s.owner_user_id !== currentUserId)
        .forEach((s) => {
          const id = s.owner_user_id as string
          const current = byUserId.get(id)
          byUserId.set(id, {
            id,
            full_name: getUserDisplayName({
              type: 'venue_manager',
              full_name: current?.full_name,
              space_name: s.name,
            }),
            avatar_url: getUserAvatarUrl({
              type: 'venue_manager',
              avatar_url: current?.avatar_url,
              space_logo_url: s.logo_url,
            }),
            type: 'venue_manager',
          })
        })

      const sorted = [...byUserId.values()]
        .sort((a, b) => a.full_name.localeCompare(b.full_name, 'pt'))
        .slice(0, 15)

      setResults(sorted)
      setLoading(false)
    }

    const timer = setTimeout(searchContacts, 400)
    return () => clearTimeout(timer)
  }, [query, currentUserId])

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="w-full max-w-md h-[500px] max-h-[80vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b border-border bg-muted/20">
          <DialogTitle className="flex items-center gap-2 font-bold text-foreground">
            <MessageSquarePlus className="w-5 h-5 text-primary" />
            Nova Conversa
          </DialogTitle>
        </DialogHeader>

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

        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="flex items-center justify-center h-full text-primary">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              {results.map((user) => {
                const roleLabel = getUserRoleLabel(user.type)
                return (
                  <button
                    key={user.id}
                    onClick={() => onSelectContact({
                      id: user.id,
                      name: user.full_name,
                      avatar: user.avatar_url,
                      role: roleLabel,
                      unread: 0,
                      lastMsg: '',
                      lastMsgDate: new Date().toISOString(),
                    })}
                    className="w-full text-left p-3 flex items-center gap-3 rounded-xl hover:bg-muted/50 transition-all"
                  >
                    <UserAvatar name={user.full_name || 'Utilizador'} src={user.avatar_url} size="lg" roleLabel={roleLabel} />
                    <div>
                      <h3 className="font-semibold text-sm text-foreground">{user.full_name || 'Utilizador'}</h3>
                      <p className="text-xs text-primary font-medium">{roleLabel}</p>
                    </div>
                  </button>
                )
              })}
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
      </DialogContent>
    </Dialog>
  )
}
