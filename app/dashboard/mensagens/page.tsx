import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ChatInterface, Contact, Message } from '@/components/chat-interface'

export default async function MensagensPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Obter perfil do utilizador atual para determinar o seu tipo (role)
  const { data: profile } = await supabase
    .from('platform_users')
    .select('type')
    .eq('id', user.id)
    .single()
    
  const currentUserRole = profile?.type || 'user'

  // Obter todas as mensagens enviadas ou recebidas por este utilizador
  const { data: messagesData, error: messagesError } = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  const messages = (messagesData as Message[]) || []

  // Extrair IDs de contactos únicos
  const contactIds = new Set<string>()
  messages.forEach(msg => {
    if (msg.sender_id !== user.id) contactIds.add(msg.sender_id)
    if (msg.receiver_id !== user.id) contactIds.add(msg.receiver_id)
  })

  // Se houver contactos, obter a informação dos seus perfis
  const contacts: Contact[] = []
  
  if (contactIds.size > 0) {
    const { data: profiles } = await supabase
      .from('platform_users')
      .select('id, full_name, avatar_url, type')
      .in('id', Array.from(contactIds))

    if (profiles) {
      profiles.forEach(profile => {
        // Encontrar a última mensagem trocada com este utilizador
        const lastMsg = messages.find(
          m => m.sender_id === profile.id || m.receiver_id === profile.id
        )

        // Contar mensagens não lidas recebidas deste utilizador
        const unreadCount = messages.filter(
          m => m.sender_id === profile.id && m.receiver_id === user.id && !m.read_at
        ).length

        if (lastMsg) {
          contacts.push({
            id: profile.id,
            name: profile.full_name || 'Utilizador Desconhecido',
            avatar: profile.avatar_url || '',
            role: profile.type === 'professional' ? 'Profissional' : (profile.type === 'sport_space' ? 'Espaço' : 'Utilizador'),
            unread: unreadCount,
            lastMsg: lastMsg.content,
            lastMsgDate: lastMsg.created_at,
          })
        }
      })
    }
  }

  return (
    <ChatInterface 
      initialContacts={contacts} 
      initialMessages={messages} 
      currentUserId={user.id}
      currentUserRole={currentUserRole}
    />
  )
}
