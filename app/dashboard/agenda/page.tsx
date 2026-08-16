import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Calendar, CalendarCheck, Clock, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess } from '@/lib/auth/access'
import { Button } from '@/components/ui/button'
import { DashboardPage, DashboardPageHeader, DashboardSection, DashboardStat, DashboardStatGrid } from '@/components/patterns/dashboard-page'
import { AgendaCalendar } from '@/components/dashboard/agenda-calendar'

type AgendaItem={id:string;kind:'event'|'reservation';title:string;at:string;endAt?:string|null;status:string;location?:string|null;href:string}

export default async function DashboardAgendaPage(){
  const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)redirect('/auth/login?redirect=/dashboard/agenda')
  const access=await resolveSessionAccess(supabase,user);if(!access)redirect('/dashboard')
  const admin=createAdminClient();let items:AgendaItem[]=[]

  const [{data:myReservations},{data:myParticipations}]=await Promise.all([
    admin.from('reservations').select('id,date,start_time,end_time,status,payment_status,service_id,professional_id,space_id').eq('user_id',user.id).order('date',{ascending:true}),
    admin.from('event_participants').select('id,event_id,status,payment_status').eq('user_id',user.id),
  ])
  const serviceIds=[...new Set((myReservations||[]).map(r=>r.service_id).filter((x):x is string=>Boolean(x)))];const professionalIds=[...new Set((myReservations||[]).map(r=>r.professional_id).filter((x):x is string=>Boolean(x)))];const spaceIds=[...new Set((myReservations||[]).map(r=>r.space_id).filter((x):x is string=>Boolean(x)))];const eventIds=[...new Set((myParticipations||[]).map(p=>p.event_id))]
  const [services,pros,spaces,myEvents]=await Promise.all([
    serviceIds.length?admin.from('services').select('id,name').in('id',serviceIds):Promise.resolve({data:[]}),
    professionalIds.length?admin.from('professionals').select('id,full_name,professional_name,address').in('id',professionalIds):Promise.resolve({data:[]}),
    spaceIds.length?admin.from('sport_spaces').select('id,name,address,slug').in('id',spaceIds):Promise.resolve({data:[]}),
    eventIds.length?admin.from('events').select('id,title,start_date,end_date,address,status').in('id',eventIds):Promise.resolve({data:[]}),
  ])
  const serviceMap=new Map((services.data||[]).map(x=>[x.id,x]));const proMap=new Map((pros.data||[]).map(x=>[x.id,x]));const spaceMap=new Map((spaces.data||[]).map(x=>[x.id,x]))
  items.push(...(myReservations||[]).map(r=>{const service=r.service_id?serviceMap.get(r.service_id):null;const pro=r.professional_id?proMap.get(r.professional_id):null;const space=r.space_id?spaceMap.get(r.space_id):null;const title=service?.name||space?.name||'Reserva';const location=space?.address||pro?.address||null;return{id:`my-reservation-${r.id}`,kind:'reservation' as const,title:`Minha reserva · ${title}`,at:new Date(`${r.date}T${String(r.start_time).slice(0,8)}`).toISOString(),endAt:r.end_time?new Date(`${r.date}T${String(r.end_time).slice(0,8)}`).toISOString():null,status:r.status,location,href:'/dashboard/compras'}}))
  items.push(...(myEvents.data||[]).map(e=>({id:`my-event-${e.id}`,kind:'event' as const,title:`Vou participar · ${e.title}`,at:new Date(e.start_date).toISOString(),endAt:e.end_date?new Date(e.end_date).toISOString():null,status:e.status,location:e.address,href:`/eventos/${e.id}`})))

  if(access.role!=='athlete'){
    const {data:createdEvents}=await admin.from('events').select('id,title,start_date,end_date,address,status').eq('created_by',user.id).order('start_date',{ascending:true})
    let providerReservations:any[]=[]
    if(access.role==='professional'){const {data:p}=await admin.from('professionals').select('id').eq('user_id',user.id).maybeSingle();if(p)providerReservations=(await admin.from('reservations').select('id,date,start_time,end_time,status,user_id').eq('professional_id',p.id).order('date',{ascending:true})).data||[]}
    else if(access.role==='venue_manager'){const {data:s}=await admin.from('sport_spaces').select('id').eq('owner_user_id',user.id);const ids=(s||[]).map(x=>x.id);if(ids.length)providerReservations=(await admin.from('reservations').select('id,date,start_time,end_time,status,user_id').in('space_id',ids).order('date',{ascending:true})).data||[]}
    const clientIds=[...new Set(providerReservations.map(r=>r.user_id).filter(Boolean))];const clients=clientIds.length?(await admin.from('platform_users').select('id,full_name').in('id',clientIds)).data||[]:[];const names=new Map(clients.map(c=>[c.id,c.full_name]))
    items.push(...(createdEvents||[]).map(e=>({id:`managed-event-${e.id}`,kind:'event' as const,title:`Organizo · ${e.title}`,at:new Date(e.start_date).toISOString(),endAt:e.end_date?new Date(e.end_date).toISOString():null,status:e.status,location:e.address,href:`/eventos/${e.id}`})))
    items.push(...providerReservations.map(r=>({id:`managed-reservation-${r.id}`,kind:'reservation' as const,title:`Cliente · ${names.get(r.user_id)||'Reserva'}`,at:new Date(`${r.date}T${String(r.start_time).slice(0,8)}`).toISOString(),endAt:r.end_time?new Date(`${r.date}T${String(r.end_time).slice(0,8)}`).toISOString():null,status:r.status,href:'/dashboard/reservas'})))
  }

  items=items.filter(i=>!Number.isNaN(new Date(i.at).getTime())).sort((a,b)=>new Date(a.at).getTime()-new Date(b.at).getTime())
  const now=new Date(),today=items.filter(i=>new Date(i.at).toDateString()===now.toDateString()),upcoming=items.filter(i=>new Date(i.at)>=now)
  const description=access.role==='athlete'?'Os teus serviços, alugueres de espaços e eventos num único calendário.':'A tua agenda combina compromissos como prestador com serviços, espaços e eventos que compras a outros prestadores.'
  return <DashboardPage><DashboardPageHeader title="Agenda" description={description} action={<div className="flex flex-wrap gap-2"><Button asChild variant="outline"><Link href="/pesquisa">Encontrar atividade</Link></Button>{access.role!=='athlete'&&<Button asChild variant="outline"><Link href="/dashboard/reservas">Gerir reservas</Link></Button>}</div>}/><DashboardStatGrid><DashboardStat label="Hoje" value={today.length} icon={<Clock className="h-5 w-5"/>}/><DashboardStat label="Próximos" value={upcoming.length} icon={<Calendar className="h-5 w-5"/>}/><DashboardStat label="Reservas" value={items.filter(i=>i.kind==='reservation').length} icon={<CalendarCheck className="h-5 w-5"/>}/><DashboardStat label="Eventos" value={items.filter(i=>i.kind==='event').length} icon={<MapPin className="h-5 w-5"/>}/></DashboardStatGrid><DashboardSection title="Calendário" description="Alterna entre Dia, Semana e Mês."><AgendaCalendar items={items}/></DashboardSection></DashboardPage>
}
