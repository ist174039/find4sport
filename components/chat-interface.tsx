'use client'

import { useEffect, useRef, useState } from 'react'
import { format, isToday, isYesterday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowLeft, Check, CheckCheck, MessageSquare, MessageSquarePlus, Search, Send } from 'lucide-react'
import { useModal } from '@/components/providers/modal-provider'
import { Button } from '@/components/ui/button'
import { sendMessage, markAsRead } from '@/app/actions/messages'
import { createClient } from '@/lib/supabase/client'
import { NewConversationModal } from './new-conversation-modal'
import { getUserAvatarUrl, getUserDisplayName, getUserRoleLabel } from '@/lib/user-display'
import { UserAvatar } from '@/components/user-avatar'

export type Message = {
  id: string
  content: string
  created_at: string
  sender_id: string
  receiver_id: string
  read_at: string | null
}

export type Contact = {
  id: string
  name: string
  avatar: string
  role: string
  unread: number
  lastMsg: string
  lastMsgDate: string
}

export function ChatInterface({
  initialContacts,
  initialMessages,
  currentUserId,
}: {
  initialContacts: Contact[]
  initialMessages: Message[]
  currentUserId: string
}) {
  const { showAlert } = useModal()
  const [contacts, setContacts] = useState<Contact[]>(initialContacts)
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [activeContactId, setActiveContactId] = useState<string | null>(initialContacts[0]?.id || null)
  const [mobileChatOpen, setMobileChatOpen] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [contactSearch, setContactSearch] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const activeContact = contacts.find((contact) => contact.id === activeContactId)
  const activeMessages = messages
    .filter(
      (message) =>
        (message.sender_id === currentUserId && message.receiver_id === activeContactId) ||
        (message.receiver_id === currentUserId && message.sender_id === activeContactId),
    )
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  const filteredContacts = contacts
    .filter((contact) => {
      const query = contactSearch.trim().toLowerCase()
      if (!query) return true
      return (
        contact.name.toLowerCase().includes(query) ||
        contact.role.toLowerCase().includes(query) ||
        contact.lastMsg.toLowerCase().includes(query)
      )
    })
    .sort((a, b) => new Date(b.lastMsgDate).getTime() - new Date(a.lastMsgDate).getTime())

  const unreadTotal = contacts.reduce((total, contact) => total + contact.unread, 0)

  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const distanceToBottom = container.scrollHeight - container.scrollTop - container.clientHeight
    if (distanceToBottom < 160) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [activeMessages])

  useEffect(() => {
    if (!activeContactId) return

    const unreadMessages = activeMessages.filter(
      (message) => message.receiver_id === currentUserId && !message.read_at,
    )

    if (unreadMessages.length === 0) return

    void markAsRead(unreadMessages.map((message) => message.id)).then(() => {
      const now = new Date().toISOString()
      setMessages((previous) =>
        previous.map((message) =>
          unreadMessages.some((unread) => unread.id === message.id)
            ? { ...message, read_at: now }
            : message,
        ),
      )
      setContacts((previous) =>
        previous.map((contact) =>
          contact.id === activeContactId ? { ...contact, unread: 0 } : contact,
        ),
      )
    })
  }, [activeContactId, activeMessages, currentUserId])

  useEffect(() => {
    const supabase = createClient()

    const upsertContactFromMessage = async (senderId: string, newMsg: Message) => {
      const [{ data: profile }, { data: professional }, { data: space }] = await Promise.all([
        supabase
          .from('platform_users')
          .select('id, full_name, avatar_url, type')
          .eq('id', senderId)
          .maybeSingle(),
        supabase
          .from('professionals')
          .select('user_id, professional_name, full_name, avatar_url')
          .eq('user_id', senderId)
          .maybeSingle(),
        supabase
          .from('sport_spaces')
          .select('owner_user_id, name, logo_url')
          .eq('owner_user_id', senderId)
          .maybeSingle(),
      ])

      const roleValue = profile?.type || (space ? 'venue_manager' : professional ? 'professional' : 'athlete')
      const contact: Contact = {
        id: senderId,
        name: getUserDisplayName({
          type: roleValue,
          full_name: profile?.full_name,
          professional_name: professional?.professional_name,
          professional_full_name: professional?.full_name,
          space_name: space?.name,
        }),
        avatar: getUserAvatarUrl({
          type: roleValue,
          avatar_url: profile?.avatar_url,
          professional_avatar_url: professional?.avatar_url,
          space_logo_url: space?.logo_url,
        }),
        role: getUserRoleLabel(roleValue),
        unread: activeContactId === senderId ? 0 : 1,
        lastMsg: newMsg.content,
        lastMsgDate: newMsg.created_at,
      }

      setContacts((previous) => {
        const existing = previous.find((item) => item.id === senderId)
        if (!existing) return [contact, ...previous]

        return previous.map((item) =>
          item.id === senderId
            ? {
                ...item,
                ...contact,
                unread: activeContactId === senderId ? item.unread : item.unread + 1,
              }
            : item,
        )
      })
    }

    const channel = supabase
      .channel('messages_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${currentUserId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message
          setMessages((previous) => [...previous, newMsg])
          void upsertContactFromMessage(newMsg.sender_id, newMsg)
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [currentUserId, activeContactId])

  const selectContact = (contactId: string) => {
    setActiveContactId(contactId)
    setMobileChatOpen(true)
  }

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault()
    const content = newMessage.trim()
    if (!content || !activeContactId || isSending) return

    setIsSending(true)
    try {
      await sendMessage(activeContactId, content)

      const optimisticMessage: Message = {
        id: `optimistic-${Date.now()}`,
        content,
        created_at: new Date().toISOString(),
        sender_id: currentUserId,
        receiver_id: activeContactId,
        read_at: null,
      }

      setMessages((previous) => [...previous, optimisticMessage])
      setContacts((previous) =>
        previous.map((contact) =>
          contact.id === activeContactId
            ? { ...contact, lastMsg: content, lastMsgDate: optimisticMessage.created_at }
            : contact,
        ),
      )
      setNewMessage('')
    } catch (error) {
      console.error(error)
      showAlert('Erro', 'Não foi possível enviar a mensagem.', 'error')
    } finally {
      setIsSending(false)
    }
  }

  const formatMessageTime = (dateStr: string) => format(new Date(dateStr), 'HH:mm')

  const formatDayHeader = (dateStr: string) => {
    const date = new Date(dateStr)
    if (isToday(date)) return 'Hoje'
    if (isYesterday(date)) return 'Ontem'
    return format(date, "dd 'de' MMMM", { locale: ptBR })
  }

  const groupedMessages: Record<string, Message[]> = {}
  activeMessages.forEach((message) => {
    const day = formatDayHeader(message.created_at)
    if (!groupedMessages[day]) groupedMessages[day] = []
    groupedMessages[day].push(message)
  })

  const formatContactTime = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    if (isToday(date)) return format(date, 'HH:mm')
    if (isYesterday(date)) return 'Ontem'
    return format(date, 'dd/MM')
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-7rem)] min-h-[420px] w-full max-w-6xl gap-0 overflow-hidden rounded-xl border border-border bg-card animate-in fade-in duration-300 md:h-[calc(100vh-8rem)] md:gap-6 md:overflow-visible md:border-0 md:bg-transparent">
      <aside
        className={`${mobileChatOpen ? 'hidden md:flex' : 'flex'} w-full flex-col overflow-hidden bg-card md:w-80 md:shrink-0 md:rounded-xl md:border md:border-border lg:w-96`}
      >
        <div className="border-b border-border bg-muted/20 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="flex min-w-0 items-center gap-2 text-lg font-bold">
              <span className="truncate">Conversas</span>
              {unreadTotal > 0 && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
                  {unreadTotal}
                </span>
              )}
            </h2>
            <Button
              type="button"
              onClick={() => setIsNewChatModalOpen(true)}
              size="icon"
              className="h-11 w-11 shrink-0 rounded-xl"
              aria-label="Nova conversa"
            >
              <MessageSquarePlus className="h-5 w-5" />
            </Button>
          </div>

          <label className="relative block">
            <span className="sr-only">Pesquisar conversas</span>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              inputMode="search"
              placeholder="Pesquisar conversas..."
              value={contactSearch}
              onChange={(event) => setContactSearch(event.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto overscroll-contain p-2">
          {filteredContacts.length === 0 ? (
            <div className="flex h-full min-h-48 flex-col items-center justify-center px-6 text-center text-muted-foreground">
              <MessageSquare className="mb-3 h-8 w-8 opacity-30" />
              <p className="text-sm font-medium">Nenhuma conversa encontrada.</p>
            </div>
          ) : (
            filteredContacts.map((contact) => (
              <button
                key={contact.id}
                type="button"
                onClick={() => selectContact(contact.id)}
                className={`flex min-h-16 w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors active:scale-[0.99] ${
                  activeContactId === contact.id
                    ? 'border-primary/20 bg-primary/10'
                    : 'border-transparent hover:bg-muted/60'
                }`}
              >
                <UserAvatar
                  name={contact.name || 'Utilizador'}
                  src={contact.avatar}
                  size="lg"
                  roleLabel={contact.role}
                />
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 flex items-baseline justify-between gap-2">
                    <h3 className="truncate text-sm font-semibold text-foreground">{contact.name || 'Utilizador'}</h3>
                    <span className="shrink-0 text-[11px] text-muted-foreground">{formatContactTime(contact.lastMsgDate)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className={`truncate text-xs ${contact.unread > 0 ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                      {contact.lastMsg || contact.role}
                    </p>
                    {contact.unread > 0 && (
                      <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                        {contact.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      <section
        className={`${mobileChatOpen ? 'flex' : 'hidden md:flex'} min-w-0 flex-1 flex-col overflow-hidden bg-card md:rounded-xl md:border md:border-border`}
      >
        {activeContact ? (
          <>
            <header className="flex min-h-16 items-center gap-2 border-b border-border bg-card px-2 py-2 sm:px-4">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setMobileChatOpen(false)}
                className="h-11 w-11 shrink-0 rounded-xl md:hidden"
                aria-label="Voltar às conversas"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <UserAvatar
                name={activeContact.name || 'Utilizador'}
                src={activeContact.avatar}
                size="lg"
                roleLabel={activeContact.role}
              />
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-sm font-bold text-foreground">{activeContact.name || 'Utilizador'}</h2>
                <p className="truncate text-xs font-medium text-primary">{activeContact.role}</p>
              </div>
            </header>

            <div
              ref={messagesContainerRef}
              className="messages-container flex flex-1 flex-col gap-4 overflow-y-auto overscroll-contain bg-muted/5 px-3 py-4 sm:px-4"
            >
              {activeMessages.length === 0 && (
                <div className="m-auto max-w-xs px-6 text-center text-muted-foreground">
                  <MessageSquare className="mx-auto mb-3 h-9 w-9 opacity-30" />
                  <p className="text-sm font-medium text-foreground">Comece a conversa</p>
                  <p className="mt-1 text-xs">Envie uma mensagem para {activeContact.name || 'este contacto'}.</p>
                </div>
              )}

              {Object.entries(groupedMessages).map(([day, dayMessages]) => (
                <div key={day} className="space-y-3">
                  <div className="sticky top-0 z-[1] text-center">
                    <span className="rounded-full bg-background/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground shadow-sm backdrop-blur">
                      {day}
                    </span>
                  </div>

                  {dayMessages.map((message) => {
                    const isMine = message.sender_id === currentUserId
                    return (
                      <div
                        key={message.id}
                        className={`flex max-w-[88%] gap-2 sm:max-w-[78%] ${isMine ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                      >
                        {!isMine && (
                          <UserAvatar
                            name={activeContact.name || 'Utilizador'}
                            src={activeContact.avatar}
                            size="sm"
                            className="mt-auto hidden sm:flex"
                            roleLabel={activeContact.role}
                          />
                        )}
                        <div className="min-w-0">
                          <div
                            className={`whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                              isMine
                                ? 'rounded-br-md bg-primary text-primary-foreground'
                                : 'rounded-bl-md border border-border bg-card text-foreground'
                            }`}
                          >
                            {message.content}
                          </div>
                          <div className={`mt-1 flex items-center gap-1 ${isMine ? 'justify-end pr-1' : 'pl-1'}`}>
                            <span className="text-[10px] text-muted-foreground">{formatMessageTime(message.created_at)}</span>
                            {isMine && (
                              message.read_at
                                ? <CheckCheck className="h-3.5 w-3.5 text-primary" />
                                : <Check className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-border bg-card p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:p-3">
              <form onSubmit={handleSend} className="flex items-end gap-2">
                <label className="min-w-0 flex-1">
                  <span className="sr-only">Mensagem</span>
                  <textarea
                    value={newMessage}
                    onChange={(event) => setNewMessage(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                        event.preventDefault()
                        event.currentTarget.form?.requestSubmit()
                      }
                    }}
                    placeholder="Escreve uma mensagem..."
                    rows={1}
                    maxLength={4000}
                    disabled={isSending}
                    className="max-h-32 min-h-11 w-full resize-none rounded-2xl border border-border bg-muted/20 px-4 py-3 text-[16px] leading-5 outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20"
                  />
                </label>
                <Button
                  type="submit"
                  disabled={isSending || !newMessage.trim()}
                  size="icon"
                  className="h-11 w-11 shrink-0 rounded-xl"
                  aria-label="Enviar mensagem"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center text-muted-foreground">
            <MessageSquare className="mb-4 h-10 w-10 opacity-30" />
            <p className="text-sm font-medium text-foreground">Selecione uma conversa</p>
            <Button onClick={() => setIsNewChatModalOpen(true)} className="mt-4 min-h-11 rounded-xl">
              <MessageSquarePlus className="mr-2 h-4 w-4" /> Nova conversa
            </Button>
          </div>
        )}
      </section>

      <NewConversationModal
        open={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        currentUserId={currentUserId}
        onSelectContact={(contact) => {
          setIsNewChatModalOpen(false)
          setContacts((previous) => {
            const existing = previous.find((item) => item.id === contact.id)
            if (!existing) return [contact, ...previous]
            return previous.map((item) => (item.id === contact.id ? { ...item, ...contact } : item))
          })
          selectContact(contact.id)
        }}
      />
    </div>
  )
}
