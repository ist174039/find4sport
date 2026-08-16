'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess } from '@/lib/auth/access'

function minutes(value:string){const[h,m]=String(value).slice(0,5).split(':').map(Number);return h*60+m}
function hhmm(total:number){return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`}
function lisbonLocalEpoch(date:string,time:string){
  const[y,m,d]=date.split('-').map(Number);const[h,min]=String(time).slice(0,5).split(':').map(Number)
  if(![y,m,d,h,min].every(Number.isFinite))return NaN
  const wallClockUtc=Date.UTC(y,m-1,d,h,min,0)
  const formatter=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Lisbon',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'})
  const parts=formatter.formatToParts(new Date(wallClockUtc));const get=(type:Intl.DateTimeFormatPartTypes)=>Number(parts.find(part=>part.type===type)?.value)
  const representedAsUtc=Date.UTC(get('year'),get('month')-1,get('day'),get('hour'),get('minute'),get('second'))
  const offsetMs=representedAsUtc-wallClockUtc
  return wallClockUtc-offsetMs
}
function assert24Hours(date:string,time:string){const start=lisbonLocalEpoch(date,time);if(!Number.isFinite(start)||start-Date.now()<24*60*60*1000)throw new Error('As alterações só podem ser pedidas com pelo menos 24 horas de antecedência.')}

async function validateSlot(admin:ReturnType<typeof createAdminClient>,reservation:any,date:string,startTime:string,endTime:string,excludeReservationId:string){
  const midday=lisbonLocalEpoch(date,'12:00');const day=new Date(midday).getUTCDay()
  if(reservation.professional_id){const{data:availability,error}=await admin.from('professional_availability').select('start_time,end_time').eq('professional_id',reservation.professional_id).eq('day_of_week',day).eq('is_active',true);if(error)throw new Error('Não foi possível validar a disponibilidade do profissional.');if(!(availability||[]).some((slot:any)=>startTime>=String(slot.start_time).slice(0,5)&&endTime<=String(slot.end_time).slice(0,5)))throw new Error('O novo horário está fora da disponibilidade do profissional.')}
  if(reservation.space_room_id){const{data:availability,error}=await admin.from('space_room_availability').select('start_time,end_time').eq('room_id',reservation.space_room_id).eq('day_of_week',day).eq('is_active',true);if(error)throw new Error('Não foi possível validar a disponibilidade da sala/campo.');if(!(availability||[]).some((slot:any)=>startTime>=String(slot.start_time).slice(0,5)&&endTime<=String(slot.end_time).slice(0,5)))throw new Error('O novo horário está fora da disponibilidade da sala/campo.')}
  let conflicts=admin.from('reservations').select('id').eq('date',date).in('status',['pending','paid','confirmed']).neq('id',excludeReservationId).lt('start_time',endTime).gt('end_time',startTime)
  if(reservation.professional_id)conflicts=conflicts.eq('professional_id',reservation.professional_id);else if(reservation.space_room_id)conflicts=conflicts.eq('space_room_id',reservation.space_room_id);else if(reservation.space_id)conflicts=conflicts.eq('space_id',reservation.space_id)
  const{data,error}=await conflicts.limit(1);if(error)throw new Error('Não foi possível validar conflitos da agenda.');if(data?.length)throw new Error('O novo horário já está ocupado.')
}

export async function requestReservationChangeAction(input:{reservationId:string;date:string;startTime:string}){
  const supabase=await createClient();const{data:{user}}=await supabase.auth.getUser();if(!user)throw new Error('Autenticação necessária.');const admin=createAdminClient();const db=admin as any
  const{data:reservation,error}=await db.from('reservations').select('id,user_id,professional_id,space_id,space_room_id,date,start_time,end_time,status,payment_status').eq('id',input.reservationId).maybeSingle();if(error||!reservation)throw new Error('Reserva não encontrada.');if(reservation.user_id!==user.id)throw new Error('Não tens permissão para alterar esta reserva.');if(!['pending','paid','confirmed'].includes(String(reservation.status)))throw new Error('Esta reserva já não pode ser alterada.')
  assert24Hours(reservation.date,reservation.start_time)
  const date=String(input.date||'');const startTime=String(input.startTime||'').slice(0,5);if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^\d{2}:\d{2}$/.test(startTime))throw new Error('Seleciona uma nova data e hora válidas.');assert24Hours(date,startTime)
  const duration=minutes(reservation.end_time)-minutes(reservation.start_time);if(duration<=0)throw new Error('A duração da reserva é inválida.');const endTotal=minutes(startTime)+duration;if(endTotal>=1440)throw new Error('O novo horário ultrapassa o fim do dia.');const endTime=hhmm(endTotal)
  await validateSlot(admin,reservation,date,startTime,endTime,reservation.id)
  const{data:existing}=await db.from('reservation_change_requests').select('id').eq('reservation_id',reservation.id).eq('status','pending').maybeSingle();if(existing)throw new Error('Já existe um pedido de alteração pendente para esta reserva.')
  const{error:insertError}=await db.from('reservation_change_requests').insert({reservation_id:reservation.id,requested_by:user.id,requested_date:date,requested_start_time:startTime,requested_end_time:endTime,status:'pending'});if(insertError)throw new Error(insertError.code==='23505'?'Já existe um pedido de alteração pendente.':'Não foi possível criar o pedido de alteração.')
  revalidatePath('/dashboard/compras');revalidatePath('/dashboard/agenda');revalidatePath('/dashboard/reservas');return{success:true}
}

export async function reviewReservationChangeAction(requestId:string,decision:'approved'|'rejected',reviewerNote?:string){
  const supabase=await createClient();const{data:{user}}=await supabase.auth.getUser();if(!user)throw new Error('Autenticação necessária.');const access=await resolveSessionAccess(supabase,user);if(!access||!['professional','venue_manager'].includes(access.role))throw new Error('Não tens permissão para rever alterações de reservas.');const admin=createAdminClient();const db=admin as any
  const{data:request,error}=await db.from('reservation_change_requests').select('id,reservation_id,requested_date,requested_start_time,requested_end_time,status').eq('id',requestId).maybeSingle();if(error||!request||request.status!=='pending')throw new Error('Pedido de alteração não encontrado ou já revisto.')
  const{data:reservation}=await db.from('reservations').select('id,user_id,professional_id,space_id,space_room_id,date,start_time,end_time,status').eq('id',request.reservation_id).maybeSingle();if(!reservation)throw new Error('Reserva não encontrada.');let authorized=false
  if(access.role==='professional'&&reservation.professional_id){const{data:p}=await admin.from('professionals').select('id').eq('id',reservation.professional_id).eq('user_id',user.id).maybeSingle();authorized=Boolean(p)}
  if(access.role==='venue_manager'&&reservation.space_id){const{data:s}=await admin.from('sport_spaces').select('id').eq('id',reservation.space_id).or(`owner_user_id.eq.${user.id},created_by.eq.${user.id}`).maybeSingle();authorized=Boolean(s)}
  if(!authorized)throw new Error('Não tens permissão para rever este pedido.')
  if(decision==='approved'){if(!['pending','paid','confirmed'].includes(String(reservation.status)))throw new Error('A reserva já não pode ser alterada.');assert24Hours(reservation.date,reservation.start_time);assert24Hours(request.requested_date,request.requested_start_time);await validateSlot(admin,reservation,request.requested_date,String(request.requested_start_time).slice(0,5),String(request.requested_end_time).slice(0,5),reservation.id);const{error:updateReservationError}=await db.from('reservations').update({date:request.requested_date,start_time:request.requested_start_time,end_time:request.requested_end_time,updated_at:new Date().toISOString()}).eq('id',reservation.id);if(updateReservationError)throw new Error('Não foi possível aplicar a nova data/hora à reserva.')}
  const{error:updateRequestError}=await db.from('reservation_change_requests').update({status:decision,reviewer_id:user.id,reviewer_note:reviewerNote?.trim().slice(0,500)||null,reviewed_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq('id',request.id).eq('status','pending');if(updateRequestError)throw new Error('A reserva foi processada, mas não foi possível atualizar o estado do pedido.')
  revalidatePath('/dashboard/compras');revalidatePath('/dashboard/agenda');revalidatePath('/dashboard/reservas');return{success:true}
}
