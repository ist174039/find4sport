import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NotificationsInterface, Notification } from '@/components/notifications-interface'

export default async function NotificacoesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Obter todas as notificações reais do utilizador
  const { data: notificationsData, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const notifications = (notificationsData as Notification[]) || []

  return (
    <NotificationsInterface initialNotifications={notifications} />
  )
}
