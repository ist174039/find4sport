import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { ChatInterface, Contact, Message } from '@/components/chat-interface'
import { getUserAvatarUrl, getUserDisplayName, getUserRoleLabel } from '@/lib/user-display'
import { isPlatformRole } from '@/lib/auth/roles'

function missingThreadSchema(error: any) {
  const code = String(error?.code || '')
  const message = String(error?.message || '')
  return ['42P01','42703','PGRST204','PGRST205'].includes(code) || message.includes('message_threads') || message.includes('thread_id')
}

function formatBookingDetail(date?: string | null, start?: string | null, end?: string | null) {
  if (!date) return ''
  const day = new Date(`${date}T12:00:00`).toLocaleDateString('pt-PT')
  return start ? `${day} · ${String(start).slice(0,5)}${end ? `–${String(end).slice(0,5)}` : ''}` : day
}

export default async function MensagensPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const admin = createAdminClient()
  const db = admin as any

  const [{ data: profile }, messageResult] = await Promise.all([
    admin.from('platform_users').select('id,type').eq('id', user.id).maybeSingle(),
    db.from('messages').select('id,content,created_at,sender_id,receiver_id,read_at,thread_id').or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`).order('created_at', { ascending: false }),
  ])
  if (messageResult.error && !missingThreadSchema(messageResult.error)) throw new Error(`Não foi possível carregar as mensagens: ${messageResult.error.message}`)
  let messages = (messageResult.data || []) as Message[]
  if (messageResult.error && missingThreadSchema(messageResult.error)) {
    const legacy = await admin.from('messages').select('id,content,created_at,sender_id,receiver_id,read_at').or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`).order('created_at', { ascending: false })
    if (legacy.error) throw new Error(`Não foi possível carregar as mensagens: ${legacy.error.message}`)
    messages = (legacy.data || []).map(row => ({ ...row, thread_id: null })) as Message[]
  }

  const threadResult = await db.from('message_threads').select('id,athlete_id,provider_user_id,context_type,reservation_id,event_participant_id,status,created_at,updated_at').or(`athlete_id.eq.${user.id},provider_user_id.eq.${user.id}`).order('updated_at', { ascending: false })
  const threads = threadResult.error && missingThreadSchema(threadResult.error) ? [] : (threadResult.data || [])
  if (threadResult.error && !missingThreadSchema(threadResult.error)) throw new Error(`Não foi possível carregar as conversas: ${threadResult.error.message}`)

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

  const reservationIds = threads.map((thread:any)=>thread.reservation_id).filter(Boolean)
  const participantIds = threads.map((thread:any)=>thread.event_participant_id).filter(Boolean)
  const [{ data: reservationContexts }, { data: participantContexts }] = await Promise.all([
    reservationIds.length ? admin.from('reservations').select('id,date,start_time,end_time,service_id,space_id').in('id', reservationIds) : Promise.resolve({ data: [] as any[] }),
    participantIds.length ? admin.from('event_participants').select('id,event_id').in('id', participantIds) : Promise.resolve({ data: [] as any[] }),
  ])
  const serviceIds = [...new Set((reservationContexts || []).map(row=>row.service_id).filter(Boolean))] as string[]
  const spaceIds = [...new Set((reservationContexts || []).map(row=>row.space_id).filter(Boolean))] as string[]
  const eventIds = [...new Set((participantContexts || []).map(row=>row.event_id).filter(Boolean))] as string[]
  const [{ data: services }, { data: spacesForContext }, { data: eventsForContext }] = await Promise.all([
    serviceIds.length ? admin.from('services').select('id,name').in('id',serviceIds) : Promise.resolve({data:[] as any[]}),
    spaceIds.length ? admin.from('sport_spaces').select('id,name').in('id',spaceIds) : Promise.resolve({data:[] as any[]}),
    eventIds.length ? admin.from('events').select('id,title,start_date,end_date').in('id',eventIds) : Promise.resolve({data:[] as any[]}),
  ])
  const reservationMap = new Map((reservationContexts || []).map(row=>[row.id,row]))
  const participantMap = new Map((participantContexts || []).map(row=>[row.id,row]))
  const serviceMap = new Map((services || []).map(row=>[row.id,row.name]))
  const spaceContextMap = new Map((spacesForContext || []).map(row=>[row.id,row.name]))
  const eventMap = new Map((eventsForContext || []).map(row=>[row.id,row]))

  const threadCounterpartIds = threads.map((thread:any)=>thread.athlete_id===user.id?thread.provider_user_id:thread.athlete_id).filter(Boolean)
  const legacyMessageIds = messages.flatMap(message => [message.sender_id,message.receiver_id]).filter(id=>id!==user.id)
  const allIdentityIds = [...new Set([...threadCounterpartIds,...activeContactIds,...legacyMessageIds])]
  const [{ data: profiles }, { data: professionals }, { data: spaces }] = allIdentityIds.length ? await Promise.all([
    admin.from('platform_users').select('id,full_name,avatar_url,type').in('id', allIdentityIds),
    admin.from('professionals').select('user_id,full_name,professional_name,avatar_url').in('user_id', allIdentityIds),
    admin.from('sport_spaces').select('owner_user_id,name,logo_url').in('owner_user_id', allIdentityIds),
  ]) : [{data:[]},{data:[]},{data:[]}]
  const profileMap = new Map((profiles || []).map(item=>[item.id,item]))
  const profByUserId = new Map((professionals || []).map((item:any)=>[item.user_id,item]))
  const spaceByUserId = new Map((spaces || []).map((item:any)=>[item.owner_user_id,item]))

  const identity = (userId:string) => {
    const item:any = profileMap.get(userId)
    if (!item || !isPlatformRole(item.type)) return null
    const prof:any = item.type==='professional'?profByUserId.get(userId):null
    const space:any = item.type==='venue_manager'?spaceByUserId.get(userId):null
    return {
      name:getUserDisplayName({type:item.type,full_name:item.full_name,professional_name:prof?.professional_name,professional_full_name:prof?.full_name,space_name:space?.name}),
      avatar:getUserAvatarUrl({type:item.type,avatar_url:item.avatar_url,professional_avatar_url:prof?.avatar_url,space_logo_url:space?.logo_url}),
      role:getUserRoleLabel(item.type),
    }
  }

  const contacts: Contact[] = []
  const representedActiveUsers = new Set<string>()
  for (const thread of threads as any[]) {
    const otherUserId = thread.athlete_id===user.id?thread.provider_user_id:thread.athlete_id
    const person = identity(otherUserId)
    if (!person) continue
    const threadMessages = messages.filter(message=>message.thread_id===thread.id)
    const lastMsg = threadMessages[0]
    let contextLabel = thread.context_type==='reservation'?'Reserva':'Evento pago'
    let contextDetail = ''
    if (thread.reservation_id) {
      const reservation:any = reservationMap.get(thread.reservation_id)
      const title = reservation?.service_id?serviceMap.get(reservation.service_id):reservation?.space_id?spaceContextMap.get(reservation.space_id):null
      contextLabel = `Reserva${title?` · ${title}`:''}`
      contextDetail = reservation?formatBookingDetail(reservation.date,reservation.start_time,reservation.end_time):''
    } else if (thread.event_participant_id) {
      const participant:any = participantMap.get(thread.event_participant_id)
      const event:any = participant?eventMap.get(participant.event_id):null
      contextLabel = `Evento${event?.title?` · ${event.title}`:''}`
      contextDetail = event?.start_date?new Date(event.start_date).toLocaleString('pt-PT',{dateStyle:'short',timeStyle:'short'}):''
    }
    if (thread.status==='active') representedActiveUsers.add(otherUserId)
    contacts.push({id:thread.id,userId:otherUserId,threadId:thread.id,...person,unread:threadMessages.filter(message=>message.sender_id===otherUserId&&message.receiver_id===user.id&&!message.read_at).length,lastMsg:lastMsg?.content||'Sem mensagens ainda',lastMsgDate:lastMsg?.created_at||thread.updated_at||thread.created_at,archived:thread.status!=='active',contextLabel,contextDetail})
  }

  for (const userId of activeContactIds) {
    if (representedActiveUsers.has(userId)) continue
    const person=identity(userId);if(!person)continue
    const legacyMessages=messages.filter(message=>!message.thread_id&&((message.sender_id===userId&&message.receiver_id===user.id)||(message.receiver_id===userId&&message.sender_id===user.id)))
    const lastMsg=legacyMessages[0]
    contacts.push({id:`active-${userId}`,userId,threadId:null,...person,unread:legacyMessages.filter(message=>message.sender_id===userId&&!message.read_at).length,lastMsg:lastMsg?.content||'Conversa disponível',lastMsgDate:lastMsg?.created_at||new Date().toISOString(),archived:false,contextLabel:contextByUser.get(userId)||'Reserva ativa'})
  }

  const representedLegacyUsers = new Set(contacts.filter(contact=>!contact.threadId).map(contact=>contact.userId))
  for (const message of messages.filter(message=>!message.thread_id)) {
    const otherUserId=message.sender_id===user.id?message.receiver_id:message.sender_id
    if (representedLegacyUsers.has(otherUserId)) continue
    const person=identity(otherUserId);if(!person)continue
    const pair=messages.filter(item=>!item.thread_id&&((item.sender_id===otherUserId&&item.receiver_id===user.id)||(item.receiver_id===otherUserId&&item.sender_id===user.id)))
    contacts.push({id:`legacy-${otherUserId}`,userId:otherUserId,threadId:null,...person,unread:pair.filter(item=>item.sender_id===otherUserId&&!item.read_at).length,lastMsg:pair[0]?.content||'Conversa arquivada',lastMsgDate:pair[0]?.created_at||new Date(0).toISOString(),archived:!activeContactIds.has(otherUserId),contextLabel:activeContactIds.has(otherUserId)?contextByUser.get(otherUserId)||'Reserva ativa':'Histórico anterior'})
    representedLegacyUsers.add(otherUserId)
  }

  contacts.sort((a,b)=>Number(Boolean(a.archived))-Number(Boolean(b.archived))||new Date(b.lastMsgDate).getTime()-new Date(a.lastMsgDate).getTime())
  return <div className="h-full min-h-0 overflow-hidden bg-background md:rounded-2xl md:border md:border-border/70"><ChatInterface initialContacts={contacts} initialMessages={messages} currentUserId={user.id}/></div>
}
