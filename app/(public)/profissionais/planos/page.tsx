'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Check, Sparkles, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'

type BillingCycle = 'monthly' | 'annual'

type Plan = {
  name: string
  monthlyPrice: number | null
  description: string
  features: string[]
  notIncluded: string[]
  cta: string
  href: string
  basePopular?: boolean
}

const plans: Plan[] = [
  {
    name: 'Grátis',
    monthlyPrice: 0,
    description: 'Perfeito para começar',
    features: [
      'Perfil profissional básico',
      'Até 5 fotos na galeria',
      'Gestão de agenda manual',
      'Notificações por email',
      'Avaliações de clientes',
    ],
    notIncluded: [
      'Destaque nas pesquisas',
      'Estatísticas avançadas',
      'Suporte prioritário',
      'API de integração',
    ],
    cta: 'Começar Grátis',
    href: '/profissionais/registar',
  },
  {
    name: 'Pro',
    monthlyPrice: 9.99,
    description: 'Para profissionais a sério',
    features: [
      'Perfil profissional completo',
      'Fotos ilimitadas na galeria',
      'Gestão de agenda automática',
      'Notificações por email e SMS',
      'Avaliações de clientes',
      'Destaque nas pesquisas',
      'Estatísticas avançadas',
      'Suporte prioritário',
    ],
    notIncluded: [
      'API de integração',
      'Remoção da marca FIND4SPORT',
    ],
    cta: 'Assinar Pro',
    href: '/profissionais/registar',
    basePopular: true,
  },
  {
    name: 'Premium',
    monthlyPrice: 19.99,
    description: 'Para profissionais de topo',
    features: [
      'Tudo do plano Pro',
      'API de integração',
      'Remoção da marca FIND4SPORT',
      'Perfil verificado com selo',
      'Prioridade máxima nas pesquisas',
      'Gestor de conta dedicado',
      'Relatórios mensais personalizados',
    ],
    notIncluded: [],
    cta: 'Assinar Premium',
    href: '/profissionais/registar',
    basePopular: false,
  },
]

const annualDiscount = 0.2

function toEuro(value: number) {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(value)
}

function getAudienceRecommendedPlan(audience: string | null): string {
  if (!audience) return 'Pro'
  if (audience === 'iniciante') return 'Grátis'
  if (audience === 'escala') return 'Premium'
  return 'Pro'
}

export default function PlanosPage() {
  const params = useSearchParams()
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(params.get('billing') === 'annual' ? 'annual' : 'monthly')
  const recommendedPlanName = getAudienceRecommendedPlan(params.get('audience'))

  const enhancedPlans = useMemo(() => {
    return plans.map((plan) => {
      const monthlyPrice = plan.monthlyPrice ?? 0
      const annualMonthlyEquivalent = monthlyPrice * (1 - annualDiscount)
      const displayMonthly = billingCycle === 'annual' ? annualMonthlyEquivalent : monthlyPrice
      const annualTotal = annualMonthlyEquivalent * 12
      const monthlyTotal = monthlyPrice * 12
      const yearlySaving = monthlyTotal - annualTotal

      return {
        ...plan,
        displayMonthly,
        annualTotal,
        yearlySaving,
        isRecommended: plan.name === recommendedPlanName,
      }
    })
  }, [billingCycle, recommendedPlanName])

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Planos e Preços</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Escolha o plano ideal para o seu negócio. Transparente, escalável e sem fidelização.
        </p>

        <div className="mx-auto mt-8 inline-flex items-center rounded-xl border border-border bg-muted/30 p-1">
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${billingCycle === 'monthly' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
          >
            Mensal
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('annual')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${billingCycle === 'annual' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
          >
            Anual
            <span className="ml-2 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold text-emerald-700">-20%</span>
          </button>
        </div>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {enhancedPlans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative flex flex-col transition-shadow hover:shadow-lg ${
              plan.basePopular || plan.isRecommended ? 'border-primary shadow-md' : ''
            }`}
          >
            <div className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-2">
              {plan.basePopular && (
                <Badge className="bg-primary text-white">Mais Popular</Badge>
              )}
              {plan.isRecommended && (
                <Badge className="bg-amber-500 text-white">
                  <Sparkles className="mr-1 h-3.5 w-3.5" /> Recomendado
                </Badge>
              )}
            </div>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-foreground">
                  {toEuro(plan.displayMonthly)}
                </span>
                {plan.monthlyPrice !== null && <span className="text-sm text-muted-foreground">/mês</span>}
                {billingCycle === 'annual' && plan.monthlyPrice !== null && plan.monthlyPrice > 0 && (
                  <p className="mt-1 text-xs text-emerald-700">
                    Cobrado anualmente: {toEuro(plan.annualTotal)}
                  </p>
                )}
                {billingCycle === 'annual' && plan.yearlySaving > 0 && (
                  <p className="mt-1 text-xs font-semibold text-emerald-700">
                    Poupa {toEuro(plan.yearlySaving)} por ano
                  </p>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              <ul className="flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    <span>{f}</span>
                  </li>
                ))}
                {plan.notIncluded.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
                    <span className="text-muted-foreground/60">{f}</span>
                  </li>
                ))}
              </ul>
              {params.get('action') === 'upgrade' && plan.monthlyPrice !== 0 ? (
                <Button
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/stripe/checkout', {
                        method: 'POST',
                        body: JSON.stringify({ tier: plan.name.toLowerCase(), priceId: 'mock_price_id' }),
                        headers: { 'Content-Type': 'application/json' }
                      })
                      const data = await res.json()
                      if (data.url) window.location.href = data.url
                    } catch (e) {
                      console.error(e)
                      alert('Erro ao processar upgrade.')
                    }
                  }}
                  className={`mt-6 w-full ${plan.basePopular ? 'bg-teal-600 hover:bg-teal-700' : ''}`}
                  variant={plan.basePopular ? 'default' : 'outline'}
                >
                  Fazer Upgrade
                </Button>
              ) : (
                <Button
                  asChild
                  className={`mt-6 w-full ${plan.basePopular ? 'bg-teal-600 hover:bg-teal-700' : ''}`}
                  variant={plan.basePopular ? 'default' : 'outline'}
                >
                  <Link href={`${plan.href}?plan=${plan.name.toLowerCase()}&billing=${billingCycle}`}>
                    {plan.cta}
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 rounded-xl bg-muted/30 p-8 text-center">
        <h2 className="text-xl font-bold text-foreground">Precisa de algo diferente?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Oferecemos planos personalizados para espaços desportivos e organizações com múltiplas equipas.
        </p>
        <Button variant="outline" asChild className="mt-4">
          <Link href="/contacto">Fale Connosco</Link>
        </Button>
      </div>
    </div>
  )
}
