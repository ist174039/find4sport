import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess } from '@/lib/auth/access'
import { isProviderRole } from '@/lib/auth/roles'

const deliveryLabel: Record<string,string> = {
  scheduled: 'Agendado',
  awaiting_customer_confirmation: 'A aguardar atleta',
  completed: 'Confirmado',
  disputed: 'Em contestação',
  cancelled: 'Cancelado',
}
const settlementLabel: Record<string,string> = {
  not_applicable: 'Sem transferência',
  held: 'Valor retido',
  eligible: 'Transferência pendente',
  transferred: 'Transferido',
  blocked: 'Bloqueado',
  refunded: 'Reembolsado',
}

export default async function EntregasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/dashboard/entregas')
  const access = await resolveSessionAccess(supabase, user)
  if (!access || !isProviderRole(access.role)) redirect('/dashboard/confirmacoes')

  const db = createAdminClient() as any
  let query = db.from('reservations').select('id,date,start_time,end_time,amount,status,payment_status,service_delivery_status,settlement_status,provider_marked_completed_at,athlete_confirmed_at,auto_confirm_after,dispute_reason,service:services(name),room:space_rooms(name),user:platform_users(id,full_name)').order('date',{ascending:false}).order('start_time',{ascending:false}).limit(100)
  if (access.role === 'professional') {
    const { data: professional } = await db.from('professionals').select('id').eq('user_id', user.id).maybeSingle()
    if (!professional) redirect('/dashboard')
    query = query.eq('professional_id', professional.id)
  } else {
    const { data: spaces } = await db.from('sport_spaces').select('id').eq('owner_user_id', user.id)
    const ids = (spaces || []).map((space: { id:string }) => space.id)
    if (!ids.length) redirect('/dashboard')
    query = query.in('space_id', ids)
  }
  const { data, error } = await query
  if (error) throw new Error(`Não foi possível carregar o estado das entregas: ${error.message}`)

  const rows = data || []
  const awaiting = rows.filter((row:any) => row.service_delivery_status === 'awaiting_customer_confirmation').length
  const disputed = rows.filter((row:any) => row.service_delivery_status === 'disputed').length
  const transferred = rows.filter((row:any) => row.settlement_status === 'transferred').length

  return <div className="space-y-5">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div><h1 className="text-3xl font-bold">Entregas e pagamentos</h1><p className="mt-1 text-sm text-muted-foreground">Acompanha a confirmação do atleta e a libertação financeira de cada reserva.</p></div>
      <Button asChild variant="outline"><Link href="/dashboard/reservas">Gerir reservas</Link></Button>
    </div>
    <div className="grid grid-cols-3 gap-3"><div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">A aguardar atleta</p><p className="mt-1 text-2xl font-bold">{awaiting}</p></div><div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">Contestadas</p><p className="mt-1 text-2xl font-bold">{disputed}</p></div><div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">Transferidas</p><p className="mt-1 text-2xl font-bold">{transferred}</p></div></div>
    {!rows.length ? <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">Ainda não existem reservas para acompanhar.</div> : <div className="space-y-3">{rows.map((row:any) => <article key={row.id} className="rounded-2xl border bg-card p-4 sm:p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><h2 className="font-bold">{row.service?.name || row.room?.name || 'Reserva'}</h2><p className="mt-1 text-sm text-muted-foreground">{row.user?.full_name || 'Atleta'} · {new Date(`${row.date}T12:00:00`).toLocaleDateString('pt-PT')} · {String(row.start_time).slice(0,5)}–{String(row.end_time).slice(0,5)}</p></div><strong>{Number(row.amount || 0).toFixed(2)} €</strong></div><div className="mt-3 flex flex-wrap gap-2"><Badge variant="outline">{deliveryLabel[row.service_delivery_status] || row.service_delivery_status}</Badge><Badge variant={row.settlement_status === 'blocked' ? 'destructive' : row.settlement_status === 'transferred' ? 'success' : 'secondary'}>{settlementLabel[row.settlement_status] || row.settlement_status}</Badge></div>{row.service_delivery_status === 'awaiting_customer_confirmation' && row.auto_confirm_after && <p className="mt-3 text-xs text-muted-foreground">Auto-confirmação elegível a partir de {new Date(row.auto_confirm_after).toLocaleString('pt-PT')} se não houver contestação.</p>}{row.service_delivery_status === 'disputed' && <div className="mt-3 rounded-xl border border-destructive/30 bg-destructive/5 p-3"><p className="text-sm font-semibold text-destructive">Pagamento bloqueado para revisão administrativa</p><p className="mt-1 text-sm">{row.dispute_reason || 'O atleta reportou um problema.'}</p></div>}</article>)}</div>}
  </div>
}
