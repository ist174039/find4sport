import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Activity, Calendar, CalendarCheck, Heart, MessageSquare, ReceiptText, Star, UserRound, BriefcaseBusiness, ArrowRight } from 'lucide-react'
import type { PlatformRole } from '@/lib/auth/roles'
import { DashboardPage, DashboardPageHeader, DashboardSection, DashboardStat, DashboardStatGrid } from '@/components/patterns/dashboard-page'

type Props = { role: PlatformRole; userId: string; displayName: string; entity?: any }
type Metric = { label: string; value: string | number; icon: any; hint?: string }

export async function OverviewDashboard({ role, userId, displayName, entity }: Props) {
  const supabase = await createClient()
  const { count: unreadMessages } = await supabase.from('messages').select('id', { count: 'exact', head: true }).eq('receiver_id', userId).is('read_at', null)
  const { data: recentMessages } = await supabase.from('messages').select('id,sender_id,content,created_at,read_at').eq('receiver_id', userId).order('created_at', { ascending: false }).limit(3)
  const senderIds = Array.from(new Set((recentMessages || []).map(message => message.sender_id)))
  const { data: senders } = senderIds.length ? await supabase.from('platform_users').select('id,full_name,type').in('id', senderIds) : { data: [] as any[] }
  const senderMap = new Map((senders || []).map(sender => [sender.id, sender]))

  let metrics: Metric[] = []
  let activityTitle = 'Atividade recente'
  let activityRows: Array<{ id: string; title: string; subtitle: string; status?: string }> = []
  let primaryHref = '/pesquisa'
  let primaryLabel = 'Explorar plataforma'
  let athleteUpcoming = 0
  let athletePaid = 0

  if (role === 'athlete') {
    const now = new Date().toISOString().slice(0, 10)
    const [{ count: favorites }, { count: registrations }, { count: following }, { data: participations }, { data: reservations }] = await Promise.all([
      supabase.from('favorites').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('event_participants').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('user_follows').select('id', { count: 'exact', head: true }).eq('follower_id', userId),
      supabase.from('event_participants').select('id,event:events(id,title,start_date,status)').eq('user_id', userId).order('created_at', { ascending: false }).limit(4),
      supabase.from('reservations').select('id,date,status,payment_status,amount').eq('user_id', userId).order('date', { ascending: false }).limit(100),
    ])
    athleteUpcoming = (reservations || []).filter(item => item.date >= now && !['cancelled', 'completed'].includes(String(item.status))).length
    athletePaid = (reservations || []).filter(item => item.payment_status === 'paid' || ['paid', 'completed'].includes(String(item.status))).length
    metrics = [
      { label: 'Próximos', value: athleteUpcoming, icon: Calendar },
      { label: 'Compras', value: athletePaid, icon: ReceiptText },
      { label: 'Favoritos', value: favorites || 0, icon: Heart },
      { label: 'Mensagens', value: unreadMessages || 0, icon: MessageSquare, hint: 'não lidas' },
    ]
    activityTitle = 'Os meus eventos'
    activityRows = (participations || []).flatMap((participation: any) => participation.event ? [{ id: participation.id, title: participation.event.title, subtitle: new Date(participation.event.start_date).toLocaleDateString('pt-PT'), status: participation.event.status }] : [])
    primaryLabel = 'Descobrir profissionais e espaços'
    void registrations; void following
  }

  if (role === 'professional') {
    const [{ count: services }, { count: followers }, { data: recentReservations }] = await Promise.all([
      supabase.from('services').select('id', { count: 'exact', head: true }).eq('professional_id', entity.id),
      supabase.from('user_follows').select('id', { count: 'exact', head: true }).eq('following_id', userId),
      supabase.from('reservations').select('id,date,start_time,status,amount').eq('professional_id', entity.id).order('created_at', { ascending: false }).limit(4),
    ])
    metrics = [{ label:'Visualizações',value:entity.views_count||0,icon:Activity },{ label:'Serviços',value:services||0,icon:BriefcaseBusiness },{ label:'Seguidores',value:followers||0,icon:UserRound },{ label:'Mensagens',value:unreadMessages||0,icon:MessageSquare,hint:'não lidas' }]
    activityTitle='Reservas recentes';activityRows=(recentReservations||[]).map((reservation:any)=>({id:reservation.id,title:`Reserva #${reservation.id.slice(0,6)}`,subtitle:`${new Date(reservation.date).toLocaleDateString('pt-PT')} · ${String(reservation.start_time).slice(0,5)}`,status:reservation.status}));primaryHref='/dashboard/servicos';primaryLabel='Gerir serviços'
  }

  if (role === 'venue_manager') {
    const [{ count: reservations }, { count: followers }, { data: recentReservations }] = await Promise.all([
      supabase.from('reservations').select('id', { count: 'exact', head: true }).eq('space_id', entity.id),
      supabase.from('user_follows').select('id', { count: 'exact', head: true }).eq('following_id', userId),
      supabase.from('reservations').select('id,date,start_time,status,amount').eq('space_id', entity.id).order('created_at', { ascending: false }).limit(4),
    ])
    metrics=[{label:'Visualizações',value:entity.views_count||0,icon:Activity},{label:'Reservas',value:reservations||0,icon:CalendarCheck},{label:'Seguidores',value:followers||0,icon:UserRound},{label:'Mensagens',value:unreadMessages||0,icon:MessageSquare,hint:'não lidas'}];activityTitle='Reservas recentes';activityRows=(recentReservations||[]).map((reservation:any)=>({id:reservation.id,title:`Reserva #${reservation.id.slice(0,6)}`,subtitle:`${new Date(reservation.date).toLocaleDateString('pt-PT')} · ${String(reservation.start_time).slice(0,5)}`,status:reservation.status}));primaryHref='/dashboard/espaco';primaryLabel='Gerir espaço'
  }

  return <DashboardPage>
    <DashboardPageHeader title={`Olá, ${displayName}`} description={role==='athlete'?'Acompanha reservas, compras, eventos e mensagens num único lugar.':'Acompanha operação, clientes e desempenho num único lugar.'} action={<Button asChild><Link href={primaryHref}>{primaryLabel}<ArrowRight className="ml-2 h-4 w-4"/></Link></Button>}/>
    {role==='athlete'&&<div className="grid grid-cols-2 gap-3 sm:grid-cols-3"><Link href="/dashboard/agenda" className="rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40"><Calendar className="h-5 w-5 text-primary"/><p className="mt-3 font-semibold">Agenda</p><p className="mt-1 text-xs text-muted-foreground">Serviços, alugueres e eventos agendados.</p></Link><Link href="/dashboard/compras" className="rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40"><ReceiptText className="h-5 w-5 text-primary"/><p className="mt-3 font-semibold">Faturação e compras</p><p className="mt-1 text-xs text-muted-foreground">Pagamentos, estados e histórico das tuas compras.</p></Link><Link href="/dashboard/mensagens" className="col-span-2 rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40 sm:col-span-1"><MessageSquare className="h-5 w-5 text-primary"/><p className="mt-3 font-semibold">Mensagens</p><p className="mt-1 text-xs text-muted-foreground">Conversas associadas às reservas ativas.</p></Link></div>}
    <DashboardStatGrid>{metrics.map(metric=><DashboardStat key={metric.label} label={metric.label} value={metric.value} hint={metric.hint} icon={<metric.icon className="h-5 w-5"/>}/>)}</DashboardStatGrid>
    {role!=='athlete'&&<DashboardSection><div className="flex items-center gap-4"><div className="rounded-xl bg-amber-500/10 p-3 text-amber-600"><Star className="h-5 w-5"/></div><div><p className="font-semibold">Reputação</p><p className="text-sm text-muted-foreground">Rating médio: {entity?.rating_avg?Number(entity.rating_avg).toFixed(1):'Sem avaliações'} · {entity?.review_count||0} avaliações</p></div></div></DashboardSection>}
    <div className="grid gap-5 lg:grid-cols-3"><DashboardSection title={activityTitle} description="Dados reais registados na plataforma." className="lg:col-span-2">{activityRows.length===0?<p className="py-8 text-center text-sm text-muted-foreground">Ainda não existem registos para apresentar.</p>:<div className="space-y-3">{activityRows.map(row=><div key={row.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 p-3"><div className="min-w-0"><p className="truncate text-sm font-medium">{row.title}</p><p className="text-xs text-muted-foreground">{row.subtitle}</p></div>{row.status&&<Badge variant="outline" className="shrink-0">{row.status}</Badge>}</div>)}</div>}</DashboardSection><DashboardSection title="Mensagens recentes" description="Últimas mensagens recebidas.">{(recentMessages||[]).length===0?<p className="py-8 text-center text-sm text-muted-foreground">Sem mensagens recebidas.</p>:<div className="space-y-3">{(recentMessages||[]).map(message=>{const sender=senderMap.get(message.sender_id) as any;return <div key={message.id} className="rounded-xl border border-border p-3"><div className="mb-1 flex items-center justify-between gap-2"><p className="truncate text-sm font-semibold">{sender?.full_name||'Utilizador'}</p>{!message.read_at&&<Badge>Novo</Badge>}</div><p className="line-clamp-2 text-xs text-muted-foreground">{message.content}</p></div>})}<Button asChild variant="outline" className="min-h-11 w-full"><Link href="/dashboard/mensagens">Abrir mensagens</Link></Button></div>}</DashboardSection></div>
  </DashboardPage>
}
