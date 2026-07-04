'use client'

import { useState } from 'react'
import { Bell, Check, Trash2, Calendar, MessageSquare, Info, Star, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function NotificacoesPage() {
  const [notifications, setNotifications] = useState([
    { id: '1', type: 'event', title: 'Novo Evento: Torneio de Verão Padel', desc: 'Um novo torneio de Padel foi criado na sua zona de preferência. Inscrições abertas agora!', time: 'Há 10 minutos', read: false },
    { id: '2', type: 'message', title: 'Carlos Silva respondeu à sua mensagem', desc: '"Olá! Tenho disponibilidade para a aula de amanhã às 10:00. Podemos confirmar?"', time: 'Há 1 hora', read: false },
    { id: '3', type: 'info', title: 'Novo Espaço: Arena Beach Tennis', desc: 'Uma nova arena de Beach Tennis acaba de abrir a 2km da sua localização. Aproveite o desconto de inauguração.', time: 'Há 3 horas', read: false },
    { id: '4', type: 'review', title: 'Review Publicada', desc: 'Sua avaliação sobre "CrossFit Elite Hub" foi aprovada e já está visível para a comunidade.', time: 'Ontem', read: true },
    { id: '5', type: 'billing', title: 'Pagamento Confirmado', desc: 'Recebemos o pagamento para a sua reserva no Estádio Municipal para o dia 15/10.', time: '2 dias atrás', read: true },
  ])

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'event': return <Calendar className="h-4.5 w-4.5 text-primary" />
      case 'message': return <MessageSquare className="h-4.5 w-4.5 text-teal-500" />
      case 'review': return <Star className="h-4.5 w-4.5 text-amber-500 fill-amber-500" />
      case 'billing': return <CreditCard className="h-4.5 w-4.5 text-green-500" />
      default: return <Info className="h-4.5 w-4.5 text-muted-foreground" />
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'event': return <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] rounded-md font-bold">Novo Evento</Badge>
      case 'message': return <Badge className="bg-teal-500/10 text-teal-500 border-teal-500/20 text-[10px] rounded-md font-bold">Mensagem</Badge>
      case 'review': return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px] rounded-md font-bold">Avaliação</Badge>
      case 'billing': return <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px] rounded-md font-bold">Sistema</Badge>
      default: return <Badge variant="outline" className="text-[10px] rounded-md">Geral</Badge>
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section - Standard Homepage Layout */}
      <div className="flex justify-between items-end mb-10 pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Notificações</h1>
          <p className="mt-2 text-muted-foreground">Acompanha as novidades, respostas de profissionais e estado das tuas reservas.</p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline" className="rounded-lg border-border hover:bg-muted text-xs h-9 gap-1.5 shrink-0">
            <Check className="h-4 w-4" /> Marcar lidas
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-card border border-border p-12 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
            <Bell className="h-6 w-6 text-muted-foreground opacity-50" />
          </div>
          <h3 className="font-semibold text-foreground">Sem notificações</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">Estás a par de tudo! Quando surgirem novidades, elas aparecerão aqui.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div 
              key={n.id} 
              className={`group relative rounded-xl border transition-all p-4 flex items-start gap-4 ${
                n.read 
                  ? 'bg-card border-border/60 opacity-80 hover:opacity-100' 
                  : 'bg-card border-primary/20 shadow-sm'
              }`}
            >
              {!n.read && (
                <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
              )}
              
              <div className="w-9 h-9 rounded-lg bg-muted/60 flex items-center justify-center shrink-0 border border-border/20">
                {getTypeIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <h3 className="font-bold text-xs md:text-sm text-foreground truncate">{n.title}</h3>
                  <span className="text-[9px] text-muted-foreground font-medium shrink-0">{n.time}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">{n.desc}</p>
                <div className="flex items-center justify-between">
                  {getTypeBadge(n.type)}
                  <Button 
                    onClick={() => deleteNotification(n.id)} 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
