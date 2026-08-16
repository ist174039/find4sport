import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Activity, CalendarCheck, Heart, MessageSquare, Star, UserRound, BriefcaseBusiness, ArrowRight } from 'lucide-react'
import type { PlatformRole } from '@/lib/auth/roles'

type Props = {
  role: PlatformRole
  userId: string
  displayName: string
  entity?: any
}

type Metric = { label: string; value: string | number; icon: any; hint?: string }

export async function OverviewDashboard({ role, userId, displayName, entity }: Props) {
  const supabase = await createClient()

  const { count: unreadMessages } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('receiver_id', userId)
    .is('read_at', null)

  const { data: recentMessages } = await supabase
    .from('messages')
    .select('id, sender_id, content, created_at, read_at')
    .eq('receiver_id', userId)
    .order('created_at', { ascending: false })
    .limit(3)

  const senderIds = Array.from(new Set((recentMessages || []).map(m => m.sender_id)))
  const { data: senders } = senderIds.length
    ? await supabase.from('platform_users').select('id, full_name, type').in('id', senderIds)
    : { data: [] as any[] }
  const senderMap = new Map((senders || []).map(s => [s.id, s]))

  let metrics: Metric[] = []
  let activityTitle = 'Atividade recente'
  let activityRows: Array<{ id: string; title: string; subtitle: string; status?: string }> = []
  let primaryHref = '/pesquisa'
  let primaryLabel = 'Explorar plataforma'

  if (role === 'athlete') {
    const [{ count: favorites }, { count: events }, { count: following }, { data: participations }] = await Promise.all([
      supabase.from('favorites').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('event_participants').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('user_follows').select('id', { count: 'exact', head: true }).eq('follower_id', userId),
      supabase.from('event_participants').select('id, event:events(id, title, start_date, status)').eq('user_id', userId).order('created_at', { ascending: false }).limit(4),
    ])
    metrics = [
      { label: 'Favoritos', value: favorites || 0, icon: Heart },
      { label: 'Eventos', value: events || 0, icon: CalendarCheck },
      { label: 'A seguir', value: following || 0, icon: UserRound },
      { label: 'Mensagens não lidas', value: unreadMessages || 0, icon: MessageSquare },
    ]
    activityTitle = 'Os meus eventos'
    activityRows = (participations || []).flatMap((p: any) => p.event ? [{ id: p.id, title: p.event.title, subtitle: new Date(p.event.start_date).toLocaleDateString('pt-PT'), status: p.event.status }] : [])
    primaryHref = '/pesquisa'
    primaryLabel = 'Descobrir profissionais e espaços'
  }

  if (role === 'professional') {
    const [{ count: services }, { count: reservations }, { count: followers }, { data: recentReservations }] = await Promise.all([
      supabase.from('services').select('id', { count: 'exact', head: true }).eq('professional_id', entity.id),
      supabase.from('reservations').select('id', { count: 'exact', head: true }).eq('professional_id', entity.id),
      supabase.from('user_follows').select('id', { count: 'exact', head: true }).eq('following_id', userId),
      supabase.from('reservations').select('id, date, start_time, status, amount').eq('professional_id', entity.id).order('created_at', { ascending: false }).limit(4),
    ])
    metrics = [
      { label: 'Visualizações', value: entity.views_count || 0, icon: Activity },
      { label: 'Serviços', value: services || 0, icon: BriefcaseBusiness },
      { label: 'Seguidores', value: followers || 0, icon: UserRound },
      { label: 'Mensagens não lidas', value: unreadMessages || 0, icon: MessageSquare },
    ]
    activityTitle = 'Reservas recentes'
    activityRows = (recentReservations || []).map((r: any) => ({ id: r.id, title: `Reserva #${r.id.slice(0, 6)}`, subtitle: `${new Date(r.date).toLocaleDateString('pt-PT')} · ${String(r.start_time).slice(0,5)}`, status: r.status }))
    primaryHref = '/dashboard/servicos'
    primaryLabel = 'Gerir serviços'
  }

  if (role === 'venue_manager') {
    const [{ count: reservations }, { count: followers }, { data: recentReservations }] = await Promise.all([
      supabase.from('reservations').select('id', { count: 'exact', head: true }).eq('space_id', entity.id),
      supabase.from('user_follows').select('id', { count: 'exact', head: true }).eq('following_id', userId),
      supabase.from('reservations').select('id, date, start_time, status, amount').eq('space_id', entity.id).order('created_at', { ascending: false }).limit(4),
    ])
    metrics = [
      { label: 'Visualizações', value: entity.views_count || 0, icon: Activity },
      { label: 'Reservas', value: reservations || 0, icon: CalendarCheck },
      { label: 'Seguidores', value: followers || 0, icon: UserRound },
      { label: 'Mensagens não lidas', value: unreadMessages || 0, icon: MessageSquare },
    ]
    activityTitle = 'Reservas recentes'
    activityRows = (recentReservations || []).map((r: any) => ({ id: r.id, title: `Reserva #${r.id.slice(0, 6)}`, subtitle: `${new Date(r.date).toLocaleDateString('pt-PT')} · ${String(r.start_time).slice(0,5)}`, status: r.status }))
    primaryHref = '/dashboard/espaco'
    primaryLabel = 'Gerir espaço'
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Olá, {displayName}</h1>
          <p className="mt-1 text-muted-foreground">
            {role === 'athlete' ? 'Acompanhe a sua atividade na Find4Sport.' : 'Acompanhe atividade, clientes e desempenho num único lugar.'}
          </p>
        </div>
        <Link href={primaryHref}><Button>{primaryLabel}<ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(metric => <Card key={metric.label}><CardContent className="flex items-center justify-between p-5"><div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{metric.label}</p><p className="mt-1 text-3xl font-bold">{metric.value}</p></div><div className="rounded-xl bg-primary/10 p-3 text-primary"><metric.icon className="h-5 w-5" /></div></CardContent></Card>)}
      </div>

      {role !== 'athlete' && <Card><CardContent className="flex flex-wrap items-center gap-4 p-5"><div className="rounded-xl bg-amber-500/10 p-3 text-amber-600"><Star className="h-5 w-5" /></div><div><p className="font-semibold">Reputação</p><p className="text-sm text-muted-foreground">Rating médio: {entity?.rating_avg ? Number(entity.rating_avg).toFixed(1) : 'Sem avaliações'} · {entity?.review_count || 0} avaliações</p></div></CardContent></Card>}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2"><CardHeader><CardTitle>{activityTitle}</CardTitle><CardDescription>Dados reais registados na plataforma.</CardDescription></CardHeader><CardContent>{activityRows.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">Ainda não existem registos para apresentar.</p> : <div className="space-y-3">{activityRows.map(row => <div key={row.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3"><div><p className="text-sm font-medium">{row.title}</p><p className="text-xs text-muted-foreground">{row.subtitle}</p></div>{row.status && <Badge variant="outline">{row.status}</Badge>}</div>)}</div>}</CardContent></Card>

        <Card><CardHeader><CardTitle>Mensagens recentes</CardTitle><CardDescription>Últimas mensagens recebidas.</CardDescription></CardHeader><CardContent>{(recentMessages || []).length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">Sem mensagens recebidas.</p> : <div className="space-y-3">{(recentMessages || []).map(message => { const sender = senderMap.get(message.sender_id) as any; return <div key={message.id} className="rounded-xl border border-border p-3"><div className="mb-1 flex items-center justify-between gap-2"><p className="truncate text-sm font-semibold">{sender?.full_name || 'Utilizador'}</p>{!message.read_at && <Badge>Novo</Badge>}</div><p className="line-clamp-2 text-xs text-muted-foreground">{message.content}</p></div> })}<Link href="/dashboard/mensagens" className="block pt-2"><Button variant="outline" className="w-full">Abrir mensagens</Button></Link></div>}</CardContent></Card>
      </div>
    </div>
  )
}
