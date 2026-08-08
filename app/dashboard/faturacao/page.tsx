'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Wallet, CreditCard, TrendingUp, History, Sparkles, Check, ArrowRight } from 'lucide-react'
import { UserSubscription, Transaction, Reservation } from '@/lib/types'
import { format } from 'date-fns'
import { pt } from 'date-fns/locale'
import Link from 'next/link'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(amount)
}

export default function FaturacaoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [totalEarned, setTotalEarned] = useState(0)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      // Fetch subscription
      const { data: subData } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
      
      setSubscription(subData as UserSubscription || { tier: 'free', status: 'active', user_id: user.id } as UserSubscription)

      // Fetch transactions
      const { data: txData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)
      
      setTransactions(txData as Transaction[] || [])

      // Fetch reservations to calculate earnings
      // Try fetching as professional first
      const { data: prof } = await supabase.from('professionals').select('id').eq('user_id', user.id).maybeSingle()
      const { data: spaces } = await supabase.from('sport_spaces').select('id').eq('owner_user_id', user.id)

      let resQuery = supabase.from('reservations').select('id, amount, status, date, start_time')
      const orConditions: string[] = []
      if (prof) orConditions.push(`professional_id.eq.${prof.id}`)
      if (spaces && spaces.length > 0) {
        const spaceIds = spaces.map(s => s.id).join(',')
        orConditions.push(`space_id.in.(${spaceIds})`)
      }

      if (orConditions.length > 0) {
        const { data: resData } = await resQuery.or(orConditions.join(','))
        if (resData) {
          setReservations(resData as Reservation[])
          
          // Calculate only completed/paid reservations
          const earned = resData
            .filter(r => r.status === 'completed' || r.status === 'paid')
            .reduce((acc, curr) => acc + (curr.amount || 0), 0)
          
          setTotalEarned(earned)
        }
      }

      setLoading(false)
    }
    loadData()
  }, [router])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse max-w-5xl">
        <div className="h-10 w-48 bg-muted rounded"></div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="h-32 bg-muted rounded-xl"></div>
          <div className="h-32 bg-muted rounded-xl"></div>
          <div className="h-32 bg-muted rounded-xl"></div>
        </div>
        <div className="h-64 bg-muted rounded-xl"></div>
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

  const handleManageBilling = async () => {
    if (subscription?.tier === 'free') {
      router.push('/profissionais/planos?action=upgrade')
    } else {
      try {
        const res = await fetch('/api/stripe/portal', { method: 'POST' })
        const data = await res.json()
        if (data.url) {
          router.push(data.url)
        }
      } catch (err) {
        console.error('Error opening portal:', err)
        alert('Erro ao abrir o portal de faturação.')
      }
    }
  }

  const handleConnectStripe = async () => {
    try {
      const res = await fetch('/api/stripe/connect', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        router.push(data.url)
      }
    } catch (err) {
      console.error('Error starting Stripe Connect:', err)
      alert('Erro ao iniciar a configuração.')
    }
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Faturação e Planos</h1>
        <p className="text-muted-foreground mt-2">
          Gira a sua subscrição, pagamentos e ganhos de reservas.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Wallet className="mr-2 h-4 w-4 text-primary" />
              Ganhos Totais (Reservas)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totalEarned)}</div>
            <p className="text-xs text-muted-foreground mt-1">Acumulado desde o início</p>
          </CardContent>
        </Card>

        <Card className="border-border md:col-span-2 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-primary/10 to-transparent pointer-events-none"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between items-center">
              <span className="flex items-center">
                <Sparkles className="mr-2 h-4 w-4 text-amber-500" />
                Plano Atual
              </span>
              <Badge variant={subscription?.tier === 'free' ? 'outline' : 'default'} className={subscription?.tier === 'premium' ? 'bg-amber-500 text-white' : ''}>
                {getPlanName(subscription?.tier || 'free')}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xl font-bold">
                Plano {getPlanName(subscription?.tier || 'free')}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {subscription?.tier === 'free' 
                  ? 'Limites: 5 fotos, sem destaque nas pesquisas.' 
                  : `Próxima renovação: ${subscription?.current_period_end ? format(new Date(subscription.current_period_end), 'dd MMM yyyy', {locale: pt}) : 'N/A'}`}
              </p>
            </div>
            <Button onClick={handleManageBilling} variant={subscription?.tier === 'free' ? 'default' : 'outline'}>
              {subscription?.tier === 'free' ? 'Fazer Upgrade' : 'Gerir Subscrição'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-emerald-500/5 border-emerald-500/20">
        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-500/20 rounded-full text-emerald-700">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Receba pagamentos diretos das reservas</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                Configure a sua conta Stripe Connect para receber automaticamente o valor das reservas pagas pelos clientes, deduzido da taxa de serviço da FIND4SPORT.
              </p>
            </div>
          </div>
          <Button onClick={handleConnectStripe} className="bg-emerald-600 hover:bg-emerald-700 whitespace-nowrap">
            Configurar Recebimentos <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <History className="mr-2 h-5 w-5 text-muted-foreground" />
              Últimas Reservas Pagas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reservations.filter(r => r.status === 'completed' || r.status === 'paid').length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Nenhum pagamento recebido ainda.</p>
            ) : (
              <div className="space-y-4">
                {reservations
                  .filter(r => r.status === 'completed' || r.status === 'paid')
                  .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 5)
                  .map(r => (
                  <div key={r.id} className="flex justify-between items-center p-3 rounded-lg border border-border/50 bg-muted/20">
                    <div>
                      <p className="font-medium text-sm">Reserva #{r.id.substring(0,6)}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(`${r.date}T${r.start_time}`), 'dd MMM yyyy - HH:mm', {locale: pt})}</p>
                    </div>
                    <div className="font-bold text-emerald-600">
                      +{formatCurrency(r.amount || 0)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-muted-foreground" />
              Histórico de Faturação (Planos)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.filter(t => t.type === 'subscription_payment').length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Sem histórico de faturas de planos.</p>
            ) : (
              <div className="space-y-4">
                {transactions.filter(t => t.type === 'subscription_payment').map(t => (
                  <div key={t.id} className="flex justify-between items-center p-3 rounded-lg border border-border/50 bg-muted/20">
                    <div>
                      <p className="font-medium text-sm">{t.description || 'Pagamento de Subscrição'}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(t.created_at), 'dd MMM yyyy', {locale: pt})}</p>
                    </div>
                    <div className="font-bold text-foreground">
                      -{formatCurrency(t.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
