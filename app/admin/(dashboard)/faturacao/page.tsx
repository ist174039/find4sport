import { redirect } from 'next/navigation'
import { CreditCard, DollarSign, TrendingUp, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess } from '@/lib/auth/access'
import { Badge } from '@/components/ui/badge'
import { DashboardEmptyState, DashboardPage, DashboardPageHeader, DashboardSection, DashboardStat, DashboardStatGrid } from '@/components/patterns/dashboard-page'

function money(value: number) {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value)
}

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(['active', 'trialing'])

export default async function AdminBillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')
  const access = await resolveSessionAccess(supabase, user)
  if (!access?.canAccessAdmin) redirect('/admin/login?error=unauthorized')

  const admin = createAdminClient()
  const [subscriptionsResult, transactionsResult] = await Promise.all([
    admin.from('user_subscriptions').select('id, user_id, tier, status, created_at, current_period_end, user:platform_users(id, full_name, type), plan:subscription_plans(id, name, price_monthly, audience)').order('created_at', { ascending: false }),
    admin.from('transactions').select('id, user_id, type, amount, status, created_at, stripe_invoice_id, user:platform_users(id, full_name, type)').order('created_at', { ascending: false }).limit(100),
  ])

  const subscriptions = subscriptionsResult.data || []
  const transactions = transactionsResult.data || []
  const activeSubscriptions = subscriptions.filter((subscription: any) => ACTIVE_SUBSCRIPTION_STATUSES.has(subscription.status))
  const mrr = activeSubscriptions.reduce((sum: number, subscription: any) => sum + Number(subscription.plan?.price_monthly || 0), 0)
  const platformFees = transactions.filter((transaction: any) => transaction.type === 'platform_fee' && transaction.status === 'completed').reduce((sum: number, transaction: any) => sum + Number(transaction.amount || 0), 0)
  const completedVolume = transactions.filter((transaction: any) => transaction.status === 'completed').reduce((sum: number, transaction: any) => sum + Number(transaction.amount || 0), 0)

  return (
    <DashboardPage>
      <DashboardPageHeader title="Faturação" description="Métricas construídas exclusivamente a partir de subscrições, planos e transações persistidas." />

      <DashboardStatGrid>
        <DashboardStat label="MRR" value={money(mrr)} icon={<TrendingUp className="h-5 w-5" />} />
        <DashboardStat label="Comissões registadas" value={money(platformFees)} icon={<DollarSign className="h-5 w-5" />} />
        <DashboardStat label="Subscrições ativas" value={activeSubscriptions.length} icon={<Users className="h-5 w-5" />} />
        <DashboardStat label="Volume registado" value={money(completedVolume)} icon={<CreditCard className="h-5 w-5" />} />
      </DashboardStatGrid>

      <div className="grid gap-6 xl:grid-cols-2">
        <DashboardSection title="Subscrições" description="Estado atual por utilizador e respetivo plano configurado.">
          {subscriptions.length === 0 ? <DashboardEmptyState icon={<Users className="h-10 w-10" />} title="Sem subscrições" description="Ainda não existem subscrições registadas." /> : <div className="space-y-3">{subscriptions.slice(0, 20).map((subscription: any) => <article key={subscription.id} className="flex flex-col gap-3 rounded-xl border border-border p-3 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="truncate text-sm font-semibold">{subscription.user?.full_name || 'Utilizador'}</p><p className="text-xs text-muted-foreground">{subscription.plan?.name || subscription.tier || 'Sem plano'} · {subscription.user?.type || 'perfil'}</p></div><div className="flex flex-wrap items-center gap-2"><Badge variant="outline">{subscription.status || 'sem estado'}</Badge>{subscription.plan?.price_monthly != null && <span className="text-sm font-semibold">{money(Number(subscription.plan.price_monthly))}/mês</span>}</div></article>)}</div>}
        </DashboardSection>

        <DashboardSection title="Transações" description="Últimos movimentos persistidos; não são inferidos nem simulados.">
          {transactions.length === 0 ? <DashboardEmptyState icon={<CreditCard className="h-10 w-10" />} title="Sem transações" description="Os movimentos financeiros aparecerão aqui quando forem registados pelos webhooks/fluxos de pagamento." /> : <div className="space-y-3">{transactions.slice(0, 20).map((transaction: any) => <article key={transaction.id} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3"><div className="min-w-0"><p className="truncate text-sm font-semibold">{transaction.type || 'Transação'}</p><p className="text-xs text-muted-foreground">{transaction.user?.full_name || 'Sistema'} · {new Date(transaction.created_at).toLocaleString('pt-PT')}</p></div><div className="text-right"><p className="text-sm font-bold">{money(Number(transaction.amount || 0))}</p><Badge variant="outline" className="mt-1">{transaction.status || 'sem estado'}</Badge></div></article>)}</div>}
        </DashboardSection>
      </div>
    </DashboardPage>
  )
}
