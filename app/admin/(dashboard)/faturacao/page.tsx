import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CreditCard, DollarSign, TrendingUp, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess } from '@/lib/auth/access'
import type { Tables } from '@/lib/supabase-types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DashboardEmptyState, DashboardPage, DashboardPageHeader, DashboardSection, DashboardStat, DashboardStatGrid } from '@/components/patterns/dashboard-page'

const PAGE_SIZE = 20
type SubscriptionStatus = NonNullable<Tables<'user_subscriptions'>['status']>
type SubscriptionStatusFilter = 'all' | SubscriptionStatus
const ACTIVE_SUBSCRIPTION_STATUSES: SubscriptionStatus[] = ['active', 'trialing']

function money(value: number) { return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value) }
function num(value: unknown) { const n = Number(value); return Number.isFinite(n) ? n : 0 }
function firstParam(value: string | string[] | undefined, fallback: string) { return Array.isArray(value) ? value[0] || fallback : value || fallback }
function parseSubscriptionStatus(value: string): SubscriptionStatusFilter {
  switch (value) {
    case 'active':
    case 'canceled':
    case 'past_due':
    case 'trialing':
    case 'incomplete':
    case 'incomplete_expired':
    case 'unpaid':
    case 'paused':
      return value
    default:
      return 'all'
  }
}
function pageHref(params: { subPage?: number; txPage?: number; subStatus?: string; txStatus?: string; txType?: string }) {
  const q = new URLSearchParams()
  if ((params.subPage || 1) > 1) q.set('subPage', String(params.subPage))
  if ((params.txPage || 1) > 1) q.set('txPage', String(params.txPage))
  if (params.subStatus && params.subStatus !== 'all') q.set('subStatus', params.subStatus)
  if (params.txStatus && params.txStatus !== 'all') q.set('txStatus', params.txStatus)
  if (params.txType && params.txType !== 'all') q.set('txType', params.txType)
  return `/admin/faturacao${q.toString() ? `?${q}` : ''}`
}

export default async function AdminBillingPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')
  const access = await resolveSessionAccess(supabase, user)
  if (!access?.canAccessAdmin) redirect('/admin/login?error=unauthorized')

  const params = await searchParams
  const subPage = Math.max(1, Number(firstParam(params.subPage, '1')) || 1)
  const txPage = Math.max(1, Number(firstParam(params.txPage, '1')) || 1)
  const subStatus = parseSubscriptionStatus(firstParam(params.subStatus, 'all'))
  const txStatus = firstParam(params.txStatus, 'all')
  const txType = firstParam(params.txType, 'all')
  const admin = createAdminClient()

  let subQuery = admin.from('user_subscriptions').select('id,user_id,tier,status,created_at,current_period_end,user:platform_users(id,full_name,type),plan:subscription_plans(id,name,monthly_price,audience)', { count: 'exact' }).order('created_at', { ascending: false })
  if (subStatus !== 'all') subQuery = subQuery.eq('status', subStatus)
  let txQuery = admin.from('transactions').select('*', { count: 'exact' }).order('created_at', { ascending: false })
  if (txStatus !== 'all') txQuery = txQuery.eq('status', txStatus)
  if (txType !== 'all') txQuery = txQuery.eq('type', txType)

  const [subscriptionsResult, transactionsResult, activeForMrrResult, completedTransactionsResult] = await Promise.all([
    subQuery.range((subPage - 1) * PAGE_SIZE, subPage * PAGE_SIZE - 1),
    txQuery.range((txPage - 1) * PAGE_SIZE, txPage * PAGE_SIZE - 1),
    admin.from('user_subscriptions').select('id,status,plan:subscription_plans(monthly_price)').in('status', ACTIVE_SUBSCRIPTION_STATUSES),
    admin.from('transactions').select('*').eq('status', 'completed'),
  ])

  if (subscriptionsResult.error) throw new Error(`Erro ao carregar subscrições: ${subscriptionsResult.error.message}`)
  if (transactionsResult.error) throw new Error(`Erro ao carregar transações: ${transactionsResult.error.message}`)
  if (activeForMrrResult.error) throw new Error(`Erro ao calcular MRR: ${activeForMrrResult.error.message}`)
  if (completedTransactionsResult.error) throw new Error(`Erro ao carregar transações concluídas: ${completedTransactionsResult.error.message}`)

  const subscriptions = subscriptionsResult.data || []
  const transactions = transactionsResult.data || []
  const activeSubscriptions = activeForMrrResult.data || []
  const completedTransactions = completedTransactionsResult.data || []
  const transactionUserIds = [...new Set(transactions.map(transaction => transaction.user_id).filter((id): id is string => Boolean(id)))]
  const transactionUsers = new Map<string, Pick<Tables<'platform_users'>, 'full_name' | 'type'>>()
  if (transactionUserIds.length > 0) {
    const { data: users, error: usersError } = await admin.from('platform_users').select('id,full_name,type').in('id', transactionUserIds)
    if (usersError) throw new Error(`Erro ao carregar utilizadores das transações: ${usersError.message}`)
    for (const profile of users || []) transactionUsers.set(profile.id, { full_name: profile.full_name, type: profile.type })
  }

  const mrr = activeSubscriptions.reduce((sum, sub) => sum + num(sub.plan?.monthly_price), 0)
  const marketplaceRows = completedTransactions.filter(tx => ['service_reservation_payment', 'space_reservation_payment', 'event_payment', 'service_package_payment'].includes(String(tx.type)))
  const completedVolume = completedTransactions.reduce((sum, tx) => sum + num(tx.gross_amount ?? tx.amount), 0)
  const commissions = marketplaceRows.reduce((sum, tx) => sum + num(tx.platform_commission_amount), 0)
  const stripeFees = marketplaceRows.reduce((sum, tx) => sum + num(tx.stripe_processing_fee_amount), 0)
  const platformNet = marketplaceRows.reduce((sum, tx) => sum + num(tx.platform_net_amount), 0)
  const subTotal = subscriptionsResult.count || 0
  const txTotal = transactionsResult.count || 0
  const subPages = Math.max(1, Math.ceil(subTotal / PAGE_SIZE))
  const txPages = Math.max(1, Math.ceil(txTotal / PAGE_SIZE))

  return <DashboardPage>
    <DashboardPageHeader title="Faturação" description="Subscrições e auditoria financeira do marketplace: bruto, comissão, Stripe, líquido do prestador e líquido da plataforma." />
    <DashboardStatGrid><DashboardStat label="MRR" value={money(mrr)} icon={<TrendingUp className="h-5 w-5" />} /><DashboardStat label="Volume bruto" value={money(completedVolume)} icon={<CreditCard className="h-5 w-5" />} /><DashboardStat label="Comissões marketplace" value={money(commissions)} icon={<DollarSign className="h-5 w-5" />} /><DashboardStat label="Líquido plataforma" value={money(platformNet)} icon={<TrendingUp className="h-5 w-5" />} /></DashboardStatGrid>
    {marketplaceRows.length > 0 && <DashboardSection title="Resumo marketplace" description="Valores calculados a partir das transações concluídas e da reconciliação Stripe."><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><div className="rounded-xl border p-4"><p className="text-xs text-muted-foreground">Comissão bruta</p><p className="mt-1 text-lg font-bold">{money(commissions)}</p></div><div className="rounded-xl border p-4"><p className="text-xs text-muted-foreground">Fees Stripe</p><p className="mt-1 text-lg font-bold">{money(stripeFees)}</p></div><div className="rounded-xl border p-4"><p className="text-xs text-muted-foreground">Líquido plataforma</p><p className="mt-1 text-lg font-bold">{money(platformNet)}</p></div><div className="rounded-xl border p-4"><p className="text-xs text-muted-foreground">Operações marketplace</p><p className="mt-1 text-lg font-bold">{marketplaceRows.length}</p></div></div></DashboardSection>}
    <div className="grid min-w-0 gap-6 xl:grid-cols-2">
      <DashboardSection title="Subscrições" description="Filtro de estado e paginação independente.">
        <form method="get" className="mb-4 grid gap-2 sm:grid-cols-[1fr_auto]"><input type="hidden" name="txPage" value={txPage} /><input type="hidden" name="txStatus" value={txStatus} /><input type="hidden" name="txType" value={txType} /><select name="subStatus" defaultValue={subStatus} className="min-h-11 rounded-lg border border-input bg-background px-3"><option value="all">Todos os estados</option>{['active', 'trialing', 'past_due', 'canceled', 'incomplete', 'unpaid'].map(v => <option key={v} value={v}>{v}</option>)}</select><Button type="submit" variant="outline">Filtrar</Button></form>
        {subscriptions.length === 0 ? <DashboardEmptyState icon={<Users className="h-10 w-10" />} title="Sem subscrições" description="Nenhum resultado para este filtro." /> : <div className="space-y-3">{subscriptions.map(subscription => <article key={subscription.id} className="flex min-w-0 flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="truncate text-sm font-semibold">{subscription.user?.full_name || 'Utilizador'}</p><p className="truncate text-xs text-muted-foreground">{subscription.plan?.name || subscription.tier || 'Sem plano'} · {subscription.user?.type || 'perfil'}</p></div><div className="flex flex-wrap items-center gap-2"><Badge variant="outline">{subscription.status || 'sem estado'}</Badge>{subscription.plan?.monthly_price != null && <span className="text-sm font-semibold">{money(num(subscription.plan.monthly_price))}/mês</span>}</div></article>)}</div>}
        {subTotal > 0 && <div className="mt-4 flex items-center justify-between border-t pt-3"><span className="text-xs text-muted-foreground">{subTotal} resultados</span><div className="flex items-center gap-2"><Button asChild variant="outline" size="sm" className={subPage <= 1 ? 'pointer-events-none opacity-50' : ''}><Link href={pageHref({ subPage: subPage - 1, txPage, subStatus, txStatus, txType })}>Anterior</Link></Button><span className="text-xs">{subPage}/{subPages}</span><Button asChild variant="outline" size="sm" className={subPage >= subPages ? 'pointer-events-none opacity-50' : ''}><Link href={pageHref({ subPage: subPage + 1, txPage, subStatus, txStatus, txType })}>Seguinte</Link></Button></div></div>}
      </DashboardSection>
      <DashboardSection title="Transações" description="Cada pagamento marketplace mostra a decomposição financeira quando a migration de auditoria está aplicada.">
        <form method="get" className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]"><input type="hidden" name="subPage" value={subPage} /><input type="hidden" name="subStatus" value={subStatus} /><select name="txStatus" defaultValue={txStatus} className="min-h-11 rounded-lg border border-input bg-background px-3"><option value="all">Todos os estados</option>{['completed', 'pending', 'failed'].map(v => <option key={v} value={v}>{v}</option>)}</select><select name="txType" defaultValue={txType} className="min-h-11 rounded-lg border border-input bg-background px-3"><option value="all">Todos os tipos</option>{['subscription_payment', 'service_reservation_payment', 'space_reservation_payment', 'event_payment', 'service_package_payment', 'refund'].map(v => <option key={v} value={v}>{v}</option>)}</select><Button type="submit" variant="outline">Filtrar</Button></form>
        {transactions.length === 0 ? <DashboardEmptyState icon={<CreditCard className="h-10 w-10" />} title="Sem transações" description="Nenhum movimento para estes filtros." /> : <div className="space-y-3">{transactions.map(transaction => { const hasAudit = transaction.gross_amount != null || transaction.platform_commission_amount != null; const transactionUser = transaction.user_id ? transactionUsers.get(transaction.user_id) : undefined; return <article key={transaction.id} className="min-w-0 rounded-xl border p-3"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-semibold">{transaction.type || 'Transação'}</p><p className="truncate text-xs text-muted-foreground">{transactionUser?.full_name || 'Sistema'} · {new Date(transaction.created_at).toLocaleString('pt-PT')}</p></div><div className="shrink-0 text-right"><p className="text-sm font-bold">{money(num(transaction.gross_amount ?? transaction.amount))}</p><Badge variant="outline" className="mt-1">{transaction.status || 'sem estado'}</Badge></div></div>{hasAudit && <div className="mt-3 grid grid-cols-2 gap-2 border-t pt-3 text-xs sm:grid-cols-3"><span><span className="block text-muted-foreground">Base</span><strong>{money(num(transaction.base_amount))}</strong></span><span><span className="block text-muted-foreground">Taxa cliente</span><strong>{money(num(transaction.customer_fee_amount))}</strong></span><span><span className="block text-muted-foreground">Comissão</span><strong>{money(num(transaction.platform_commission_amount))}</strong></span><span><span className="block text-muted-foreground">Stripe fee</span><strong>{money(num(transaction.stripe_processing_fee_amount))}</strong></span><span><span className="block text-muted-foreground">Líquido prestador</span><strong>{money(num(transaction.provider_net_amount))}</strong></span><span><span className="block text-muted-foreground">Líquido plataforma</span><strong>{money(num(transaction.platform_net_amount))}</strong></span></div>}</article> })}</div>}
        {txTotal > 0 && <div className="mt-4 flex items-center justify-between border-t pt-3"><span className="text-xs text-muted-foreground">{txTotal} resultados</span><div className="flex items-center gap-2"><Button asChild variant="outline" size="sm" className={txPage <= 1 ? 'pointer-events-none opacity-50' : ''}><Link href={pageHref({ subPage, txPage: txPage - 1, subStatus, txStatus, txType })}>Anterior</Link></Button><span className="text-xs">{txPage}/{txPages}</span><Button asChild variant="outline" size="sm" className={txPage >= txPages ? 'pointer-events-none opacity-50' : ''}><Link href={pageHref({ subPage, txPage: txPage + 1, subStatus, txStatus, txType })}>Seguinte</Link></Button></div></div>}
      </DashboardSection>
    </div>
  </DashboardPage>
}
