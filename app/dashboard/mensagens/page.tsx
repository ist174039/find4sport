'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MessageSquare, Search, Phone, Video, Info, MoreVertical, Send, CheckCheck, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Message = {
  id: string
  content: string
  created_at: string
  sender_id: string
  read_at: string | null
}

export default function MensagensPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [activeContact, setActiveContact] = useState<number>(0)

  const contacts = [
    { id: '1', name: 'Igor Sanchez', role: 'Personal Trainer', avatar: 'https://i.pravatar.cc/150?u=1', unread: 2, lastMsg: 'Até amanhã às 10h!', time: '10:42' },
    { id: '2', name: 'Padel Club Porto', role: 'Espaço Desportivo', avatar: 'https://i.pravatar.cc/150?u=2', unread: 0, lastMsg: 'A sua reserva está confirmada.', time: 'Ontem' },
    { id: '3', name: 'Ana Rita Silva', role: 'Fisioterapeuta', avatar: 'https://i.pravatar.cc/150?u=3', unread: 0, lastMsg: 'Enviei o plano de recuperação.', time: 'Segunda' },
  ]

  useEffect(() => {
    async function load() {
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="h-[calc(100vh-8rem)] min-h-[500px] max-w-6xl mx-auto flex gap-6 animate-in fade-in duration-500">
      
      {/* Left Sidebar - Contacts List - Standard theme */}
      <div className="w-full md:w-80 lg:w-96 flex flex-col rounded-xl border border-border bg-card overflow-hidden shrink-0 hidden md:flex">
        <div className="p-4 border-b border-border bg-muted/20">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            Conversas <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-bold">2</span>
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
          {contacts.map((contact, idx) => (
            <button 
              key={idx}
              onClick={() => setActiveContact(idx)}
              className={`w-full text-left p-3 flex items-center gap-3 rounded-lg transition-all ${activeContact === idx ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50 border border-transparent'}`}
            >
              <div className="relative shrink-0">
                <img src={contact.avatar} alt={contact.name} className="w-10 h-10 rounded-full object-cover" />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-card"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <h3 className={`font-semibold text-xs truncate ${activeContact === idx ? 'text-primary' : 'text-foreground'}`}>{contact.name}</h3>
                  <span className="text-[9px] text-muted-foreground shrink-0 ml-2">{contact.time}</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className={`text-xs truncate max-w-[150px] ${contact.unread > 0 ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>{contact.lastMsg}</p>
                  {contact.unread > 0 && (
                    <span className="w-4.5 h-4.5 bg-primary text-primary-foreground rounded-full text-[9px] flex items-center justify-center font-bold shrink-0">
                      {contact.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Area - Active Chat - Standard theme */}
      <div className="flex-1 flex flex-col rounded-xl border border-border bg-card overflow-hidden relative">
        
        {/* Chat Header */}
        <div className="p-4 border-b border-border bg-card flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <img src={contacts[activeContact].avatar} alt={contacts[activeContact].name} className="w-10 h-10 rounded-full object-cover" />
            <div>
              <h2 className="font-bold text-foreground text-sm">{contacts[activeContact].name}</h2>
              <p className="text-xs text-primary font-medium">{contacts[activeContact].role}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="hidden sm:inline-flex rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 h-8 w-8">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="hidden sm:inline-flex rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 h-8 w-8">
              <Video className="h-4 w-4" />
            </Button>
            <div className="w-px h-5 bg-border mx-1 hidden sm:block"></div>
            <Button variant="ghost" size="icon" className="rounded-lg text-muted-foreground hover:text-foreground h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 z-10 flex flex-col bg-muted/5">
          <div className="text-center">
            <span className="text-[9px] font-bold tracking-wider uppercase bg-muted/60 text-muted-foreground px-2.5 py-1 rounded-md">Hoje</span>
          </div>

          <div className="flex gap-3 max-w-[80%]">
            <img src={contacts[activeContact].avatar} alt="" className="w-7 h-7 rounded-full object-cover shrink-0 mt-auto" />
            <div>
              <div className="bg-muted/40 text-foreground p-3.5 rounded-xl rounded-bl-sm text-xs border border-border">
                Olá! Confirmo que a nossa sessão de amanhã está marcada para as 10h. 
              </div>
              <span className="text-[9px] text-muted-foreground mt-1 ml-1 block">10:40</span>
            </div>
          </div>

          <div className="flex gap-3 max-w-[80%] self-end flex-row-reverse">
            <div>
              <div className="bg-primary text-primary-foreground p-3.5 rounded-xl rounded-br-sm text-xs shadow-sm">
                Perfeito! Levo o meu próprio material ou vocês fornecem?
              </div>
              <div className="flex items-center justify-end gap-1 mt-1 mr-1">
                <span className="text-[9px] text-muted-foreground">10:41</span>
                <CheckCheck className="h-3 w-3 text-primary" />
              </div>
            </div>
          </div>

          <div className="flex gap-3 max-w-[80%]">
            <img src={contacts[activeContact].avatar} alt="" className="w-7 h-7 rounded-full object-cover shrink-0 mt-auto" />
            <div>
              <div className="bg-muted/40 text-foreground p-3.5 rounded-xl rounded-bl-sm text-xs border border-border">
                {contacts[activeContact].lastMsg}
              </div>
              <span className="text-[9px] text-muted-foreground mt-1 ml-1 block">10:42</span>
            </div>
          </div>
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-card border-t border-border z-10">
          <div className="flex items-center gap-2 bg-muted/20 border border-border rounded-xl p-1.5 pr-2 focus-within:bg-muted/30 focus-within:border-primary/50 transition-all">
            <Button variant="ghost" size="icon" className="rounded-lg text-muted-foreground hover:text-foreground shrink-0 h-9 w-9">
              <Plus className="h-4.5 w-4.5" />
            </Button>
            <input 
              type="text" 
              placeholder="Escreve uma mensagem..." 
              className="flex-1 bg-transparent border-none focus:outline-none text-xs placeholder:text-muted-foreground/75 min-w-0"
            />
            <Button size="icon" className="rounded-lg bg-primary hover:bg-primary/90 h-9 w-9 shrink-0 shadow-sm">
              <Send className="h-3.5 w-3.5 ml-0.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
