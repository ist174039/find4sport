'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

type MessagingContext = {
  allowed: boolean
  label?: string
  buyerUserId?: string
  providerUserId?: string
  contextType?: 'reservation' | 'event_participant'
  contextId?: string
}

function missingThreadSchema(error: any) {
  const code = String(error?.code || '')
  const message = String(error?.message || '')
  return ['42P01','42703','PGRST204','PGRST205'].includes(code) || message.includes('message_threads') || message.includes('thread_id')
}

function lisbonNowKey() {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone:'Europe/Lisbon',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23' }).formatToParts(new Date())
  const get=(type:Intl.DateTimeFormatPartTypes)=>parts.find(part=>part.type===type)?.value||''
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}`
}

function bookingEndKey(date: string, endTime: string) {
  const raw=String(endTime||'').slice(0,8)
  const time=raw.length>=8?raw:`${raw.slice(0,5)}:00`
  return `${date}T${time}`
}

function eventStillActive(event: { start_date?: string|null; end_date?: string|null }) {
  const start=Date.parse(String(event.start_date||''))
  if(!Number.isFinite(start))return false
  const end=event.end_date?Date.parse(event.end_date):start+24*60*60*1000
  return Number.isFinite(end)&&end>Date.now()
}

async function resolveMessagingContext(userA: string, userB: string): Promise<MessagingContext> {
  const admin = createAdminClient()

  const resolvePair = async (buyerUserId: string, providerId: string): Promise<MessagingContext> => {
    const [{ data: professional }, { data: spaces }] = await Promise.all([
      admin.from('professionals').select('id').eq('user_id', providerId).maybeSingle(),
      admin.from('sport_spaces').select('id').eq('owner_user_id', providerId),
    ])
    const clauses: string[] = []
    if (professional?.id) clauses.push(`professional_id.eq.${professional.id}`)
    if (spaces?.length) clauses.push(`space_id.in.(${spaces.map(space => space.id).join(',')})`)
    if (clauses.length) {
      const { data: reservations } = await admin.from('reservations').select('id,status,payment_status,date,start_time,end_time,created_at').eq('user_id', buyerUserId).in('status', ['paid','confirmed']).or(clauses.join(',')).order('date', { ascending: true }).order('start_time', { ascending: true }).limit(20)
      const nowKey=lisbonNowKey()
      const reservation=(reservations||[]).find(row=>(row.payment_status==='paid'||row.status==='confirmed')&&bookingEndKey(row.date,String(row.end_time))>nowKey)
      if (reservation) return { allowed:true,label:'Reserva ativa',buyerUserId,providerUserId:providerId,contextType:'reservation',contextId:reservation.id }
    }

    const { data: participantRows } = await admin.from('event_participants').select('id,event_id,status,payment_status').eq('user_id', buyerUserId).eq('payment_status', 'paid').in('status', ['confirmed','paid'])
    const eventIds = (participantRows || []).map(row => row.event_id)
    if (eventIds.length) {
      const { data: events } = await admin.from('events').select('id,created_by,start_date,end_date').in('id', eventIds).eq('created_by', providerId).order('start_date', { ascending:true })
      const event=(events||[]).find(eventStillActive)
      if (event) {
        const participant = (participantRows || []).find(row => row.event_id === event.id)
        if (participant) return { allowed:true,label:'Evento pago ativo',buyerUserId,providerUserId:providerId,contextType:'event_participant',contextId:participant.id }
      }
    }
    return { allowed:false, buyerUserId, providerUserId: providerId }
  }

  const forward=await resolvePair(userA,userB)
  if(forward.allowed)return forward
  const reverse=await resolvePair(userB,userA)
  if(reverse.allowed)return reverse
  return forward.providerUserId?forward:reverse
}

async function archivePairThreads(buyerUserId?: string, providerUserId?: string, exceptThreadId?: string | null) {
  if (!buyerUserId || !providerUserId) return
  const admin = createAdminClient() as any
  let query = admin.from('message_threads').update({ status:'archived', archived_at:new Date().toISOString(), updated_at:new Date().toISOString() }).eq('athlete_id',buyerUserId).eq('provider_user_id',providerUserId).eq('status','active')
  if (exceptThreadId) query = query.neq('id', exceptThreadId)
  const { error } = await query
  if (error && !missingThreadSchema(error)) console.error('Unable to archive previous booking threads:', error)
}

async function ensureThread(context: MessagingContext) {
  if (!context.allowed || !context.contextId || !context.contextType || !context.buyerUserId || !context.providerUserId) return null
  const admin = createAdminClient() as any
  const matchColumn = context.contextType === 'reservation' ? 'reservation_id' : 'event_participant_id'
  const { data: existing, error: readError } = await admin.from('message_threads').select('id,status').eq(matchColumn, context.contextId).maybeSingle()
  if (readError) { if (missingThreadSchema(readError)) return null; throw readError }
  if (existing) {
    if (existing.status !== 'active') await admin.from('message_threads').update({ status:'active', archived_at:null, updated_at:new Date().toISOString() }).eq('id', existing.id)
    await archivePairThreads(context.buyerUserId, context.providerUserId, existing.id)
    return existing.id as string
  }
  const payload:any = { athlete_id:context.buyerUserId, provider_user_id:context.providerUserId, context_type:context.contextType, status:'active', [matchColumn]:context.contextId }
  const { data, error } = await admin.from('message_threads').insert(payload).select('id').single()
  if (error) { if (missingThreadSchema(error)) return null; throw error }
  const threadId = data?.id as string | null
  await archivePairThreads(context.buyerUserId, context.providerUserId, threadId)
  return threadId
}

export async function canMessageUser(otherUserId: string) {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser()
  if (!user || !otherUserId || otherUserId === user.id) return { allowed:false }
  const context = await resolveMessagingContext(user.id, otherUserId)
  if (!context.allowed) await archivePairThreads(context.buyerUserId, context.providerUserId)
  return { allowed:context.allowed, label:context.label, contextType:context.contextType, contextId:context.contextId }
}

export async function sendMessage(receiverId: string, content: string) {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) throw new Error('Não autenticado')
  const trimmedContent = content.trim(); if (!receiverId || receiverId === user.id) throw new Error('Destinatário inválido'); if (!trimmedContent) throw new Error('A mensagem não pode estar vazia'); if (trimmedContent.length > 4000) throw new Error('A mensagem excede o limite de 4000 caracteres')
  const admin = createAdminClient(); const { data: receiver } = await admin.from('platform_users').select('id').eq('id', receiverId).maybeSingle(); if (!receiver) throw new Error('O destinatário já não está disponível.')
  const context = await resolveMessagingContext(user.id, receiverId); if (!context.allowed) { await archivePairThreads(context.buyerUserId, context.providerUserId); throw new Error('Esta conversa está arquivada. Só podes enviar mensagens enquanto a reserva ou evento pago associado estiver ativo.') }
  const threadId = await ensureThread(context)
  const payload:any = { sender_id:user.id, receiver_id:receiverId, content:trimmedContent }; if (threadId) payload.thread_id = threadId
  let result = threadId
    ? await (admin as any).from('messages').insert(payload).select('id,created_at,thread_id').single()
    : await (admin as any).from('messages').insert(payload).select('id,created_at').single()
  if (result.error && threadId && missingThreadSchema(result.error)) result = await (admin as any).from('messages').insert({ sender_id:user.id, receiver_id:receiverId, content:trimmedContent }).select('id,created_at').single()
  if (result.error || !result.data) throw new Error('Erro ao enviar a mensagem')
  revalidatePath('/dashboard/mensagens'); return result.data
}

export async function markAsRead(messageIds: string[]) {
  if (!messageIds.length) return
  const uniqueMessageIds = [...new Set(messageIds)].filter(Boolean); if (!uniqueMessageIds.length) return
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) throw new Error('Não autenticado')
  const admin = createAdminClient(); const { error } = await admin.from('messages').update({ read_at:new Date().toISOString() }).in('id',uniqueMessageIds).eq('receiver_id',user.id).is('read_at',null)
  if (error) console.error('Erro ao marcar mensagens como lidas:',error); revalidatePath('/dashboard/mensagens')
}
