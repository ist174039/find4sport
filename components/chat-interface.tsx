'use client'

import { useState, useEffect, useRef } from 'react'
import { format, isToday, isYesterday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Search, Phone, Video, MoreVertical, Send, CheckCheck, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { sendMessage, markAsRead } from '@/app/actions/messages'
import { createClient } from '@/lib/supabase/client'

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
  const [contacts, setContacts] = useState<Contact[]>(initialContacts)
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [activeContactId, setActiveContactId] = useState<string | null>(initialContacts[0]?.id || null)
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const activeContact = contacts.find((c) => c.id === activeContactId)
  const activeMessages = messages
    .filter(
      (m) =>
        (m.sender_id === currentUserId && m.receiver_id === activeContactId) ||
        (m.receiver_id === currentUserId && m.sender_id === activeContactId)
    )
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeMessages])

  // Mark messages as read
  useEffect(() => {
    if (activeContactId) {
      const unreadMessages = activeMessages.filter(
        (m) => m.receiver_id === currentUserId && !m.read_at
      )
      if (unreadMessages.length > 0) {
        markAsRead(unreadMessages.map((m) => m.id)).then(() => {
          setMessages((prev) =>
            prev.map((m) =>
              unreadMessages.find((u) => u.id === m.id)
                ? { ...m, read_at: new Date().toISOString() }
                : m
            )
          )
          setContacts((prev) =>
            prev.map((c) =>
              c.id === activeContactId ? { ...c, unread: 0 } : c
            )
          )
        })
      }
    }
  }, [activeContactId, activeMessages, currentUserId])

  // Real-time subscription
  useEffect(() => {
    const supabase = createClient()
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
          setMessages((prev) => [...prev, newMsg])
          
          // Update contacts list if message is from an existing contact
          setContacts((prev) => {
            const exists = prev.find(c => c.id === newMsg.sender_id)
            if (exists) {
              return prev.map(c => 
                c.id === newMsg.sender_id 
                  ? { 
                      ...c, 
                      lastMsg: newMsg.content, 
                      lastMsgDate: newMsg.created_at,
                      unread: activeContactId === newMsg.sender_id ? c.unread : c.unread + 1 
                    } 
                  : c
              )
            }
            // If it's a new contact, ideally we'd fetch their profile and add to the list
            // For now, we'll just reload the page to fetch the new contact
            window.location.reload()
            return prev
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUserId, activeContactId])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeContactId || isSending) return

    setIsSending(true)
    try {
      await sendMessage(activeContactId, newMessage)
      
      // Optimistically add message
      const optMsg: Message = {
        id: Math.random().toString(),
        content: newMessage,
        created_at: new Date().toISOString(),
        sender_id: currentUserId,
        receiver_id: activeContactId,
        read_at: null
      }
      setMessages((prev) => [...prev, optMsg])
      
      // Update contact list
      setContacts((prev) => 
        prev.map(c => 
          c.id === activeContactId 
            ? { ...c, lastMsg: newMessage, lastMsgDate: optMsg.created_at } 
            : c
        )
      )
      
      setNewMessage('')
    } catch (error) {
      console.error(error)
      alert('Erro ao enviar mensagem')
    } finally {
      setIsSending(false)
    }
  }

  const formatMessageTime = (dateStr: string) => {
    return format(new Date(dateStr), 'HH:mm')
  }

  const formatDayHeader = (dateStr: string) => {
    const date = new Date(dateStr)
    if (isToday(date)) return 'Hoje'
    if (isYesterday(date)) return 'Ontem'
    return format(date, "dd 'de' MMMM", { locale: ptBR })
  }

  // Group messages by day
  const groupedMessages: { [key: string]: Message[] } = {}
  activeMessages.forEach(msg => {
    const day = formatDayHeader(msg.created_at)
    if (!groupedMessages[day]) groupedMessages[day] = []
    groupedMessages[day].push(msg)
  })

  const formatContactTime = (dateStr: string) => {
    const date = new Date(dateStr)
    if (isToday(date)) return format(date, 'HH:mm')
    if (isYesterday(date)) return 'Ontem'
    return format(date, 'dd/MM')
  }

  return (
    <div className="h-[calc(100vh-8rem)] min-h-[500px] max-w-6xl mx-auto flex gap-6 animate-in fade-in duration-500">
      {/* Left Sidebar - Contacts List */}
      <div className="w-full md:w-80 lg:w-96 flex flex-col rounded-xl border border-border bg-card overflow-hidden shrink-0 hidden md:flex">
        <div className="p-4 border-b border-border bg-muted/20">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            Conversas{' '}
            {contacts.reduce((acc, c) => acc + c.unread, 0) > 0 && (
              <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-bold">
                {contacts.reduce((acc, c) => acc + c.unread, 0)}
              </span>
            )}
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Pesquisar conversas..."
              className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {contacts.length === 0 ? (
            <div className="text-center p-4 text-muted-foreground text-sm">
              Nenhuma conversa encontrada.
            </div>
          ) : (
            contacts
              .sort((a, b) => new Date(b.lastMsgDate).getTime() - new Date(a.lastMsgDate).getTime())
              .map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => setActiveContactId(contact.id)}
                  className={`w-full text-left p-3 flex items-center gap-3 rounded-lg transition-all ${
                    activeContactId === contact.id
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-muted/50 border border-transparent'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={contact.avatar || 'https://i.pravatar.cc/150'}
                      alt={contact.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3
                        className={`font-semibold text-xs truncate ${
                          activeContactId === contact.id ? 'text-primary' : 'text-foreground'
                        }`}
                      >
                        {contact.name || 'Utilizador'}
                      </h3>
                      <span className="text-[9px] text-muted-foreground shrink-0 ml-2">
                        {formatContactTime(contact.lastMsgDate)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p
                        className={`text-xs truncate max-w-[150px] ${
                          contact.unread > 0
                            ? 'text-foreground font-semibold'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {contact.lastMsg}
                      </p>
                      {contact.unread > 0 && (
                        <span className="w-4.5 h-4.5 bg-primary text-primary-foreground rounded-full text-[9px] flex items-center justify-center font-bold shrink-0">
                          {contact.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
          )}
        </div>
      </div>

      {/* Right Area - Active Chat */}
      <div className="flex-1 flex flex-col rounded-xl border border-border bg-card overflow-hidden relative">
        {activeContact ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-card flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <img
                  src={activeContact.avatar || 'https://i.pravatar.cc/150'}
                  alt={activeContact.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h2 className="font-bold text-foreground text-sm">{activeContact.name || 'Utilizador'}</h2>
                  <p className="text-xs text-primary font-medium">{activeContact.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden sm:inline-flex rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 h-8 w-8"
                >
                  <Phone className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden sm:inline-flex rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 h-8 w-8"
                >
                  <Video className="h-4 w-4" />
                </Button>
                <div className="w-px h-5 bg-border mx-1 hidden sm:block"></div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-lg text-muted-foreground hover:text-foreground h-8 w-8"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 z-10 flex flex-col bg-muted/5">
              {Object.entries(groupedMessages).map(([day, msgs]) => (
                <div key={day} className="space-y-4">
                  <div className="text-center">
                    <span className="text-[9px] font-bold tracking-wider uppercase bg-muted/60 text-muted-foreground px-2.5 py-1 rounded-md">
                      {day}
                    </span>
                  </div>
                  {msgs.map((msg) => {
                    const isMine = msg.sender_id === currentUserId
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-3 max-w-[80%] ${
                          isMine ? 'self-end flex-row-reverse' : ''
                        }`}
                      >
                        {!isMine && (
                          <img
                            src={activeContact.avatar || 'https://i.pravatar.cc/150'}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover shrink-0 mt-auto"
                          />
                        )}
                        <div>
                          <div
                            className={`p-3.5 rounded-xl text-xs ${
                              isMine
                                ? 'bg-primary text-primary-foreground rounded-br-sm shadow-sm'
                                : 'bg-muted/40 text-foreground rounded-bl-sm border border-border'
                            }`}
                          >
                            {msg.content}
                          </div>
                          <div
                            className={`flex items-center gap-1 mt-1 ${
                              isMine ? 'justify-end mr-1' : 'ml-1'
                            }`}
                          >
                            <span className="text-[9px] text-muted-foreground">
                              {formatMessageTime(msg.created_at)}
                            </span>
                            {isMine && msg.read_at && (
                              <CheckCheck className="h-3 w-3 text-primary" />
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

            {/* Chat Input */}
            <div className="p-4 bg-card border-t border-border z-10">
              <form
                onSubmit={handleSend}
                className="flex items-center gap-2 bg-muted/20 border border-border rounded-xl p-1.5 pr-2 focus-within:bg-muted/30 focus-within:border-primary/50 transition-all"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="rounded-lg text-muted-foreground hover:text-foreground shrink-0 h-9 w-9"
                >
                  <Plus className="h-4.5 w-4.5" />
                </Button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escreve uma mensagem..."
                  className="flex-1 bg-transparent border-none focus:outline-none text-xs placeholder:text-muted-foreground/75 min-w-0"
                  disabled={isSending}
                />
                <Button
                  type="submit"
                  disabled={isSending || !newMessage.trim()}
                  size="icon"
                  className="rounded-lg bg-primary hover:bg-primary/90 h-9 w-9 shrink-0 shadow-sm disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5 ml-0.5" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <span className="material-symbols-outlined text-5xl mb-4 opacity-50">
              forum
            </span>
            <p className="text-sm">Selecione uma conversa para começar</p>
          </div>
        )}
      </div>
    </div>
  )
}
