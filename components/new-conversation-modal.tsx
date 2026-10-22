'use client'

import { useEffect, useState } from 'react'
import { Search, Loader2, MessageSquarePlus } from 'lucide-react'
import { searchConversationContacts } from '@/app/actions/messages'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getUserRoleLabel } from '@/lib/user-display'
import { UserAvatar } from '@/components/user-avatar'

type SearchResult = {
  id: string
  full_name: string
  avatar_url: string
  type: string
}

type ConversationContact = {
  id: string
  name: string
  avatar: string
  role: string
  unread: number
  lastMsg: string
  lastMsgDate: string
}

export function NewConversationModal({ 
  open, 
  onClose,
  onSelectContact,
}: {
  open: boolean
  onClose: () => void
  onSelectContact: (contact: ConversationContact) => void
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let active = true
    const searchContacts = async () => {
      const trimmedQuery = query.trim()
      if (trimmedQuery.length < 2 || trimmedQuery.length > 80) {
        setResults([])
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const contacts = await searchConversationContacts(trimmedQuery)
        if (active) setResults(contacts)
      } catch {
        if (active) setResults([])
      } finally {
        if (active) setLoading(false)
      }
    }

    const timer = setTimeout(() => { void searchContacts() }, 400)
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [query])

  function closeModal() {
    setQuery('')
    setResults([])
    setLoading(false)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(value) => !value && closeModal()}>
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
              <p className="text-sm">Nenhum resultado encontrado para &quot;{query}&quot;</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6 text-center opacity-70">
              <MessageSquarePlus className="w-8 h-8 mb-3 opacity-20" />
              <p className="text-sm">Escreva o nome de quem procura para iniciar uma nova conversa.</p>
              <p className="text-xs mt-2 opacity-60 max-w-[250px]">
                O envio de mensagens requer uma reserva ativa ou participação paga num evento ativo.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
