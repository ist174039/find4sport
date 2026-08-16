'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Wallet, CreditCard, TrendingUp, History, Sparkles, Check, ArrowRight, Crown } from 'lucide-react'
import { format } from 'date-fns'
import { pt } from 'date-fns/locale'
import { useModal } from '@/components/providers/modal-provider'

type Plan = {
  id: string
  code: 'free' | 'pro' | 'premium'
  name: string
  description: string | null
  monthly_price: number
  annual_price: number
  commission_rate: number
  customer_service_fee_rate: number
  audience: 'professional' | 'venue_manager'
  is_active: boolean
  is_public: boolean
  entitlements?: Array<{
    feature_key: string
    value_type: string
    boolean_value: boolean | null
    integer_value: number | null
    decimal_value: number | null
    text_value: string | null
    is_unlimited: boolean
  }>
}

type Subscription = {
  tier: 'free' | 'pro' | 'premium'
  status: string
  plan_id?: string | null
  current_period_end?: string | null
  cancel_at_period_end?: boolean
  stripe_customer_id?: string | null
}

function money(amount: number) {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(amount)
}

function featureLabel(key: string) {
  const labels: Record<string, string> = {
    'profile.photos.max': 'Fotos no perfil',
    'services.max': 'Serviços publicados',
    'communities.create.enabled': 'Criar comunidades',
    'feed.video.enabled': 'Vídeo no feed',
    'chat.enabled': 'Chat',
    'analytics.advanced': 'Analytics avançado',
    'featured_profile': 'Perfil destacado',
    'priority_search': 'Prioridade na pesquisa',
  }
  return labels[key] || key
}

function entitlementValue(item: NonNullable<Plan['entitlements']>[number]) {
  if (item.value_type === 'boolean') return item.boolean_value ? 'Incluído' : 'Não incluído'
  if (item.is_unlimited) return 'Ilimitado'
  if (item.value_type === 'integer') return String(item.integer_value ?? 0)
  if (item.value_type === 'decimal') return String(item.decimal_value ?? 0)
  return item.text_value || '—'
}

export default function FaturacaoPage() {
  const router = useRouter()
  const { showAlert } = useModal()
  const [loading, setLoading] = useState(true)
  const [changingPlan, setChangingPlan] = useState<string | null>(null)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const [subscription, setSubscription] = useState<Subscription>({ tier: 'free', status: 'active' })
  const [plans, setPlans] = useState<Plan[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [reservations, setReservations] = useState<any[]>([])
  const [totalEarned, setTotalEarned] = useState(0)
  const [audience, setAudience] = useState<'professional' | 'venue_manager' | null>(null)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: platformUser } = await supabase.from('platform_users').select('type').eq('id', user.id).maybeSingle()
      const userAudience = platformUser?.type === 'professional' || platformUser?.type === 'venue_manager' ? platformUser.type : null
      setAudience(userAudience)

      const [{ data: subData }, { data: txData }] = await Promise.all([
        supabase.from('user_subscriptions').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
      ])
      setSubscription((subData as Subscription) || { tier: 'free', status: 'active' })
      setTransactions(txData || [])

      if (userAudience) {
        const { data: planData, error: planError } = await supabase
          .from('subscription_plans')
          .select('*, entitlements:plan_entitlements(*)')
          .eq('audience', userAudience)
          .eq('is_active', true)
          .eq('is_public', true)
          .order('sort_order', { ascending: true })
        if (planError) showAlert('Erro ao carregar planos', planError.message, 'error')
        setPlans((planData || []) as Plan[])
      }

      const [{ data: prof }, { data: spaces }] = await Promise.all([
        supabase.from('professionals').select('id').eq('user_id', user.id).maybeSingle(),
        supabase.from('sport_spaces').select('id').eq('owner_user_id', user.id),
      ])
      const orConditions: string[] = []
      if (prof) orConditions.push(`professional_id.eq.${prof.id}`)
      if (spaces?.length) orConditions.push(`space_id.in.(${spaces.map(s => s.id).join(',')})`)
      if (orConditions.length) {
        const { data: resData } = await supabase.from('reservations').select('id, amount, status, date, start_time').or(orConditions.join(','))
        const rows = resData || []
        setReservations(rows)
        setTotalEarned(rows.filter(r => ['completed', 'paid'].includes(r.status)).reduce((sum, r) => sum + Number(r.amount || 0), 0))
      }
      setLoading(false)
    }
    loadData()
  }, [router, showAlert])

  const currentPlan = useMemo(() => plans.find(p => p.id === subscription.plan_id) || plans.find(p => p.code === subscription.tier), [plans, subscription])
  const paidReservations = reservations.filter(r => ['completed', 'paid'].includes(r.status))

  async function checkout(plan: Plan) {
    if (plan.code === 'free') return
    setChangingPlan(plan.id)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ planCode: plan.code, billingCycle }),
      })
      const data = await response.json()
      if (!response.ok || !data.url) throw new Error(data.error || 'Não foi possível iniciar o checkout')
      window.location.assign(data.url)
    } catch (error) {
      showAlert('Não foi possível alterar o plano', error instanceof Error ? error.message : 'Erro inesperado', 'error')
    } finally { setChangingPlan(null) }
  }

  async function manageBilling() {
    if (subscription.tier === 'free') return
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (!res.ok || !data.url) throw new Error(data.error || 'Portal indisponível')
      window.location.assign(data.url)
    } catch (error) {
      showAlert('Erro de faturação', error instanceof Error ? error.message : 'Não foi possível abrir o portal.', 'error')
    }
  }

  async function connectStripe() {
    try {
      const res = await fetch('/api/stripe/connect', { method: 'POST' })
      const data = await res.json()
      if (!res.ok || !data.url) throw new Error(data.error || 'Configuração indisponível')
      window.location.assign(data.url)
    } catch (error) {
      showAlert('Stripe Connect', error instanceof Error ? error.message : 'Não foi possível iniciar a configuração.', 'error')
    }
  }

  if (loading) return <div className="space-y-6 animate-pulse"><div className="h-10 w-56 rounded bg-muted" /><div className="grid gap-6 md:grid-cols-3"><div className="h-32 rounded-xl bg-muted" /><div className="h-32 rounded-xl bg-muted md:col-span-2" /></div><div className="h-72 rounded-xl bg-muted" /></div>

  if (!audience) return <Card><CardHeader><CardTitle>Faturação</CardTitle><CardDescription>Os planos comerciais estão disponíveis para profissionais e gestores de espaço.</CardDescription></CardHeader></Card>

  return <div className="space-y-8">
    <div><h1 className="text-3xl font-bold tracking-tight">Faturação e Planos</h1><p className="mt-2 text-muted-foreground">Consulte o seu plano, altere a subscrição e acompanhe recebimentos.</p></div>

    <div className="grid gap-6 md:grid-cols-3">
      <Card><CardHeader className="pb-2"><CardTitle className="flex items-center text-sm font-medium text-muted-foreground"><Wallet className="mr-2 h-4 w-4 text-primary" />Ganhos de reservas</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{money(totalEarned)}</div><p className="mt-1 text-xs text-muted-foreground">Reservas pagas/concluídas</p></CardContent></Card>
      <Card className="relative overflow-hidden md:col-span-2"><div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-primary/10 to-transparent" /><CardHeader className="pb-2"><CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground"><span className="flex items-center"><Crown className="mr-2 h-4 w-4 text-primary" />Plano atual</span><Badge>{currentPlan?.name || 'Grátis'}</Badge></CardTitle></CardHeader><CardContent className="relative flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><div className="text-xl font-bold">{currentPlan?.name || 'Plano Grátis'}</div><p className="mt-1 text-sm text-muted-foreground">Comissão: {currentPlan?.commission_rate ?? 0}%{subscription.current_period_end ? ` · período até ${format(new Date(subscription.current_period_end), 'dd MMM yyyy', { locale: pt })}` : ''}{subscription.cancel_at_period_end ? ' · cancelamento agendado' : ''}</p></div>{subscription.tier !== 'free' && <Button variant="outline" onClick={manageBilling}>Gerir subscrição</Button>}</CardContent></Card>
    </div>

    <Card><CardHeader><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><CardTitle>Escolher plano</CardTitle><CardDescription>Os valores e benefícios abaixo vêm diretamente da configuração administrada.</CardDescription></div><div className="flex rounded-lg border p-1"><Button size="sm" variant={billingCycle === 'monthly' ? 'default' : 'ghost'} onClick={() => setBillingCycle('monthly')}>Mensal</Button><Button size="sm" variant={billingCycle === 'annual' ? 'default' : 'ghost'} onClick={() => setBillingCycle('annual')}>Anual</Button></div></div></CardHeader><CardContent><div className="grid gap-4 md:grid-cols-3">{plans.map(plan => {
      const selected = currentPlan?.id === plan.id || (!currentPlan && subscription.tier === plan.code)
      const price = billingCycle === 'annual' ? Number(plan.annual_price) : Number(plan.monthly_price)
      const highlights = (plan.entitlements || []).filter(e => ['profile.photos.max','services.max','communities.create.enabled','feed.video.enabled','chat.enabled','analytics.advanced'].includes(e.feature_key)).slice(0, 5)
      return <Card key={plan.id} className={selected ? 'border-primary ring-1 ring-primary/30' : ''}><CardHeader><div className="flex items-center justify-between"><CardTitle>{plan.name}</CardTitle>{selected && <Badge variant="outline">Atual</Badge>}</div><CardDescription>{plan.description}</CardDescription><div className="pt-2 text-3xl font-bold">{money(price)}<span className="text-sm font-normal text-muted-foreground">/{billingCycle === 'annual' ? 'ano' : 'mês'}</span></div><p className="text-xs text-muted-foreground">Comissão por transação: {plan.commission_rate}%</p></CardHeader><CardContent className="space-y-4"><div className="space-y-2">{highlights.map(item => <div key={item.feature_key} className="flex items-center justify-between gap-3 text-sm"><span className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />{featureLabel(item.feature_key)}</span><span className="font-medium">{entitlementValue(item)}</span></div>)}</div><Button className="w-full" disabled={selected || plan.code === 'free' || changingPlan === plan.id} variant={selected ? 'outline' : 'default'} onClick={() => checkout(plan)}>{selected ? 'Plano atual' : plan.code === 'free' ? 'Grátis' : changingPlan === plan.id ? 'A abrir checkout…' : `Mudar para ${plan.name}`}</Button></CardContent></Card>
    })}</div></CardContent></Card>

    <Card className="border-primary/20 bg-primary/5"><CardContent className="flex flex-col items-center justify-between gap-4 p-6 md:flex-row"><div className="flex items-start gap-4"><div className="rounded-full bg-primary/10 p-3 text-primary"><CreditCard className="h-6 w-6" /></div><div><h3 className="font-bold">Conta de recebimentos Stripe Connect</h3><p className="mt-1 max-w-xl text-sm text-muted-foreground">Configure a conta que receberá os montantes libertados pela Find4Sport depois de o serviço/reserva cumprir as condições de pagamento.</p></div></div><Button onClick={connectStripe} className="whitespace-nowrap">Configurar recebimentos <ArrowRight className="ml-2 h-4 w-4" /></Button></CardContent></Card>

    <div className="grid gap-6 md:grid-cols-2">
      <Card><CardHeader><CardTitle className="flex items-center text-lg"><History className="mr-2 h-5 w-5 text-muted-foreground" />Últimas reservas pagas</CardTitle></CardHeader><CardContent>{paidReservations.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">Nenhum pagamento recebido ainda.</p> : <div className="space-y-3">{paidReservations.sort((a,b) => new Date(b.date).getTime()-new Date(a.date).getTime()).slice(0,5).map(r => <div key={r.id} className="flex items-center justify-between rounded-lg border bg-muted/20 p-3"><div><p className="text-sm font-medium">Reserva #{r.id.substring(0,6)}</p><p className="text-xs text-muted-foreground">{format(new Date(`${r.date}T${r.start_time}`), 'dd MMM yyyy - HH:mm', { locale: pt })}</p></div><div className="font-bold text-emerald-600">+{money(Number(r.amount || 0))}</div></div>)}</div>}</CardContent></Card>
      <Card><CardHeader><CardTitle className="flex items-center text-lg"><TrendingUp className="mr-2 h-5 w-5 text-muted-foreground" />Histórico de faturação</CardTitle></CardHeader><CardContent>{transactions.filter(t => t.type === 'subscription_payment').length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">Sem pagamentos de subscrição registados.</p> : <div className="space-y-3">{transactions.filter(t => t.type === 'subscription_payment').map(t => <div key={t.id} className="flex items-center justify-between rounded-lg border bg-muted/20 p-3"><div><p className="text-sm font-medium">{t.description || 'Pagamento de subscrição'}</p><p className="text-xs text-muted-foreground">{format(new Date(t.created_at), 'dd MMM yyyy', { locale: pt })}</p></div><div className="font-bold">-{money(Number(t.amount))}</div></div>)}</div>}</CardContent></Card>
    </div>
  </div>
}
