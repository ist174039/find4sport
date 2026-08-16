'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { format, isToday, isYesterday } from 'date-fns'
import { pt } from 'date-fns/locale'
import { Archive, ArrowLeft, CalendarDays, Check, CheckCheck, ChevronDown, ChevronUp, CircleDollarSign, Clock3, MessageSquare, Search, Send } from 'lucide-react'
import { useModal } from '@/components/providers/modal-provider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { sendMessage, markAsRead } from '@/app/actions/messages'
import { createClient } from '@/lib/supabase/client'
import { UserAvatar } from '@/components/user-avatar'

export type Message = { id:string; content:string; created_at:string; sender_id:string; receiver_id:string; read_at:string|null; thread_id?:string|null }
export type Contact = {
  id:string; userId:string; threadId?:string|null; name:string; avatar:string; role:string; unread:number; lastMsg:string; lastMsgDate:string; archived?:boolean
  contextType?:'reservation'|'event_participant'; contextId?:string; contextKind?:'Serviço'|'Espaço'|'Evento'; contextTitle?:string; contextLabel?:string; contextDetail?:string
  contextDate?:string; contextTime?:string; contextAmount?:number|null; contextStatus?:string; contextSubtitle?:string
}

function money(value?:number|null){return value==null?'':new Intl.NumberFormat('pt-PT',{style:'currency',currency:'EUR'}).format(Number(value))}

export function ChatInterface({initialContacts,initialMessages,currentUserId}:{initialContacts:Contact[];initialMessages:Message[];currentUserId:string}){
  const {showAlert}=useModal()
  const [contacts,setContacts]=useState<Contact[]>(initialContacts)
  const [messages,setMessages]=useState<Message[]>(initialMessages)
  const [activeConversationId,setActiveConversationId]=useState<string|null>(initialContacts[0]?.id||null)
  const [mobileChatOpen,setMobileChatOpen]=useState(false)
  const [newMessage,setNewMessage]=useState('')
  const [contactSearch,setContactSearch]=useState('')
  const [isSending,setIsSending]=useState(false)
  const [showContext,setShowContext]=useState(true)
  const messagesEndRef=useRef<HTMLDivElement>(null)
  const messagesContainerRef=useRef<HTMLDivElement>(null)

  const activeContact=contacts.find(c=>c.id===activeConversationId)
  const activeMessages=useMemo(()=>messages.filter(message=>{
    if(!activeContact)return false
    if(activeContact.threadId)return message.thread_id===activeContact.threadId
    return false
  }).sort((a,b)=>new Date(a.created_at).getTime()-new Date(b.created_at).getTime()),[messages,activeContact])

  const filteredContacts=useMemo(()=>contacts.filter(contact=>{
    const q=contactSearch.trim().toLowerCase();if(!q)return true
    return `${contact.name} ${contact.role} ${contact.contextKind||''} ${contact.contextTitle||''} ${contact.contextDetail||''} ${contact.lastMsg}`.toLowerCase().includes(q)
  }).sort((a,b)=>Number(Boolean(a.archived))-Number(Boolean(b.archived))||new Date(b.lastMsgDate).getTime()-new Date(a.lastMsgDate).getTime()),[contacts,contactSearch])
  const unreadTotal=contacts.reduce((n,c)=>n+c.unread,0)

  useEffect(()=>{const container=messagesContainerRef.current;if(!container)return;const distance=container.scrollHeight-container.scrollTop-container.clientHeight;if(distance<180)messagesEndRef.current?.scrollIntoView({behavior:'smooth'})},[activeMessages])
  useEffect(()=>{setShowContext(true)},[activeConversationId])

  useEffect(()=>{
    if(!activeContact)return
    const unread=activeMessages.filter(m=>m.receiver_id===currentUserId&&!m.read_at);if(!unread.length)return
    void markAsRead(unread.map(m=>m.id)).then(()=>{const now=new Date().toISOString();setMessages(prev=>prev.map(m=>unread.some(u=>u.id===m.id)?{...m,read_at:now}:m));setContacts(prev=>prev.map(c=>c.id===activeContact.id?{...c,unread:0}:c))})
  },[activeContact?.id,currentUserId,activeMessages])

  useEffect(()=>{
    const supabase=createClient()
    const channel=supabase.channel('booking_chat_changes').on('postgres_changes',{event:'INSERT',schema:'public',table:'messages',filter:`receiver_id=eq.${currentUserId}`},payload=>{
      const msg=payload.new as Message;setMessages(prev=>prev.some(m=>m.id===msg.id)?prev:[...prev,msg])
      setContacts(prev=>prev.map(contact=>contact.threadId&&contact.threadId===msg.thread_id?{...contact,unread:activeConversationId===contact.id?0:contact.unread+1,lastMsg:msg.content,lastMsgDate:msg.created_at}:contact))
    }).subscribe()
    return()=>{void supabase.removeChannel(channel)}
  },[currentUserId,activeConversationId])

  const selectContact=(id:string)=>{setActiveConversationId(id);setMobileChatOpen(true)}
  const handleSend=async(event:React.FormEvent)=>{
    event.preventDefault();const content=newMessage.trim();if(!content||!activeContact||isSending||activeContact.archived)return
    setIsSending(true)
    try{
      const result=await sendMessage(activeContact.userId,content,{threadId:activeContact.threadId,contextType:activeContact.contextType||null,contextId:activeContact.contextId||null})
      const threadId=(result as any)?.thread_id||activeContact.threadId||null
      const optimistic:Message={id:(result as any)?.id||`optimistic-${Date.now()}`,content,created_at:(result as any)?.created_at||new Date().toISOString(),sender_id:currentUserId,receiver_id:activeContact.userId,read_at:null,thread_id:threadId}
      setMessages(prev=>prev.some(m=>m.id===optimistic.id)?prev:[...prev,optimistic]);setContacts(prev=>prev.map(c=>c.id===activeContact.id?{...c,threadId,lastMsg:content,lastMsgDate:optimistic.created_at}:c));setNewMessage('')
    }catch(error){showAlert('Mensagem não enviada',error instanceof Error?error.message:'Não foi possível enviar a mensagem.','error')}finally{setIsSending(false)}
  }

  const formatMessageTime=(s:string)=>format(new Date(s),'HH:mm')
  const dayLabel=(s:string)=>{const d=new Date(s);if(isToday(d))return'Hoje';if(isYesterday(d))return'Ontem';return format(d,"dd 'de' MMMM",{locale:pt})}
  const grouped=activeMessages.reduce<Record<string,Message[]>>((acc,m)=>{const day=dayLabel(m.created_at);(acc[day]??=[]).push(m);return acc},{})
  const contactTime=(s:string)=>{if(!s||new Date(s).getTime()===0)return'';const d=new Date(s);if(isToday(d))return format(d,'HH:mm');if(isYesterday(d))return'Ontem';return format(d,'dd/MM')}

  return <div className="mx-auto flex h-full min-h-0 w-full max-w-7xl overflow-hidden bg-card md:gap-4 md:rounded-2xl md:bg-transparent">
    <aside className={`${mobileChatOpen?'hidden md:flex':'flex'} w-full flex-col overflow-hidden bg-card md:w-[360px] md:shrink-0 md:rounded-2xl md:border md:border-border xl:w-[400px]`}>
      <div className="shrink-0 border-b border-border p-4">
        <div className="mb-3 flex items-center justify-between"><div><h1 className="flex items-center gap-2 text-xl font-bold">Mensagens{unreadTotal>0&&<span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">{unreadTotal}</span>}</h1><p className="mt-1 text-xs text-muted-foreground">Uma conversa por reserva ou evento.</p></div></div>
        <label className="relative block"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/><input value={contactSearch} onChange={e=>setContactSearch(e.target.value)} type="search" placeholder="Pesquisar pessoa, serviço ou evento" className="h-11 w-full rounded-xl border border-border bg-muted/30 pl-10 pr-3 text-sm outline-none focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/15"/></label>
      </div>
      <div className="flex-1 overflow-y-auto p-2">{filteredContacts.length===0?<div className="flex min-h-64 flex-col items-center justify-center px-8 text-center"><MessageSquare className="mb-3 h-9 w-9 text-muted-foreground/40"/><p className="font-semibold">Sem conversas</p><p className="mt-1 text-xs text-muted-foreground">Quando uma reserva paga ou evento estiver confirmado, o chat correspondente aparece aqui.</p></div>:filteredContacts.map(contact=><button key={contact.id} onClick={()=>selectContact(contact.id)} className={`mb-1 w-full rounded-2xl p-3 text-left transition ${activeConversationId===contact.id?'bg-primary/10 ring-1 ring-primary/20':'hover:bg-muted/60'} ${contact.archived?'opacity-65':''}`}>
        <div className="flex gap-3"><UserAvatar name={contact.name} src={contact.avatar} size="lg" roleLabel={contact.role}/><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="truncate text-sm font-bold">{contact.name}</p><p className="truncate text-[11px] text-muted-foreground">{contact.role}</p></div><span className="shrink-0 text-[10px] text-muted-foreground">{contactTime(contact.lastMsgDate)}</span></div>
          <div className="mt-2 rounded-lg bg-muted/60 px-2.5 py-2"><div className="flex items-center gap-1.5"><Badge variant="outline" className="h-5 px-1.5 text-[9px] uppercase">{contact.contextKind||'Reserva'}</Badge><p className="min-w-0 flex-1 truncate text-xs font-semibold">{contact.contextTitle||contact.contextLabel}</p></div><p className="mt-1 truncate text-[10px] text-muted-foreground">{contact.contextDetail}</p></div>
          <div className="mt-2 flex items-center gap-2"><p className={`min-w-0 flex-1 truncate text-xs ${contact.unread?'font-semibold':'text-muted-foreground'}`}>{contact.lastMsg}</p>{contact.archived&&<Archive className="h-3.5 w-3.5 text-muted-foreground"/>}{contact.unread>0&&<span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">{contact.unread}</span>}</div>
        </div></div></button>)}</div>
    </aside>

    <section className={`${mobileChatOpen?'flex':'hidden md:flex'} min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-card md:rounded-2xl md:border md:border-border`}>
      {activeContact?<>
        <header className="z-20 shrink-0 border-b border-border bg-card/95 backdrop-blur">
          <div className="flex min-h-16 items-center gap-2 px-2 py-2 sm:px-4"><Button variant="ghost" size="icon" onClick={()=>setMobileChatOpen(false)} className="h-11 w-11 rounded-xl md:hidden"><ArrowLeft className="h-5 w-5"/></Button><UserAvatar name={activeContact.name} src={activeContact.avatar} size="lg" roleLabel={activeContact.role}/><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h2 className="truncate text-sm font-bold sm:text-base">{activeContact.name}</h2>{activeContact.archived&&<Badge variant="secondary" className="text-[10px]">Encerrada</Badge>}</div><p className="truncate text-xs text-muted-foreground">{activeContact.role}</p></div><Button variant="ghost" size="sm" onClick={()=>setShowContext(v=>!v)} className="gap-1 text-xs">Reserva {showContext?<ChevronUp className="h-4 w-4"/>:<ChevronDown className="h-4 w-4"/>}</Button></div>
          {showContext&&<div className="border-t border-border/70 bg-muted/25 px-3 py-3 sm:px-4"><div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="flex items-center gap-2"><Badge>{activeContact.contextKind||'Reserva'}</Badge><h3 className="truncate text-sm font-bold">{activeContact.contextTitle||activeContact.contextLabel}</h3></div>{activeContact.contextSubtitle&&<p className="mt-1 truncate text-xs text-muted-foreground">{activeContact.contextSubtitle}</p>}</div><div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">{activeContact.contextDate&&<span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5"/>{activeContact.contextDate}</span>}{activeContact.contextTime&&<span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5"/>{activeContact.contextTime}</span>}{activeContact.contextAmount!=null&&<span className="flex items-center gap-1 font-semibold text-foreground"><CircleDollarSign className="h-3.5 w-3.5"/>{money(activeContact.contextAmount)}</span>}</div></div></div>}
        </header>

        <div ref={messagesContainerRef} className="messages-container flex min-h-0 flex-1 flex-col overflow-y-auto bg-muted/10 px-3 py-4 sm:px-6">
          {activeMessages.length===0&&<div className="m-auto max-w-sm rounded-2xl border border-border bg-card p-6 text-center shadow-sm"><MessageSquare className="mx-auto mb-3 h-9 w-9 text-primary/50"/><p className="font-semibold">Começa a conversa</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Este chat existe exclusivamente para <strong>{activeContact.contextTitle||activeContact.contextLabel}</strong>. Usa-o para combinar detalhes relacionados com esta reserva.</p></div>}
          {Object.entries(grouped).map(([day,items])=><div key={day} className="space-y-2.5"><div className="sticky top-2 z-[1] my-4 text-center"><span className="rounded-full border border-border bg-background/90 px-3 py-1 text-[10px] font-semibold text-muted-foreground shadow-sm backdrop-blur">{day}</span></div>{items.map(message=>{const mine=message.sender_id===currentUserId;return <div key={message.id} className={`flex ${mine?'justify-end':'justify-start'}`}><div className={`max-w-[88%] sm:max-w-[72%] ${mine?'items-end':'items-start'}`}><div className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${mine?'rounded-br-md bg-primary text-primary-foreground':'rounded-bl-md border border-border bg-card'}`}><p className="whitespace-pre-wrap break-words">{message.content}</p><div className={`mt-1 flex items-center justify-end gap-1 text-[9px] ${mine?'text-primary-foreground/70':'text-muted-foreground'}`}><span>{formatMessageTime(message.created_at)}</span>{mine&&(message.read_at?<CheckCheck className="h-3.5 w-3.5"/>:<Check className="h-3.5 w-3.5"/>)}</div></div></div></div>})}</div>)}<div ref={messagesEndRef}/>
        </div>

        {activeContact.archived?<div className="shrink-0 border-t border-border bg-muted/30 p-3 text-center text-xs text-muted-foreground"><Archive className="mr-1 inline h-3.5 w-3.5"/>A reserva terminou. Esta conversa está disponível apenas para consulta.</div>:<div className="shrink-0 border-t border-border bg-card p-2 sm:p-3"><form onSubmit={handleSend} className="flex items-end gap-2 rounded-2xl bg-muted/30 p-1.5"><textarea value={newMessage} onChange={e=>setNewMessage(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();e.currentTarget.form?.requestSubmit()}}} placeholder={`Mensagem sobre ${activeContact.contextTitle||'esta reserva'}...`} rows={1} maxLength={4000} disabled={isSending} className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-3 py-2.5 text-[16px] leading-5 outline-none"/><Button type="submit" disabled={isSending||!newMessage.trim()} size="icon" className="h-10 w-10 shrink-0 rounded-xl"><Send className="h-4 w-4"/></Button></form><p className="mt-1 px-2 text-[10px] text-muted-foreground">Enter para enviar · Shift+Enter para nova linha</p></div>}
      </>:<div className="flex flex-1 flex-col items-center justify-center px-6 text-center"><MessageSquare className="mb-4 h-10 w-10 text-muted-foreground/40"/><p className="font-semibold">Seleciona uma conversa</p><p className="mt-1 text-xs text-muted-foreground">Cada conversa corresponde a uma única reserva ou evento.</p></div>}
    </section>
  </div>
}
