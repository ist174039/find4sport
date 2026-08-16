import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NotificationsInterface, Notification } from '@/components/notifications-interface'

export default async function NotificacoesPage(){
  const supabase=await createClient();const{data:{user}}=await supabase.auth.getUser();if(!user)redirect('/auth/login')
  const{data,error}=await supabase.from('notifications').select('*').eq('user_id',user.id).order('created_at',{ascending:false}).limit(200)
  if(error)throw new Error(`Não foi possível carregar notificações: ${error.message}`)
  return <NotificationsInterface initialNotifications={(data as Notification[])||[]} currentUserId={user.id}/>
}
