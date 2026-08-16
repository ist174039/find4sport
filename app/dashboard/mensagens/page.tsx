import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { ChatInterface, Contact, Message } from '@/components/chat-interface'
import { getUserAvatarUrl, getUserDisplayName, getUserRoleLabel } from '@/lib/user-display'
import { isPlatformRole } from '@/lib/auth/roles'

export default async function MensagensPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const admin = createAdminClient()

  const [{ data: profile }, { data: messagesData, error: messagesError }] = await Promise.all([
    admin.from('platform_users').select('id,type').eq('id', user.id).maybeSingle(),
    admin.from('messages').select('*').or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`).order('created_at', { ascending: false }),
  ])
  if (messagesError) throw new Error(`Não foi possível carregar as mensagens: ${messagesError.message}`)
  const messages = (messagesData as Message[]) || []

  const activeContactIds = new Set<string>()
  const contextByUser = new Map<string, string>()
  const role = profile?.type

  if (role === 'athlete') {
    const { data: reservations } = await admin.from('reservations').select('professional_id,space_id,status,payment_status').eq('user_id', user.id).in('status', ['paid', 'confirmed'])
    const professionalIds = [...new Set((reservations || []).map(row => row.professional_id).filter(Boolean))] as string[]
    const spaceIds = [...new Set((reservations || []).map(row => row.space_id).filter(Boolean))] as string[]
    const [{ data: professionals }, { data: spaces }, { data: participants }] = await Promise.all([
      professionalIds.length ? admin.from('professionals').select('id,user_id').in('id', professionalIds) : Promise.resolve({ data: [] as any[] }),
      spaceIds.length ? admin.from('sport_spaces').select('id,owner_user_id').in('id', spaceIds) : Promise.resolve({ data: [] as any[] }),
      admin.from('event_participants').select('event_id').eq('user_id', user.id).eq('payment_status', 'paid').in('status', ['confirmed', 'paid']),
    ])
    for (const professional of professionals || []) if (professional.user_id) { activeContactIds.add(professional.user_id); contextByUser.set(professional.user_id, 'Reserva de serviço ativa') }
    for (const space of spaces || []) if (space.owner_user_id) { activeContactIds.add(space.owner_user_id); contextByUser.set(space.owner_user_id, 'Reserva de espaço ativa') }
    const eventIds = (participants || []).map(row => row.event_id)
    if (eventIds.length) {
      const now = new Date().toISOString()
      const { data: events } = await admin.from('events').select('created_by').in('id', eventIds).or(`end_date.is.null,end_date.gte.${now}`)
      for (const event of events || []) if (event.created_by) { activeContactIds.add(event.created_by); contextByUser.set(event.created_by, 'Evento pago ativo') }
    }
  } else if (role === 'professional' || role === 'venue_manager') {
    const clauses: string[] = []
    if (role === 'professional') {
      const { data: professional } = await admin.from('professionals').select('id').eq('user_id', user.id).maybeSingle()
      if (professional?.id) clauses.push(`professional_id.eq.${professional.id}`)
    } else {
      const { data: spaces } = await admin.from('sport_spaces').select('id').eq('owner_user_id', user.id)
      if (spaces?.length) clauses.push(`space_id.in.(${spaces.map(space => space.id).join(',')})`)
    }
    if (clauses.length) {
      const { data: reservations } = await admin.from('reservations').select('user_id').in('status', ['paid', 'confirmed']).or(clauses.join(','))
      for (const reservation of reservations || []) if (reservation.user_id) { activeContactIds.add(reservation.user_id); contextByUser.set(reservation.user_id, 'Reserva ativa') }
    }
    const now = new Date().toISOString()
    const { data: events } = await admin.from('events').select('id').eq('created_by', user.id).or(`end_date.is.null,end_date.gte.${now}`)
    const eventIds = (events || []).map(event => event.id)
    if (eventIds.length) {
      const { data: participants } = await admin.from('event_participants').select('user_id').in('event_id', eventIds).eq('payment_status', 'paid').in('status', ['confirmed', 'paid'])
      for (const participant of participants || []) if (participant.user_id) { activeContactIds.add(participant.user_id); contextByUser.set(participant.user_id, 'Evento pago ativo') }
    }
  }

  const contactIds = new Set<string>(activeContactIds)
  messages.forEach(message => { if (message.sender_id !== user.id) contactIds.add(message.sender_id); if (message.receiver_id !== user.id) contactIds.add(message.receiver_id) })

  const contacts: Contact[] = []
  if (contactIds.size > 0) {
    const ids = Array.from(contactIds)
    const [{ data: profiles }, { data: professionals }, { data: spaces }] = await Promise.all([
      admin.from('platform_users').select('id,full_name,avatar_url,type').in('id', ids),
      admin.from('professionals').select('user_id,full_name,professional_name,avatar_url').in('user_id', ids),
      admin.from('sport_spaces').select('owner_user_id,name,logo_url').in('owner_user_id', ids),
    ])
    const profByUserId = new Map((professionals || []).map((p: any) => [p.user_id, p]))
    const spaceByUserId = new Map((spaces || []).map((s: any) => [s.owner_user_id, s]))
    for (const item of profiles || []) {
      if (!isPlatformRole(item.type)) continue
      const prof = item.type === 'professional' ? profByUserId.get(item.id) as any : null
      const space = item.type === 'venue_manager' ? spaceByUserId.get(item.id) as any : null
      const lastMsg = messages.find(message => message.sender_id === item.id || message.receiver_id === item.id)
      const archived = !activeContactIds.has(item.id)
      contacts.push({
        id: item.id,
        name: getUserDisplayName({ type: item.type, full_name: item.full_name, professional_name: prof?.professional_name, professional_full_name: prof?.full_name, space_name: space?.name }),
        avatar: getUserAvatarUrl({ type: item.type, avatar_url: item.avatar_url, professional_avatar_url: prof?.avatar_url, space_logo_url: space?.logo_url }),
        role: getUserRoleLabel(item.type),
        unread: messages.filter(message => message.sender_id === item.id && message.receiver_id === user.id && !message.read_at).length,
        lastMsg: lastMsg?.content || contextByUser.get(item.id) || 'Conversa arquivada',
        lastMsgDate: lastMsg?.created_at || new Date(0).toISOString(),
        archived,
        contextLabel: archived ? 'Arquivada · só consulta' : contextByUser.get(item.id) || 'Reserva ativa',
      })
    }
  }
  contacts.sort((a, b) => Number(a.archived) - Number(b.archived) || new Date(b.lastMsgDate).getTime() - new Date(a.lastMsgDate).getTime())

  return <div className="h-full min-h-0 overflow-hidden bg-background md:rounded-2xl md:border md:border-border/70"><ChatInterface initialContacts={contacts} initialMessages={messages} currentUserId={user.id} /></div>
}
