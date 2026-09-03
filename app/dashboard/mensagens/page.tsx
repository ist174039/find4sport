import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { ChatInterface, Contact, Message } from '@/components/chat-interface'
import { getUserAvatarUrl, getUserDisplayName, getUserRoleLabel } from '@/lib/user-display'
import { isPlatformRole } from '@/lib/auth/roles'

function lisbonNowKey(){
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Lisbon',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(new Date())
  const get=(type:Intl.DateTimeFormatPartTypes)=>parts.find(p=>p.type===type)?.value||''
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}`
}
function bookingEndKey(date:string,endTime:string){const raw=String(endTime||'').slice(0,8);const time=raw.length>=8?raw:`${raw.slice(0,5)}:00`;return `${date}T${time}`}
function eventStillActive(event:{start_date?:string|null;end_date?:string|null}){const start=Date.parse(String(event.start_date||''));if(!Number.isFinite(start))return false;const end=event.end_date?Date.parse(event.end_date):start+86400000;return Number.isFinite(end)&&end>Date.now()}
function dayPt(date?:string|null){if(!date)return'';return new Date(`${date}T12:00:00`).toLocaleDateString('pt-PT',{day:'2-digit',month:'short',year:'numeric'})}
function eventDayPt(date?:string|null){if(!date)return'';return new Date(date).toLocaleDateString('pt-PT',{day:'2-digit',month:'short',year:'numeric'})}
function timeRange(start?:string|null,end?:string|null){if(!start)return'';return `${String(start).slice(0,5)}${end?` – ${String(end).slice(0,5)}`:''}`}
function eventTimeRange(start?:string|null,end?:string|null){if(!start)return'';const s=new Date(start);const e=end?new Date(end):null;const fmt=(d:Date)=>d.toLocaleTimeString('pt-PT',{hour:'2-digit',minute:'2-digit'});return `${fmt(s)}${e?` – ${fmt(e)}`:''}`}

export default async function MensagensPage({searchParams}:{searchParams:Promise<{space?:string}>}){
  const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)redirect('/auth/login')
  const admin=createAdminClient();const db=admin as any;const nowKey=lisbonNowKey()
  const {data:profile}=await admin.from('platform_users').select('id,type').eq('id',user.id).maybeSingle();const role=profile?.type

  const [{data:threadRows},{data:messageRows,error:messageError}]=await Promise.all([
    db.from('message_threads').select('id,athlete_id,provider_user_id,context_type,reservation_id,event_participant_id,status,created_at,updated_at').or(`athlete_id.eq.${user.id},provider_user_id.eq.${user.id}`).order('updated_at',{ascending:false}),
    db.from('messages').select('id,content,created_at,sender_id,receiver_id,read_at,thread_id').or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`).not('thread_id','is',null).order('created_at',{ascending:false}),
  ])
  if(messageError)throw new Error(`Não foi possível carregar as mensagens: ${messageError.message}`)
  const threads=(threadRows||[]) as any[];const messages=(messageRows||[]) as Message[]

  const params=await searchParams;let reservations:any[]=[];let participants:any[]=[]
  if(role==='athlete'){
    const [{data:r},{data:p}]=await Promise.all([
      admin.from('reservations').select('id,user_id,professional_id,service_id,space_id,space_room_id,date,start_time,end_time,status,payment_status,amount,created_at').eq('user_id',user.id),
      admin.from('event_participants').select('id,event_id,user_id,status,payment_status,created_at').eq('user_id',user.id),
    ]);reservations=r||[];participants=p||[]
  }else if(role==='professional'){
    const {data:prof}=await admin.from('professionals').select('id').eq('user_id',user.id).maybeSingle()
    if(prof?.id){const {data:r}=await admin.from('reservations').select('id,user_id,professional_id,service_id,space_id,space_room_id,date,start_time,end_time,status,payment_status,amount,created_at').eq('professional_id',prof.id);reservations=r||[]}
    const {data:ownedEvents}=await admin.from('events').select('id').eq('created_by',user.id);const ids=(ownedEvents||[]).map(e=>e.id);if(ids.length){const {data:p}=await admin.from('event_participants').select('id,event_id,user_id,status,payment_status,created_at').in('event_id',ids);participants=p||[]}
  }else if(role==='venue_manager'){
    const {data:ownedSpaces}=await admin.from('sport_spaces').select('id,name').eq('owner_user_id',user.id).order('created_at');const selectedSpace=(ownedSpaces||[]).find((s:any)=>s.id===params.space)||(ownedSpaces||[])[0]||null
    if(selectedSpace){const {data:r}=await admin.from('reservations').select('id,user_id,professional_id,service_id,space_id,space_room_id,date,start_time,end_time,status,payment_status,amount,created_at').eq('space_id',selectedSpace.id);reservations=r||[]}
    const {data:ownedEvents}=selectedSpace?await admin.from('events').select('id').eq('created_by',user.id).eq('space_id',selectedSpace.id):{data:[]};const eventIds=(ownedEvents||[]).map(e=>e.id);if(eventIds.length){const {data:p}=await admin.from('event_participants').select('id,event_id,user_id,status,payment_status,created_at').in('event_id',eventIds);participants=p||[]}
  }else if(role==='event_manager'){
    const {data:ownedEvents}=await admin.from('events').select('id').eq('created_by',user.id);const ids=(ownedEvents||[]).map(e=>e.id);if(ids.length){const {data:p}=await admin.from('event_participants').select('id,event_id,user_id,status,payment_status,created_at').in('event_id',ids);participants=p||[]}
  }

  const missingReservationIds=threads.map(t=>t.reservation_id).filter(Boolean).filter((id:string)=>!reservations.some(r=>r.id===id))
  if(role!=='venue_manager'&&missingReservationIds.length){const {data}=await admin.from('reservations').select('id,user_id,professional_id,service_id,space_id,space_room_id,date,start_time,end_time,status,payment_status,amount,created_at').in('id',missingReservationIds);reservations=[...reservations,...(data||[])]}
  const missingParticipantIds=threads.map(t=>t.event_participant_id).filter(Boolean).filter((id:string)=>!participants.some(p=>p.id===id))
  if(role!=='venue_manager'&&missingParticipantIds.length){const {data}=await admin.from('event_participants').select('id,event_id,user_id,status,payment_status,created_at').in('id',missingParticipantIds);participants=[...participants,...(data||[])]}

  const professionalIds=[...new Set(reservations.map(r=>r.professional_id).filter(Boolean))] as string[]
  const serviceIds=[...new Set(reservations.map(r=>r.service_id).filter(Boolean))] as string[]
  const spaceIds=[...new Set(reservations.map(r=>r.space_id).filter(Boolean))] as string[]
  const eventIds=[...new Set(participants.map(p=>p.event_id).filter(Boolean))] as string[]
  const [{data:professionals},{data:services},{data:spaces},{data:events}]=await Promise.all([
    professionalIds.length?admin.from('professionals').select('id,user_id,full_name,professional_name,avatar_url').in('id',professionalIds):Promise.resolve({data:[] as any[]}),
    serviceIds.length?admin.from('services').select('id,name,modality,duration_minutes,price').in('id',serviceIds):Promise.resolve({data:[] as any[]}),
    spaceIds.length?admin.from('sport_spaces').select('id,owner_user_id,name,address,logo_url').in('id',spaceIds):Promise.resolve({data:[] as any[]}),
    eventIds.length?admin.from('events').select('id,title,slug,created_by,address,start_date,end_date,price_min,price_max').in('id',eventIds):Promise.resolve({data:[] as any[]}),
  ])
  const professionalMap=new Map((professionals||[]).map((x:any)=>[x.id,x]));const serviceMap=new Map((services||[]).map((x:any)=>[x.id,x]));const spaceMap=new Map((spaces||[]).map((x:any)=>[x.id,x]));const eventMap=new Map((events||[]).map((x:any)=>[x.id,x]))

  const contexts:any[]=[]
  for(const reservation of reservations){
    const prof:any=reservation.professional_id?professionalMap.get(reservation.professional_id):null;const space:any=reservation.space_id?spaceMap.get(reservation.space_id):null
    const providerUserId=prof?.user_id||space?.owner_user_id||null;if(!providerUserId)continue
    const otherUserId=user.id===reservation.user_id?providerUserId:reservation.user_id;if(!otherUserId||otherUserId===user.id)continue
    const active=['paid','confirmed'].includes(String(reservation.status))&&(reservation.payment_status==='paid'||reservation.status==='confirmed')&&bookingEndKey(reservation.date,String(reservation.end_time))>nowKey
    const thread=threads.find(t=>t.reservation_id===reservation.id);if(!active&&!thread)continue
    const service:any=reservation.service_id?serviceMap.get(reservation.service_id):null
    contexts.push({key:`reservation:${reservation.id}`,contextType:'reservation',contextId:reservation.id,otherUserId,thread,active,kind:service?'Serviço':'Espaço',title:service?.name||space?.name||'Reserva',subtitle:service?.modality?`${service.modality}${space?.name?` · ${space.name}`:''}`:(space?.address||''),date:dayPt(reservation.date),time:timeRange(reservation.start_time,reservation.end_time),amount:Number(reservation.amount||0),status:String(reservation.status||''),createdAt:reservation.created_at})
  }
  for(const participant of participants){
    const event:any=eventMap.get(participant.event_id);if(!event?.created_by)continue
    const otherUserId=user.id===participant.user_id?event.created_by:participant.user_id;if(!otherUserId||otherUserId===user.id)continue
    const active=participant.payment_status==='paid'&&['confirmed','paid'].includes(String(participant.status))&&eventStillActive(event)
    const thread=threads.find(t=>t.event_participant_id===participant.id);if(!active&&!thread)continue
    contexts.push({key:`event:${participant.id}`,contextType:'event_participant',contextId:participant.id,otherUserId,thread,active,kind:'Evento',title:event.title||'Evento',subtitle:event.address||'',date:eventDayPt(event.start_date),time:eventTimeRange(event.start_date,event.end_date),amount:event.price_min==null?null:Number(event.price_min),status:String(participant.status||''),createdAt:participant.created_at})
  }

  const identityIds=[...new Set(contexts.map(c=>c.otherUserId))]
  const [{data:profiles},{data:identityProfessionals},{data:identitySpaces}]=identityIds.length?await Promise.all([
    admin.from('platform_users').select('id,full_name,avatar_url,type').in('id',identityIds),
    admin.from('professionals').select('user_id,full_name,professional_name,avatar_url').in('user_id',identityIds),
    admin.from('sport_spaces').select('owner_user_id,name,logo_url').in('owner_user_id',identityIds),
  ]):[{data:[]},{data:[]},{data:[]}]
  const profileMap=new Map((profiles||[]).map((x:any)=>[x.id,x]));const profUserMap=new Map((identityProfessionals||[]).map((x:any)=>[x.user_id,x]));const spaceUserMap=new Map((identitySpaces||[]).map((x:any)=>[x.owner_user_id,x]))
  const identity=(id:string)=>{const p:any=profileMap.get(id);if(!p||!isPlatformRole(p.type))return null;const prof:any=p.type==='professional'?profUserMap.get(id):null;const space:any=p.type==='venue_manager'?spaceUserMap.get(id):null;return{name:getUserDisplayName({type:p.type,full_name:p.full_name,professional_name:prof?.professional_name,professional_full_name:prof?.full_name,space_name:space?.name}),avatar:getUserAvatarUrl({type:p.type,avatar_url:p.avatar_url,professional_avatar_url:prof?.avatar_url,space_logo_url:space?.logo_url}),role:getUserRoleLabel(p.type)}}

  const contacts:Contact[]=contexts.map(context=>{
    const person=identity(context.otherUserId);if(!person)return null
    const threadMessages=context.thread?messages.filter(m=>m.thread_id===context.thread.id):[];const last=threadMessages[0]
    return{id:context.thread?.id||context.key,userId:context.otherUserId,threadId:context.thread?.id||null,...person,unread:threadMessages.filter(m=>m.sender_id===context.otherUserId&&m.receiver_id===user.id&&!m.read_at).length,lastMsg:last?.content||(context.active?'Conversa disponível':'Conversa encerrada'),lastMsgDate:last?.created_at||context.thread?.updated_at||context.createdAt||new Date(0).toISOString(),archived:!context.active,contextType:context.contextType,contextId:context.contextId,contextKind:context.kind,contextTitle:context.title,contextLabel:`${context.kind} · ${context.title}`,contextDetail:[context.date,context.time].filter(Boolean).join(' · '),contextDate:context.date,contextTime:context.time,contextAmount:context.amount,contextStatus:context.status,contextSubtitle:context.subtitle} as Contact
  }).filter(Boolean) as Contact[]
  contacts.sort((a,b)=>Number(Boolean(a.archived))-Number(Boolean(b.archived))||new Date(b.lastMsgDate).getTime()-new Date(a.lastMsgDate).getTime())
  return <ChatInterface initialContacts={contacts} initialMessages={messages} currentUserId={user.id}/>
}
