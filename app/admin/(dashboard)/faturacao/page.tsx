'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DollarSign, TrendingUp, Users, AlertCircle, ArrowUpRight, ArrowDownRight, CreditCard, Activity } from 'lucide-react'
import { format } from 'date-fns'
import { pt } from 'date-fns/locale'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(amount)
}

type SubUser = {
  id: string
  full_name: string
  type: string
}

type Sub = {
  id: string
  user_id: string
  tier: string
  status: string
  created_at: string
  user: SubUser | null
}

type PlatformTx = {
  id: string
  type: string
  amount: number
  status: string
  created_at: string
  user: SubUser | null
}

export default function AdminFaturacaoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [subscriptions, setSubscriptions] = useState<Sub[]>([])
  const [transactions, setTransactions] = useState<PlatformTx[]>([])
  const [metrics, setMetrics] = useState({
    mrr: 0,
    reservationFeesTotal: 0,
    activeSubscribers: 0
  })

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      // Check admin status
      const { data: adminCheck } = await supabase.from('admins').select('id').eq('auth_user_id', user.id).maybeSingle()
      if (!adminCheck) { router.push('/dashboard'); return }

      // Fetch all subscriptions with user details
      const { data: subsData } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          user:platform_users(id, full_name, type)
        `)
        .order('created_at', { ascending: false })

      const mappedSubs = (subsData || []).map((s: any) => ({
        ...s,
        user: Array.isArray(s.user) ? s.user[0] : s.user
      })) as Sub[]
      
      setSubscriptions(mappedSubs)

      // Fetch all transactions
      const { data: txData } = await supabase
        .from('transactions')
        .select(`
          *,
          user:platform_users(id, full_name, type)
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      const mappedTxs = (txData || []).map((t: any) => ({
        ...t,
        user: Array.isArray(t.user) ? t.user[0] : t.user
      })) as PlatformTx[]

      setTransactions(mappedTxs)

      // Calculate Metrics
      // MRR: Pro (9.99), Premium (19.99)
      const activeSubs = mappedSubs.filter(s => s.status === 'active' || s.tier !== 'free')
      let mrr = 0
      activeSubs.forEach(s => {
        if (s.tier === 'pro') mrr += 9.99
        if (s.tier === 'premium') mrr += 19.99
      })

      // Reservation Fees (Mocking logic since actual fees might be calculated dynamically based on total amount)
      // Usually it's ~3.5%. So let's sum all reservation_earning transactions and extract a mock fee for display.
      // Ideally, the 'platform_fee' transactions would be stored separately.
      let feesTotal = 0
      mappedTxs.forEach(t => {
        if (t.type === 'platform_fee') feesTotal += t.amount
        // Fallback for mock if fees aren't stored separately yet: 
        if (t.type === 'reservation_earning') feesTotal += (t.amount * 0.035) 
      })

      setMetrics({
        mrr,
        reservationFeesTotal: feesTotal,
        activeSubscribers: activeSubs.length
      })

      setLoading(false)
    }
    loadData()
  }, [router])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-muted rounded"></div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="h-32 bg-muted rounded-xl"></div>
          <div className="h-32 bg-muted rounded-xl"></div>
          <div className="h-32 bg-muted rounded-xl"></div>
        </div>
        <div className="h-96 bg-muted rounded-xl"></div>
      </div>
    )
  }

  const getPlanName = (tier: string) => {
    switch(tier) {
      case 'pro': return 'Pro'
      case 'premium': return 'Premium'
      default: return 'Grátis'
    }
  }

  const getTransactionLabel = (type: string) => {
    switch(type) {
      case 'subscription_payment': return 'Pagamento de Plano'
      case 'reservation_earning': return 'Reserva Cliente'
      case 'platform_fee': return 'Taxa da Plataforma'
      case 'payout': return 'Transferência'
      default: return type
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Visão Geral Financeira</h1>
        <p className="text-muted-foreground mt-2">
          Monitorização de faturação da plataforma, subscrições e métricas de pagamento.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <TrendingUp className="mr-2 h-4 w-4 text-primary" />
              Receita Mensal Recorrente (MRR)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(metrics.mrr)}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <ArrowUpRight className="h-3 w-3 text-emerald-500 mr-1" />
              Ganhos de assinaturas Pro e Premium
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <DollarSign className="mr-2 h-4 w-4 text-emerald-500" />
              Ganhos Taxas de Reserva
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(metrics.reservationFeesTotal)}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <Activity className="h-3 w-3 text-muted-foreground mr-1" />
              Comissões retidas das reservas pagas
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Users className="mr-2 h-4 w-4 text-amber-500" />
              Subscritores Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.activeSubscribers}</div>
            <p className="text-xs text-muted-foreground mt-1">Profissionais e espaços pagantes</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Subscrições Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {subscriptions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Sem assinaturas registadas.</p>
            ) : (
              <div className="space-y-4">
                {subscriptions.slice(0, 5).map(sub => (
                  <div key={sub.id} className="flex justify-between items-center p-3 rounded-lg border border-border/50 bg-muted/20">
                    <div>
                      <p className="font-bold text-sm">{sub.user?.full_name || 'Utilizador'}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {sub.user?.type || 'Profissional'} • {format(new Date(sub.created_at), 'dd MMM yyyy', {locale: pt})}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={
                        sub.tier === 'premium' ? 'border-amber-500 text-amber-600' :
                        sub.tier === 'pro' ? 'border-primary text-primary' : ''
                      }>
                        {getPlanName(sub.tier)}
                      </Badge>
                      <Badge variant="secondary" className={
                        sub.status === 'active' ? 'bg-emerald-500/10 text-emerald-700' : ''
                      }>
                        {sub.status || 'Ativa'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button variant="outline" className="w-full mt-4">Ver Todas as Subscrições</Button>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Últimas Transações Plataforma</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Sem fluxo de transações.</p>
            ) : (
              <div className="space-y-4">
                {transactions.slice(0, 5).map(tx => (
                  <div key={tx.id} className="flex justify-between items-center p-3 rounded-lg border border-border/50 bg-muted/20">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${
                        tx.type === 'subscription_payment' ? 'bg-primary/20 text-primary' :
                        tx.type === 'platform_fee' ? 'bg-emerald-500/20 text-emerald-700' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        <CreditCard className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{getTransactionLabel(tx.type)}</p>
                        <p className="text-xs text-muted-foreground">
                          {tx.user?.full_name || 'Sistema'} • {format(new Date(tx.created_at), 'dd MMM', {locale: pt})}
                        </p>
                      </div>
                    </div>
                    <div className={`font-bold ${
                      tx.type === 'subscription_payment' || tx.type === 'platform_fee' ? 'text-emerald-600' : 'text-foreground'
                    }`}>
                      {tx.type === 'subscription_payment' || tx.type === 'platform_fee' ? '+' : ''}{formatCurrency(tx.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button variant="outline" className="w-full mt-4">Ver Histórico Completo</Button>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
