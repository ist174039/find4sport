'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Check, Sparkles, X, Zap } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'

type BillingCycle = 'monthly' | 'annual'
export type PublicPlan = { code:string; name:string; monthlyPrice:number; annualPrice:number; description:string; features:string[]; notIncluded:string[]; cta:string; href:string; basePopular:boolean }
type CheckoutPayload = { error?: string; url?: string }

export default function PlanosClient({ initialPlans, header, subheader }: { initialPlans: PublicPlan[], header: string, subheader: string }) {
  const params = useSearchParams()
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(params.get('billing') === 'annual' ? 'annual' : 'monthly')
  const recommendedPlanName = getAudienceRecommendedPlan(params.get('audience'))

  function toEuro(value: number) {
    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(value)
  }

  function getAudienceRecommendedPlan(audience: string | null): string {
    if (!audience) return 'Pro'
    if (audience === 'iniciante') return 'Grátis'
    if (audience === 'escala') return 'Premium'
    return 'Pro'
  }

  const enhancedPlans = useMemo(() => initialPlans.map((plan) => {
    const monthlyPrice = Number(plan.monthlyPrice ?? 0)
    const annualPrice = Number(plan.annualPrice ?? monthlyPrice * 12)
    const displayMonthly = billingCycle === 'annual' && annualPrice > 0 ? annualPrice / 12 : monthlyPrice
    const yearlySaving = Math.max(0, monthlyPrice * 12 - annualPrice)
    return { ...plan, displayMonthly, annualTotal: annualPrice, yearlySaving, isRecommended: plan.name === recommendedPlanName }
  }), [billingCycle, recommendedPlanName, initialPlans])

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-zinc-50 overflow-hidden pb-24">
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay"></div>
      <div className="absolute -top-[500px] left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] opacity-20 pointer-events-none"><div className="absolute inset-0 bg-gradient-to-b from-teal-500/40 via-emerald-500/10 to-transparent blur-3xl rounded-full"></div></div>
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-sm font-medium mb-6"><Zap className="w-4 h-4" /><span>Planos Flexíveis</span></div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500">{header}</h1>
          <p className="mt-6 text-xl text-zinc-400 max-w-2xl mx-auto">{subheader}</p>
          <div className="mx-auto mt-10 inline-flex items-center rounded-xl border border-white/10 bg-white/5 p-1.5 backdrop-blur-md">
            <button type="button" onClick={() => setBillingCycle('monthly')} className={`rounded-lg px-6 py-2.5 text-sm font-semibold transition-all duration-300 ${billingCycle === 'monthly' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}>Mensal</button>
            <button type="button" onClick={() => setBillingCycle('annual')} className={`flex items-center rounded-lg px-6 py-2.5 text-sm font-semibold transition-all duration-300 ${billingCycle === 'annual' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}>Anual</button>
          </div>
        </motion.div>

        <div className="mt-16 grid gap-8 md:grid-cols-3 items-center">
          {enhancedPlans.map((plan, index) => (
            <motion.div key={plan.code} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
              <Card className={`relative h-full flex flex-col transition-all duration-300 overflow-hidden ${plan.basePopular || plan.isRecommended ? 'border-emerald-500/50 shadow-2xl shadow-emerald-500/10 bg-zinc-900 md:-translate-y-4 md:scale-105' : 'border-white/10 bg-zinc-900/50 hover:bg-zinc-900 hover:border-white/20'}`}>
                {(plan.basePopular || plan.isRecommended) && <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none"></div>}
                <div className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-2 z-20">
                  {plan.basePopular && <Badge className="bg-emerald-500 text-zinc-950 font-bold border-none">Mais Popular</Badge>}
                  {plan.isRecommended && <Badge className="bg-amber-500 text-amber-950 font-bold border-none shadow-lg"><Sparkles className="mr-1 h-3.5 w-3.5" /> Recomendado</Badge>}
                </div>
                <CardHeader className="text-center relative z-10 pt-10">
                  <CardTitle className="text-2xl font-bold text-white">{plan.name}</CardTitle>
                  <CardDescription className="text-zinc-400 mt-2">{plan.description}</CardDescription>
                  <div className="mt-6 flex flex-col items-center">
                    <div className="flex items-baseline gap-1 text-white"><span className="text-5xl font-extrabold tracking-tight">{toEuro(plan.displayMonthly)}</span><span className="text-lg font-medium text-zinc-400">/mês</span></div>
                    <div className="h-10 mt-2 flex flex-col justify-center">
                      {billingCycle === 'annual' && plan.annualTotal > 0 && <p className="text-sm text-emerald-400">Cobrado anualmente: {toEuro(plan.annualTotal)}</p>}
                      {billingCycle === 'annual' && plan.yearlySaving > 0 && <p className="text-xs font-semibold text-emerald-500/80 mt-1">Poupa {toEuro(plan.yearlySaving)} por ano</p>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col relative z-10">
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8"></div>
                  <ul className="flex-1 space-y-4">
                    {plan.features.map((feature) => <li key={feature} className="flex items-start gap-3 text-sm"><div className="mt-0.5 rounded-full bg-emerald-500/20 p-0.5 shrink-0"><Check className="h-3 w-3 text-emerald-400" /></div><span className="text-zinc-300">{feature}</span></li>)}
                    {plan.notIncluded.map((feature) => <li key={feature} className="flex items-start gap-3 text-sm text-zinc-500"><X className="mt-0.5 h-4 w-4 shrink-0 text-zinc-600" /><span className="opacity-80">{feature}</span></li>)}
                  </ul>

                  {params.get('action') === 'upgrade' && plan.code !== 'free' ? (
                    <Button onClick={async () => {
                      try {
                        const res = await fetch('/api/stripe/checkout', { method: 'POST', body: JSON.stringify({ planCode: plan.code, billingCycle }), headers: { 'Content-Type': 'application/json' } })
                        const data = await res.json().catch(() => ({})) as CheckoutPayload
                        if (!res.ok) throw new Error(data.error || 'Erro ao iniciar checkout')
                        if (data.url) window.location.href = data.url
                      } catch (error) {
                        alert(error instanceof Error ? error.message : 'Erro ao processar upgrade.')
                      }
                    }} className={`mt-10 w-full h-12 rounded-xl text-base font-semibold transition-all ${plan.basePopular ? 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-white/10 text-white hover:bg-white/20 border-0'}`} variant={plan.basePopular ? 'default' : 'outline'}>Fazer Upgrade</Button>
                  ) : (
                    <Button asChild className={`mt-10 w-full h-12 rounded-xl text-base font-semibold transition-all ${plan.basePopular ? 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-white/10 text-white hover:bg-white/20 border-0'}`} variant={plan.basePopular ? 'default' : 'outline'}><Link href={`${plan.href}?plan=${plan.code}&billing=${billingCycle}`}>{plan.cta}</Link></Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-20 rounded-3xl bg-gradient-to-r from-zinc-900 to-zinc-900/50 border border-white/10 p-10 text-center relative overflow-hidden">
          <div className="relative z-10"><h2 className="text-2xl font-bold text-white">Precisa de algo à sua medida?</h2><p className="mt-3 text-zinc-400 max-w-2xl mx-auto">Oferecemos planos personalizados para grandes espaços desportivos, ginásios ou organizações com múltiplas infraestruturas.</p><Button className="mt-6 h-12 px-8 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 font-semibold" asChild><Link href="/contacto">Falar com a Equipa</Link></Button></div>
        </motion.div>
      </div>
    </div>
  )
}
