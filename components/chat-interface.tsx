'use client'

import { useEffect, useRef, useState } from 'react'
import { format, isToday, isYesterday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Archive, ArrowLeft, Check, CheckCheck, MessageSquare, Search, Send } from 'lucide-react'
import { useModal } from '@/components/providers/modal-provider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { sendMessage, markAsRead } from '@/app/actions/messages'
import { createClient } from '@/lib/supabase/client'
import { UserAvatar } from '@/components/user-avatar'

export type Message = { id: string; content: string; created_at: string; sender_id: string; receiver_id: string; read_at: string | null }
export type Contact = { id: string; name: string; avatar: string; role: string; unread: number; lastMsg: string; lastMsgDate: string; archived?: boolean; contextLabel?: string }

export function ChatInterface({ initialContacts, initialMessages, currentUserId }: { initialContacts: Contact[]; initialMessages: Message[]; currentUserId: string }) {
  const { showAlert } = useModal()
  const [contacts, setContacts] = useState<Contact[]>(initialContacts)
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [activeContactId, setActiveContactId] = useState<string | null>(initialContacts[0]?.id || null)
  const [mobileChatOpen, setMobileChatOpen] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [contactSearch, setContactSearch] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const activeContact = contacts.find(contact => contact.id === activeContactId)
  const activeMessages = messages.filter(message => (message.sender_id === currentUserId && message.receiver_id === activeContactId) || (message.receiver_id === currentUserId && message.sender_id === activeContactId)).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  const filteredContacts = contacts.filter(contact => { const q=contactSearch.trim().toLowerCase(); return !q || contact.name.toLowerCase().includes(q) || contact.role.toLowerCase().includes(q) || contact.lastMsg.toLowerCase().includes(q) }).sort((a,b)=>Number(Boolean(a.archived))-Number(Boolean(b.archived)) || new Date(b.lastMsgDate).getTime()-new Date(a.lastMsgDate).getTime())
  const unreadTotal = contacts.reduce((total, contact) => total + contact.unread, 0)

  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return
    const distance = container.scrollHeight - container.scrollTop - container.clientHeight
    if (distance < 160) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeMessages])

  useEffect(() => {
    if (!activeContactId) return
    const unreadMessages = activeMessages.filter(message => message.receiver_id === currentUserId && !message.read_at)
    if (!unreadMessages.length) return
    void markAsRead(unreadMessages.map(message => message.id)).then(() => {
      const now = new Date().toISOString()
      setMessages(previous => previous.map(message => unreadMessages.some(unread => unread.id === message.id) ? { ...message, read_at: now } : message))
      setContacts(previous => previous.map(contact => contact.id === activeContactId ? { ...contact, unread: 0 } : contact))
    })
  }, [activeContactId, activeMessages, currentUserId])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase.channel('messages_changes').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${currentUserId}` }, payload => {
      const newMsg = payload.new as Message
      setMessages(previous => previous.some(message => message.id === newMsg.id) ? previous : [...previous, newMsg])
      setContacts(previous => previous.map(contact => contact.id === newMsg.sender_id ? { ...contact, unread: activeContactId === newMsg.sender_id ? 0 : contact.unread + 1, lastMsg: newMsg.content, lastMsgDate: newMsg.created_at } : contact))
    }).subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [currentUserId, activeContactId])

  const selectContact = (contactId: string) => { setActiveContactId(contactId); setMobileChatOpen(true) }
  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault()
    const content = newMessage.trim()
    if (!content || !activeContactId || isSending || activeContact?.archived) return
    setIsSending(true)
    try {
      const result = await sendMessage(activeContactId, content)
      const optimisticMessage: Message = { id: result?.id || `optimistic-${Date.now()}`, content, created_at: result?.created_at || new Date().toISOString(), sender_id: currentUserId, receiver_id: activeContactId, read_at: null }
      setMessages(previous => previous.some(message => message.id === optimisticMessage.id) ? previous : [...previous, optimisticMessage])
      setContacts(previous => previous.map(contact => contact.id === activeContactId ? { ...contact, lastMsg: content, lastMsgDate: optimisticMessage.created_at } : contact))
      setNewMessage('')
    } catch (error) {
      showAlert('Mensagem não enviada', error instanceof Error ? error.message : 'Não foi possível enviar a mensagem.', 'error')
    } finally { setIsSending(false) }
  }

  const formatMessageTime = (dateStr: string) => format(new Date(dateStr), 'HH:mm')
  const formatDayHeader = (dateStr: string) => { const date=new Date(dateStr); if(isToday(date))return'Hoje'; if(isYesterday(date))return'Ontem'; return format(date,"dd 'de' MMMM",{locale:ptBR}) }
  const groupedMessages: Record<string, Message[]> = {}
  activeMessages.forEach(message => { const day=formatDayHeader(message.created_at); (groupedMessages[day] ||= []).push(message) })
  const formatContactTime = (dateStr: string) => { if(!dateStr || new Date(dateStr).getTime()===0)return''; const date=new Date(dateStr); if(isToday(date))return format(date,'HH:mm'); if(isYesterday(date))return'Ontem'; return format(date,'dd/MM') }

  return <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl overflow-hidden bg-card md:gap-6 md:rounded-xl md:bg-transparent">
    <aside className={`${mobileChatOpen?'hidden md:flex':'flex'} w-full flex-col overflow-hidden bg-card md:w-80 md:shrink-0 md:rounded-xl md:border md:border-border lg:w-96`}>
      <div className="shrink-0 border-b border-border bg-muted/20 p-4"><div className="mb-3"><h2 className="flex items-center gap-2 text-lg font-bold">Conversas{unreadTotal>0&&<span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">{unreadTotal}</span>}</h2><p className="mt-0.5 text-xs text-muted-foreground">Apenas reservas e eventos pagos. Conversas concluídas ficam arquivadas.</p></div><label className="relative block"><span className="sr-only">Pesquisar conversas</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/><input type="search" inputMode="search" placeholder="Pesquisar conversas..." value={contactSearch} onChange={event=>setContactSearch(event.target.value)} className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"/></label></div>
      <div className="flex-1 space-y-1 overflow-y-auto overscroll-contain p-2">{filteredContacts.length===0?<div className="flex h-full min-h-48 flex-col items-center justify-center px-6 text-center text-muted-foreground"><MessageSquare className="mb-3 h-8 w-8 opacity-30"/><p className="text-sm font-medium text-foreground">Ainda não tens conversas</p><p className="mt-1 text-xs">A conversa fica disponível quando uma reserva ou evento pago é confirmado.</p></div>:filteredContacts.map(contact=><button key={contact.id} type="button" onClick={()=>selectContact(contact.id)} className={`flex min-h-16 w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${activeContactId===contact.id?'border-primary/20 bg-primary/10':'border-transparent hover:bg-muted/60'} ${contact.archived?'opacity-70':''}`}><UserAvatar name={contact.name||'Utilizador'} src={contact.avatar} size="lg" roleLabel={contact.role}/><div className="min-w-0 flex-1"><div className="mb-0.5 flex items-baseline justify-between gap-2"><h3 className="truncate text-sm font-semibold">{contact.name}</h3><span className="shrink-0 text-[11px] text-muted-foreground">{formatContactTime(contact.lastMsgDate)}</span></div><div className="flex items-center gap-1.5"><p className={`min-w-0 flex-1 truncate text-xs ${contact.unread>0?'font-semibold text-foreground':'text-muted-foreground'}`}>{contact.lastMsg}</p>{contact.archived&&<Archive className="h-3.5 w-3.5 shrink-0 text-muted-foreground"/>}{contact.unread>0&&<span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">{contact.unread}</span>}</div></div></button>)}</div>
    </aside>

    <section className={`${mobileChatOpen?'flex':'hidden md:flex'} min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-card md:rounded-xl md:border md:border-border`}>
      {activeContact ? <><header className="sticky top-0 z-20 flex min-h-16 shrink-0 items-center gap-2 border-b border-border bg-card/95 px-2 py-2 backdrop-blur sm:px-4"><Button type="button" variant="ghost" size="icon" onClick={()=>setMobileChatOpen(false)} className="h-11 w-11 shrink-0 rounded-xl md:hidden" aria-label="Voltar às conversas"><ArrowLeft className="h-5 w-5"/></Button><UserAvatar name={activeContact.name} src={activeContact.avatar} size="lg" roleLabel={activeContact.role}/><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h2 className="truncate text-sm font-bold">{activeContact.name}</h2>{activeContact.archived&&<Badge variant="secondary" className="shrink-0 text-[10px]">Arquivada</Badge>}</div><p className="truncate text-xs font-medium text-primary">{activeContact.contextLabel || activeContact.role}</p></div></header>
        <div ref={messagesContainerRef} className="messages-container flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain bg-muted/5 px-3 py-4 sm:px-4">{activeMessages.length===0&&<div className="m-auto max-w-xs px-6 text-center text-muted-foreground"><MessageSquare className="mx-auto mb-3 h-9 w-9 opacity-30"/><p className="text-sm font-medium text-foreground">Conversa disponível</p><p className="mt-1 text-xs">Usa este chat apenas para coordenar a reserva ou evento associado.</p></div>}{Object.entries(groupedMessages).map(([day,dayMessages])=><div key={day} className="space-y-3"><div className="sticky top-0 z-[1] text-center"><span className="rounded-full bg-background/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground shadow-sm backdrop-blur">{day}</span></div>{dayMessages.map(message=>{const isMine=message.sender_id===currentUserId; return <div key={message.id} className={`flex max-w-[88%] gap-2 sm:max-w-[78%] ${isMine?'ml-auto flex-row-reverse':'mr-auto'}`}><div className="min-w-0"><div className={`whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${isMine?'rounded-br-md bg-primary text-primary-foreground':'rounded-bl-md border border-border bg-card text-foreground'}`}>{message.content}</div><div className={`mt-1 flex items-center gap-1 ${isMine?'justify-end pr-1':'pl-1'}`}><span className="text-[10px] text-muted-foreground">{formatMessageTime(message.created_at)}</span>{isMine&&(message.read_at?<CheckCheck className="h-3.5 w-3.5 text-primary"/>:<Check className="h-3.5 w-3.5 text-muted-foreground"/>)}</div></div></div>})}</div>)}<div ref={messagesEndRef}/></div>
        {activeContact.archived?<div className="shrink-0 border-t border-border bg-muted/30 p-3 text-center text-xs text-muted-foreground"><Archive className="mr-1 inline h-3.5 w-3.5"/>Reserva/evento concluído ou cancelado. Esta conversa fica disponível apenas para consulta.</div>:<div className="sticky bottom-0 z-20 shrink-0 border-t border-border bg-card p-2 sm:p-3"><form onSubmit={handleSend} className="flex items-end gap-2"><label className="min-w-0 flex-1"><span className="sr-only">Mensagem</span><textarea value={newMessage} onChange={event=>setNewMessage(event.target.value)} onKeyDown={event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.nativeEvent.isComposing){event.preventDefault();event.currentTarget.form?.requestSubmit()}}} placeholder="Mensagem sobre esta reserva..." rows={1} maxLength={4000} disabled={isSending} className="max-h-32 min-h-11 w-full resize-none rounded-2xl border border-border bg-muted/20 px-4 py-3 text-[16px] leading-5 outline-none focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20"/></label><Button type="submit" disabled={isSending||!newMessage.trim()} size="icon" className="h-11 w-11 shrink-0 rounded-xl" aria-label="Enviar mensagem"><Send className="h-4 w-4"/></Button></form></div>}</> : <div className="flex flex-1 flex-col items-center justify-center px-6 text-center text-muted-foreground"><MessageSquare className="mb-4 h-10 w-10 opacity-30"/><p className="text-sm font-medium text-foreground">Seleciona uma conversa</p><p className="mt-1 max-w-sm text-xs">As conversas são criadas automaticamente a partir de reservas e eventos pagos.</p></div>}
    </section>
  </div>
}
