'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bell, Calendar, Check, CreditCard, Info, MessageSquare, Star, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { pt } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { deleteNotificationAction, markAllNotificationsAsRead, markNotificationAsRead } from '@/app/actions/notifications'
import { useModal } from '@/components/providers/modal-provider'
import { DashboardEmptyState, DashboardPage, DashboardPageHeader, DashboardSection, DashboardStat, DashboardStatGrid } from '@/components/patterns/dashboard-page'

export type Notification = {
  id: string
  type: string
  message: string
  read_at: string | null
  created_at: string
  link: string | null
}

function notificationMeta(type: string) {
  if (type === 'event') return { label: 'Evento', icon: Calendar }
  if (type === 'message') return { label: 'Mensagem', icon: MessageSquare }
  if (type === 'review') return { label: 'Avaliação', icon: Star }
  if (type === 'billing') return { label: 'Faturação', icon: CreditCard }
  return { label: 'Geral', icon: Info }
}

export function NotificationsInterface({ initialNotifications }: { initialNotifications: Notification[] }) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const { showAlert, showConfirm } = useModal()
  const unreadCount = notifications.filter(notification => !notification.read_at).length

  async function markAll() {
    const previous = notifications
    setNotifications(current => current.map(notification => ({ ...notification, read_at: notification.read_at || new Date().toISOString() })))
    try {
      await markAllNotificationsAsRead()
    } catch (error) {
      setNotifications(previous)
      showAlert('Erro', error instanceof Error ? error.message : 'Não foi possível atualizar as notificações.', 'error')
    }
  }

  async function markOne(id: string) {
    const current = notifications.find(notification => notification.id === id)
    if (!current || current.read_at) return
    setNotifications(list => list.map(notification => notification.id === id ? { ...notification, read_at: new Date().toISOString() } : notification))
    try {
      await markNotificationAsRead(id)
    } catch (error) {
      setNotifications(list => list.map(notification => notification.id === id ? current : notification))
      showAlert('Erro', error instanceof Error ? error.message : 'Não foi possível marcar como lida.', 'error')
    }
  }

  async function remove(id: string) {
    const confirmed = await showConfirm('Eliminar notificação', 'Esta notificação será removida da sua lista.', { confirmLabel: 'Eliminar', destructive: true })
    if (!confirmed) return
    const previous = notifications
    setNotifications(current => current.filter(notification => notification.id !== id))
    try {
      await deleteNotificationAction(id)
    } catch (error) {
      setNotifications(previous)
      showAlert('Erro', error instanceof Error ? error.message : 'Não foi possível eliminar a notificação.', 'error')
    }
  }

  return (
    <DashboardPage>
      <DashboardPageHeader
        title="Notificações"
        description="Atualizações da plataforma, mensagens, reservas, avaliações e faturação."
        action={unreadCount > 0 ? <Button variant="outline" className="min-h-11" onClick={markAll}><Check className="mr-2 h-4 w-4" />Marcar todas como lidas</Button> : undefined}
      />

      <DashboardStatGrid>
        <DashboardStat label="Total" value={notifications.length} icon={<Bell className="h-5 w-5" />} />
        <DashboardStat label="Não lidas" value={unreadCount} icon={<Bell className="h-5 w-5" />} />
        <DashboardStat label="Lidas" value={notifications.length - unreadCount} icon={<Check className="h-5 w-5" />} />
        <DashboardStat label="Com destino" value={notifications.filter(notification => Boolean(notification.link)).length} icon={<Info className="h-5 w-5" />} />
      </DashboardStatGrid>

      <DashboardSection title="Atividade" description="Ações importantes permanecem visíveis também em ecrãs tácteis.">
        {notifications.length === 0 ? <DashboardEmptyState icon={<Bell className="h-10 w-10" />} title="Sem notificações" description="Está a par de tudo. Novas atualizações aparecerão aqui." /> : <div className="space-y-3">{notifications.map(notification => {
          const meta = notificationMeta(notification.type)
          const Icon = meta.icon
          const isRead = Boolean(notification.read_at)
          return <article key={notification.id} className={`rounded-2xl border p-4 ${isRead ? 'border-border bg-card' : 'border-primary/25 bg-primary/[0.03]'}`}>
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted text-primary"><Icon className="h-5 w-5" /></div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2"><Badge variant={isRead ? 'outline' : 'default'}>{meta.label}</Badge>{!isRead && <span className="text-xs font-semibold text-primary">Nova</span>}</div>
                <p className="mt-2 text-sm leading-relaxed text-foreground">{notification.message}</p>
                <p className="mt-2 text-xs text-muted-foreground">{formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: pt })}</p>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:flex">
                  {!isRead && <Button variant="outline" className="min-h-11" onClick={() => markOne(notification.id)}><Check className="mr-2 h-4 w-4" />Marcar lida</Button>}
                  {notification.link && <Button asChild variant="outline" className="min-h-11"><Link href={notification.link} onClick={() => void markOne(notification.id)}>Abrir</Link></Button>}
                  <Button variant="ghost" className="min-h-11 text-destructive sm:ml-auto" onClick={() => remove(notification.id)}><Trash2 className="mr-2 h-4 w-4" />Eliminar</Button>
                </div>
              </div>
            </div>
          </article>
        })}</div>}
      </DashboardSection>
    </DashboardPage>
  )
}
