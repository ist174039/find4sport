'use server'

import { revalidatePath } from 'next/cache'
import { requireAdminPermission } from '@/lib/auth/authorization'
import { releaseReservationSettlement } from '@/lib/billing/reservation-settlement'
import { createReservationRefund } from '@/lib/billing/admin-refund'
import { writeAdminAudit } from '@/lib/admin/audit'

type Resolution = 'release' | 'refund'

async function providerUserId(db:any,r:{professional_id?:string|null;space_id?:string|null}){if(r.professional_id)return(await db.from('professionals').select('user_id').eq('id',r.professional_id).maybeSingle()).data?.user_id||null;if(r.space_id)return(await db.from('sport_spaces').select('owner_user_id').eq('id',r.space_id).maybeSingle()).data?.owner_user_id||null;return null}
async function notify(db:any,userId:string|null,message:string,reservationId:string,suffix:string,link='/dashboard/agenda'){if(!userId)return;await db.from('notifications').insert({user_id:userId,type:'reservation',message,link,data:{reservation_id:reservationId},dedupe_key:`dispute:${reservationId}:${suffix}`})}

export async function resolveReservationDisputeAction(reservationId:string,resolution:Resolution,note:string){
 const {user,admin:db}=await requireAdminPermission('finance.operate');const cleanNote=String(note||'').trim();if(cleanNote.length<5||cleanNote.length>2000)throw new Error('Regista uma justificação entre 5 e 2000 caracteres.')
 const {data:r,error:reservationError}=await db.from('reservations').select('id,user_id,professional_id,space_id,status,payment_status,service_delivery_status,settlement_status').eq('id',reservationId).maybeSingle();if(reservationError||!r)throw new Error('Reserva não encontrada.');if(r.payment_status!=='paid'||r.service_delivery_status!=='disputed'||r.settlement_status!=='blocked')throw new Error('Esta contestação já não está pendente de decisão.')
 const providerId=await providerUserId(db,r),now=new Date().toISOString()
 if(resolution==='release'){
  const previousStatus=r.status;const {data:updated,error}=await db.from('reservations').update({service_delivery_status:'completed',settlement_status:'eligible',status:'completed',updated_at:now}).eq('id',reservationId).eq('service_delivery_status','disputed').eq('settlement_status','blocked').select('id').maybeSingle();if(error||!updated)throw new Error(error?.message||'Não foi possível resolver a contestação.')
  try{await releaseReservationSettlement(reservationId)}catch(error){await db.from('reservations').update({service_delivery_status:'disputed',settlement_status:'blocked',status:previousStatus,updated_at:new Date().toISOString()}).eq('id',reservationId).eq('settlement_status','eligible');throw error}
  await db.from('reservation_delivery_events').insert({reservation_id:reservationId,event_type:'dispute_resolved_provider',actor_user_id:user.id,note:cleanNote});await writeAdminAudit(db,{action:'UPDATE',tableName:'reservations',userEmail:user.email||user.id,message:'Contestação resolvida a favor do prestador e settlement libertado.',data:{reservation_id:reservationId,resolution:'release',note:cleanNote}});await Promise.all([notify(db,r.user_id,'A contestação foi analisada. O serviço foi considerado prestado e o pagamento foi libertado ao prestador.',reservationId,'released:athlete'),notify(db,providerId,'A contestação foi resolvida a teu favor e o valor da reserva foi libertado.',reservationId,'released:provider','/dashboard/entregas')])
 }else{
  const {data:tx,error:txError}=await db.from('transactions').select('id,stripe_charge_id,stripe_payment_intent_id,stripe_transfer_id').eq('source_id',reservationId).in('type',['service_reservation_payment','space_reservation_payment']).eq('status','completed').order('created_at',{ascending:false}).limit(1).maybeSingle();if(txError||!tx)throw new Error('Transação financeira da reserva não encontrada.')
  const refund=await createReservationRefund({reservationId,chargeId:tx.stripe_charge_id,paymentIntentId:tx.stripe_payment_intent_id,transferId:tx.stripe_transfer_id,reason:'admin_dispute_refund'});const succeeded=refund.succeeded
  const {error}=await db.from('reservations').update({payment_status:succeeded?'refunded':'refund_pending',status:'cancelled',service_delivery_status:'cancelled',settlement_status:succeeded?'refunded':'blocked',updated_at:now}).eq('id',reservationId).eq('service_delivery_status','disputed').eq('settlement_status','blocked');if(error)throw error
  await db.from('reservation_delivery_events').insert({reservation_id:reservationId,event_type:succeeded?'dispute_resolved_refund':'dispute_refund_pending',actor_user_id:user.id,note:cleanNote,metadata:{stripe_refund_id:refund.id,stripe_refund_status:refund.status,stripe_reversal_id:refund.reversal?.id||null}})
  await writeAdminAudit(db,{action:'UPDATE',tableName:'reservations',userEmail:user.email||user.id,message:'Contestação resolvida com operação financeira Stripe.',data:{reservation_id:reservationId,transaction_id:tx.id,resolution:'refund',stripe_refund_id:refund.id,stripe_refund_status:refund.status,stripe_reversal_id:refund.reversal?.id||null,note:cleanNote}})
  await Promise.all([notify(db,r.user_id,succeeded?'A contestação foi analisada e a reserva foi reembolsada.':'A contestação foi analisada e o reembolso da reserva está a ser processado.',reservationId,succeeded?'refunded:athlete':'refund-pending:athlete'),notify(db,providerId,succeeded?'A contestação da reserva foi resolvida com reembolso ao atleta.':'A contestação foi resolvida com reembolso ao atleta, atualmente em processamento.',reservationId,succeeded?'refunded:provider':'refund-pending:provider','/dashboard/entregas')])
 }
 revalidatePath('/admin/disputas');revalidatePath('/admin/faturacao');revalidatePath('/dashboard/agenda');revalidatePath('/dashboard/reservas');revalidatePath('/dashboard/entregas');revalidatePath('/dashboard/confirmacoes');return{success:true}
}
