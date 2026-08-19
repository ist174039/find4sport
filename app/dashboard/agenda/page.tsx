import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Calendar, CalendarCheck, Clock, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess } from '@/lib/auth/access'
import { Button } from '@/components/ui/button'
import { DashboardPage, DashboardPageHeader, DashboardSection, DashboardStat, DashboardStatGrid } from '@/components/patterns/dashboard-page'
import { AgendaCalendar, type AgendaItem } from '@/components/dashboard/agenda-calendar'
import type { ReservationChangeRequest } from '@/components/dashboard/reservation-details-dialog'

function localIso(date:string,time:string){return `${date}T${String(time).slice(0,8)}`}

export default async function DashboardAgendaPage(){
  const supabase=await createClient();const{data:{user}}=await supabase.auth.getUser();if(!user)redirect('/auth/login?redirect=/dashboard/agenda')
  const access=await resolveSessionAccess(supabase,user);if(!access)redirect('/dashboard')
  const admin=createAdminClient();const db=admin as any;let items:AgendaItem[]=[]

  const[{data:myReservations},{data:myParticipations}]=await Promise.all([
    db.from('reservations').select('id,date,start_time,end_time,status,payment_status,amount,service_id,professional_id,space_id,space_room_id').eq('user_id',user.id).order('date',{ascending:true}),
    admin.from('event_participants').select('id,event_id,status,payment_status').eq('user_id',user.id),
  ])
  const serviceIds=[...new Set((myReservations||[]).map((r:any)=>r.service_id).filter(Boolean))] as string[];const professionalIds=[...new Set((myReservations||[]).map((r:any)=>r.professional_id).filter(Boolean))] as string[];const spaceIds=[...new Set((myReservations||[]).map((r:any)=>r.space_id).filter(Boolean))] as string[];const roomIds=[...new Set((myReservations||[]).map((r:any)=>r.space_room_id).filter(Boolean))] as string[];const eventIds=[...new Set((myParticipations||[]).map(p=>p.event_id))]
  const[services,pros,spaces,rooms,myEvents]=await Promise.all([
    serviceIds.length?admin.from('services').select('id,name').in('id',serviceIds):Promise.resolve({data:[] as any[]}),
    professionalIds.length?admin.from('professionals').select('id,full_name,professional_name,address').in('id',professionalIds):Promise.resolve({data:[] as any[]}),
    spaceIds.length?admin.from('sport_spaces').select('id,name,address,slug').in('id',spaceIds):Promise.resolve({data:[] as any[]}),
    roomIds.length?db.from('space_rooms').select('id,name').in('id',roomIds):Promise.resolve({data:[] as any[]}),
    eventIds.length?admin.from('events').select('id,title,start_date,end_date,address,status').in('id',eventIds):Promise.resolve({data:[] as any[]}),
  ])
  const serviceMap=new Map<string,any>((services.data||[]).map((x:any)=>[x.id,x]));const proMap=new Map<string,any>((pros.data||[]).map((x:any)=>[x.id,x]));const spaceMap=new Map<string,any>((spaces.data||[]).map((x:any)=>[x.id,x]));const roomMap=new Map<string,any>(((rooms as any).data||[]).map((x:any)=>[x.id,x]))
  items.push(...(myReservations||[]).map((r:any)=>{const service:any=r.service_id?serviceMap.get(r.service_id):null;const pro:any=r.professional_id?proMap.get(r.professional_id):null;const space:any=r.space_id?spaceMap.get(r.space_id):null;const room:any=r.space_room_id?roomMap.get(r.space_room_id):null;const title=service?.name||room?.name||space?.name||'Reserva';const provider=pro?.professional_name||pro?.full_name||space?.name||null;const location=space?.address||pro?.address||null;return{id:`my-reservation-${r.id}`,kind:'reservation' as const,title:`Minha reserva · ${title}`,at:localIso(r.date,r.start_time),endAt:r.end_time?localIso(r.date,r.end_time):null,status:r.status||'pending',location,href:'/dashboard/compras',reservationAccess:'request' as const,reservation:{id:r.id,title,provider,date:r.date,startTime:String(r.start_time).slice(0,5),endTime:String(r.end_time).slice(0,5),amount:Number(r.amount||0),status:r.status||'pending',paymentStatus:r.payment_status,location,reference:String(r.id).slice(0,8),kind:service?'Serviço':'Espaço'}}}))
  items.push(...((myEvents as any).data||[]).map((e:any)=>({id:`my-event-${e.id}`,kind:'event' as const,title:`Vou participar · ${e.title}`,at:e.start_date,endAt:e.end_date||null,status:e.status||'pending',location:e.address,href:`/eventos/${e.id}`})))

  if(access.role!=='athlete'){
    const{data:createdEvents}=await admin.from('events').select('id,title,start_date,end_date,address,status').eq('created_by',user.id).order('start_date',{ascending:true})
    let providerReservations:any[]=[];let ownedSpaces:any[]=[]
    if(access.role==='professional'){
      const{data:p}=await admin.from('professionals').select('id,full_name,professional_name,address').eq('user_id',user.id).maybeSingle()
      if(p)providerReservations=(await db.from('reservations').select('id,date,start_time,end_time,status,payment_status,amount,user_id,service_id,space_id,space_room_id').eq('professional_id',p.id).order('date',{ascending:true})).data||[]
    }else if(access.role==='venue_manager'){
      const{data:s}=await admin.from('sport_spaces').select('id,name,address').or(`owner_user_id.eq.${user.id},created_by.eq.${user.id}`);ownedSpaces=s||[];const ids=ownedSpaces.map(x=>x.id);if(ids.length)providerReservations=(await db.from('reservations').select('id,date,start_time,end_time,status,payment_status,amount,user_id,service_id,space_id,space_room_id').in('space_id',ids).order('date',{ascending:true})).data||[]
    }
    const providerServiceIds=[...new Set(providerReservations.map(r=>r.service_id).filter(Boolean))] as string[];const providerRoomIds=[...new Set(providerReservations.map(r=>r.space_room_id).filter(Boolean))] as string[];const clientIds=[...new Set(providerReservations.map(r=>r.user_id).filter(Boolean))] as string[]
    const[providerServices,providerRooms,clients]=await Promise.all([providerServiceIds.length?admin.from('services').select('id,name').in('id',providerServiceIds):Promise.resolve({data:[] as any[]}),providerRoomIds.length?db.from('space_rooms').select('id,name').in('id',providerRoomIds):Promise.resolve({data:[] as any[]}),clientIds.length?admin.from('platform_users').select('id,full_name').in('id',clientIds):Promise.resolve({data:[] as any[]})])
    const providerServiceMap=new Map<string,any>((providerServices.data||[]).map((x:any)=>[x.id,x]));const providerRoomMap=new Map<string,any>(((providerRooms as any).data||[]).map((x:any)=>[x.id,x]));const clientMap=new Map<string,string>((clients.data||[]).map((x:any)=>[x.id,x.full_name]));const ownedSpaceMap=new Map<string,any>(ownedSpaces.map((x:any)=>[x.id,x]))
    items.push(...(createdEvents||[]).map(e=>({id:`managed-event-${e.id}`,kind:'event' as const,title:`Organizo · ${e.title}`,at:e.start_date,endAt:e.end_date||null,status:e.status||'pending',location:e.address,href:`/eventos/${e.id}`})))
    items.push(...providerReservations.map(r=>{const service:any=r.service_id?providerServiceMap.get(r.service_id):null;const room:any=r.space_room_id?providerRoomMap.get(r.space_room_id):null;const ownedSpace:any=r.space_id?ownedSpaceMap.get(r.space_id):null;const title=service?.name||room?.name||ownedSpace?.name||'Reserva';const customer=clientMap.get(r.user_id)||'Cliente';return{id:`managed-reservation-${r.id}`,kind:'reservation' as const,title:`Cliente · ${customer}`,at:localIso(r.date,r.start_time),endAt:r.end_time?localIso(r.date,r.end_time):null,status:r.status||'pending',location:ownedSpace?.address||null,href:'/dashboard/reservas',reservationAccess:'review' as const,reservation:{id:r.id,title,customer,date:r.date,startTime:String(r.start_time).slice(0,5),endTime:String(r.end_time).slice(0,5),amount:Number(r.amount||0),status:r.status||'pending',paymentStatus:r.payment_status,location:ownedSpace?.address||null,reference:String(r.id).slice(0,8),kind:service?'Serviço':'Espaço'}}}))
  }

  const reservationIds=items.flatMap(item=>item.kind==='reservation'&&item.reservation?[item.reservation.id]:[])
  const pendingChangesRaw=reservationIds.length?((await db.from('reservation_change_requests').select('id,reservation_id,requested_date,requested_start_time,requested_end_time,status').in('reservation_id',reservationIds).eq('status','pending')).data||[]):[]
  const pendingChanges=(pendingChangesRaw as Array<ReservationChangeRequest&{reservation_id:string}>)
  const changeMap=new Map<string,ReservationChangeRequest>(pendingChanges.map(request=>[request.reservation_id,request]))
  items=items.map(item=>item.kind==='reservation'&&item.reservation?{...item,changeRequest:changeMap.get(item.reservation.id)||null}:item)
  items=items.filter(i=>!Number.isNaN(new Date(i.at).getTime())).sort((a,b)=>new Date(a.at).getTime()-new Date(b.at).getTime())
  const now=new Date(),today=items.filter(i=>new Date(i.at).toDateString()===now.toDateString()),upcoming=items.filter(i=>new Date(i.at)>=now);const description=access.role==='athlete'?'Os teus serviços, alugueres de espaços e eventos num único calendário.':'A tua agenda combina compromissos como prestador com serviços, espaços e eventos que compras a outros prestadores.'
  return <DashboardPage><DashboardPageHeader title="Agenda" description={description} action={<div className="flex flex-wrap gap-2"><Button asChild variant="outline"><Link href="/pesquisa">Encontrar atividade</Link></Button>{access.role!=='athlete'&&<Button asChild variant="outline"><Link href="/dashboard/reservas">Gerir reservas</Link></Button>}</div>}/><DashboardStatGrid><DashboardStat label="Hoje" value={today.length} icon={<Clock className="h-5 w-5"/>}/><DashboardStat label="Próximos" value={upcoming.length} icon={<Calendar className="h-5 w-5"/>}/><DashboardStat label="Reservas" value={items.filter(i=>i.kind==='reservation').length} icon={<CalendarCheck className="h-5 w-5"/>}/><DashboardStat label="Eventos" value={items.filter(i=>i.kind==='event').length} icon={<MapPin className="h-5 w-5"/>}/></DashboardStatGrid><DashboardSection title="Calendário" description="Clica numa reserva para ver todos os detalhes e ações disponíveis."><AgendaCalendar items={items}/></DashboardSection></DashboardPage>
}