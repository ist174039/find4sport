import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ChatInterface, Contact, Message } from '@/components/chat-interface'
import { getUserAvatarUrl, getUserDisplayName, getUserRoleLabel } from '@/lib/user-display'
import { isPlatformRole } from '@/lib/auth/roles'

export default async function MensagensPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: messagesData, error: messagesError } = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  if (messagesError) throw new Error(`Não foi possível carregar as mensagens: ${messagesError.message}`)
  const messages = (messagesData as Message[]) || []

  const contactIds = new Set<string>()
  messages.forEach(msg => {
    if (msg.sender_id !== user.id) contactIds.add(msg.sender_id)
    if (msg.receiver_id !== user.id) contactIds.add(msg.receiver_id)
  })

  const contacts: Contact[] = []
  if (contactIds.size > 0) {
    const ids = Array.from(contactIds)
    const [{ data: profiles }, { data: professionals }, { data: spaces }] = await Promise.all([
      supabase.from('platform_users').select('id, full_name, avatar_url, type').in('id', ids),
      supabase.from('professionals').select('user_id, full_name, professional_name, avatar_url').in('user_id', ids),
      supabase.from('sport_spaces').select('owner_user_id, name, logo_url').in('owner_user_id', ids),
    ])

    const profByUserId = new Map((professionals || []).map((p: any) => [p.user_id, p]))
    const spaceByUserId = new Map((spaces || []).map((s: any) => [s.owner_user_id, s]))

    for (const profile of profiles || []) {
      if (!isPlatformRole(profile.type)) continue
      const prof = profile.type === 'professional' ? profByUserId.get(profile.id) as any : null
      const space = profile.type === 'venue_manager' ? spaceByUserId.get(profile.id) as any : null
      const lastMsg = messages.find(m => m.sender_id === profile.id || m.receiver_id === profile.id)
      if (!lastMsg) continue

      const unreadCount = messages.filter(m => m.sender_id === profile.id && m.receiver_id === user.id && !m.read_at).length
      contacts.push({
        id: profile.id,
        name: getUserDisplayName({
          type: profile.type,
          full_name: profile.full_name,
          professional_name: prof?.professional_name,
          professional_full_name: prof?.full_name,
          space_name: space?.name,
        }),
        avatar: getUserAvatarUrl({
          type: profile.type,
          avatar_url: profile.avatar_url,
          professional_avatar_url: prof?.avatar_url,
          space_logo_url: space?.logo_url,
        }),
        role: getUserRoleLabel(profile.type),
        unread: unreadCount,
        lastMsg: lastMsg.content,
        lastMsgDate: lastMsg.created_at,
      })
    }
  }

  return <ChatInterface initialContacts={contacts} initialMessages={messages} currentUserId={user.id} />
}
