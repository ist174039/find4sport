'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Check, ChevronRight, CreditCard, Crown, History, Loader2, Sparkles, Wallet } from 'lucide-react'
import { useModal } from '@/components/providers/modal-provider'

type Plan = { id:string; code:'free'|'pro'|'premium'; name:string; description:string|null; monthly_price:number; annual_price:number; commission_rate:number; customer_service_fee_rate:number; audience:'professional'|'venue_manager'; entitlements?: any[] }
type Subscription = { tier:'free'|'pro'|'premium'; status:string; plan_id?:string|null; current_period_end?:string|null; cancel_at_period_end?:boolean; stripe_customer_id?:string|null }

const labels: Record<string,string> = {
  'profile.photos.max':'Fotografias no perfil',
  'posts.monthly.max':'Publicações por mês',
  'posts.images_per_post.max':'Imagens por publicação',
  'chat.enabled':'Chat',
  'chat.new_conversations_daily.max':'Novas conversas por dia',
  'chat.messages_daily.max':'Mensagens por dia',
  'chat.attachments.enabled':'Anexos no chat',
  'communities.create.enabled':'Criar comunidades',
  'communities.max':'Comunidades',
  'communities.members.max':'Membros por comunidade',
  'feed.create.enabled':'Publicar no feed',
  'feed.posts_daily.max':'Publicações por dia',
  'feed.video.enabled':'Vídeo no feed',
  'services.max':'Serviços ativos',
  'events.create.enabled':'Criar eventos',
  'analytics.advanced.enabled':'Analytics avançado',
  'profile.featured.enabled':'Perfil em destaque',
  'search.priority':'Prioridade na pesquisa',
}

function money(v:number){return new Intl.NumberFormat('pt-PT',{style:'currency',currency:'EUR'}).format(Number(v||0))}
function featureValue(e:any){if(e.is_unlimited)return 'Ilimitado'; if(e.value_type==='boolean')return e.boolean_value?'Incluído':'—'; if(e.value_type==='integer')return String(e.integer_value??0); if(e.value_type==='decimal')return String(e.decimal_value??0); if(e.value_type==='text'){if(e.text_value==='highest')return 'Máxima'; if(e.text_value==='high')return 'Alta'; if(e.text_value==='normal')return 'Normal'; return e.text_value||'—'} return '—'}

export default function FaturacaoPage(){
  const router=useRouter(); const {showAlert}=useModal()
  const [loading,setLoading]=useState(true); const [changing,setChanging]=useState<string|null>(null); const [cycle,setCycle]=useState<'monthly'|'annual'>('monthly')
  const [subscription,setSubscription]=useState<Subscription>({tier:'free',status:'active'}); const [plans,setPlans]=useState<Plan[]>([]); const [transactions,setTransactions]=useState<any[]>([]); const [reservations,setReservations]=useState<any[]>([]); const [audience,setAudience]=useState<string|null>(null)

  useEffect(()=>{void (async()=>{
    try{
      const supabase=createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user){router.push('/auth/login');return}
      const {data:profile}=await supabase.from('platform_users').select('type').eq('id',user.id).maybeSingle(); const role=['professional','venue_manager'].includes(profile?.type)?profile!.type:null; setAudience(role)
      const [{data:sub},{data:tx},{data:prof},{data:spaces}]=await Promise.all([
        supabase.from('user_subscriptions').select('*').eq('user_id',user.id).maybeSingle(),
        supabase.from('transactions').select('*').eq('user_id',user.id).order('created_at',{ascending:false}).limit(20),
        supabase.from('professionals').select('id').eq('user_id',user.id).maybeSingle(),
        supabase.from('sport_spaces').select('id').eq('owner_user_id',user.id),
      ])
      setSubscription((sub as Subscription)||{tier:'free',status:'active'}); setTransactions(tx||[])
      if(role){const {data,error}=await supabase.from('subscription_plans').select('*,entitlements:plan_entitlements(*)').eq('audience',role).eq('is_active',true).eq('is_public',true).order('sort_order'); if(error)throw error; setPlans((data||[]) as Plan[])}
      const ors:string[]=[]; if(prof?.id)ors.push(`professional_id.eq.${prof.id}`); if(spaces?.length)ors.push(`space_id.in.(${spaces.map((s:any)=>s.id).join(',')})`); if(ors.length){const {data}=await supabase.from('reservations').select('id,amount,status,date,start_time').or(ors.join(',')).order('date',{ascending:false}).limit(20); setReservations(data||[])}
    }catch(e:any){showAlert('Faturação',e?.message||'Não foi possível carregar a faturação.','error')}finally{setLoading(false)}
  })()},[router,showAlert])

  const current=useMemo(()=>plans.find(p=>p.id===subscription.plan_id)||plans.find(p=>p.code===subscription.tier),[plans,subscription])
  const earned=reservations.filter(r=>['paid','completed'].includes(r.status)).reduce((s,r)=>s+Number(r.amount||0),0)

  async function checkout(plan:Plan){if(plan.code==='free'||plan.id===current?.id)return; setChanging(plan.id); try{const res=await fetch('/api/stripe/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({planCode:plan.code,billingCycle:cycle})}); const data=await res.json(); if(!res.ok||!data.url)throw new Error(data.error||'Checkout indisponível'); window.location.assign(data.url)}catch(e:any){showAlert('Não foi possível alterar o plano',e?.message||'Erro inesperado','error');setChanging(null)}}
  async function connect(){try{const res=await fetch('/api/stripe/connect',{method:'POST'}); const data=await res.json(); if(!res.ok||!data.url)throw new Error(data.error||'Stripe Connect indisponível'); window.location.assign(data.url)}catch(e:any){showAlert('Stripe Connect',e?.message||'Não foi possível configurar recebimentos.','error')}}
  async function portal(){try{const res=await fetch('/api/stripe/portal',{method:'POST'}); const data=await res.json(); if(!res.ok||!data.url)throw new Error(data.error||'Portal indisponível'); window.location.assign(data.url)}catch(e:any){showAlert('Faturação',e?.message||'Não foi possível abrir o portal.','error')}}

  if(loading)return <div className="flex min-h-72 items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-primary"/></div>
  if(!audience)return <Card><CardContent className="p-8 text-center"><h1 className="text-xl font-bold">Planos comerciais</h1><p className="mt-2 text-sm text-muted-foreground">Disponíveis para profissionais e gestores de espaço.</p></CardContent></Card>

  return <div className="space-y-8 pb-8">
    <section className="overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-5 sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"><div className="max-w-2xl"><Badge variant="outline" className="mb-3 bg-background/70"><Sparkles className="mr-1 h-3.5 w-3.5"/>Planos FIND4SPORT</Badge><h1 className="text-2xl font-bold tracking-tight sm:text-4xl">Escolhe o nível certo para o teu negócio</h1><p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">Compara limites, ferramentas e comissão. Os benefícios são carregados diretamente da configuração do Admin.</p></div><div className="inline-flex w-full rounded-2xl border border-border bg-background p-1 sm:w-auto"><button onClick={()=>setCycle('monthly')} className={`min-h-11 flex-1 rounded-xl px-5 text-sm font-semibold sm:flex-none ${cycle==='monthly'?'bg-primary text-primary-foreground':'text-muted-foreground'}`}>Mensal</button><button onClick={()=>setCycle('annual')} className={`min-h-11 flex-1 rounded-xl px-5 text-sm font-semibold sm:flex-none ${cycle==='annual'?'bg-primary text-primary-foreground':'text-muted-foreground'}`}>Anual</button></div></div>
    </section>

    <section className="grid gap-4 sm:grid-cols-2"><div className="rounded-2xl border border-border bg-card p-5"><p className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><Crown className="h-4 w-4 text-primary"/>Plano atual</p><div className="mt-3 flex items-end justify-between gap-3"><div><p className="text-2xl font-bold">{current?.name||'Grátis'}</p><p className="mt-1 text-sm text-muted-foreground">Comissão {current?.commission_rate??0}% · estado {subscription.status}</p></div>{subscription.tier!=='free'&&<Button variant="outline" onClick={portal}>Gerir</Button>}</div></div><div className="rounded-2xl border border-border bg-card p-5"><p className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><Wallet className="h-4 w-4 text-primary"/>Recebido em reservas</p><p className="mt-3 text-2xl font-bold">{money(earned)}</p><p className="mt-1 text-sm text-muted-foreground">Total de reservas pagas/concluídas carregadas.</p></div></section>

    <section><div className="mb-4"><h2 className="text-xl font-bold">Comparar planos</h2><p className="mt-1 text-sm text-muted-foreground">O Premium é destacado por capacidade; o plano atual permanece claramente identificado.</p></div><div className="grid gap-4 lg:grid-cols-3">{plans.map(plan=>{const active=plan.id===current?.id||(!current&&plan.code===subscription.tier); const recommended=plan.code==='premium'; const price=cycle==='annual'?Number(plan.annual_price):Number(plan.monthly_price); const ent=(plan.entitlements||[]).filter((e:any)=>e.value_type!=='boolean'||e.boolean_value||active).slice(0,10); return <article key={plan.id} className={`relative flex min-w-0 flex-col overflow-hidden rounded-3xl border bg-card ${active?'border-primary ring-2 ring-primary/15':recommended?'border-primary/40':'border-border'}`}>{recommended&&!active&&<div className="bg-primary px-4 py-2 text-center text-xs font-bold uppercase tracking-wider text-primary-foreground">Mais completo</div>}<div className="p-5 sm:p-6"><div className="flex items-start justify-between gap-3"><div><h3 className="text-xl font-bold">{plan.name}</h3><p className="mt-1 min-h-10 text-sm text-muted-foreground">{plan.description}</p></div>{active&&<Badge>Plano atual</Badge>}</div><div className="mt-5"><span className="text-3xl font-bold">{money(price)}</span><span className="text-sm text-muted-foreground">/{cycle==='annual'?'ano':'mês'}</span></div><div className="mt-3 rounded-xl bg-muted/40 p-3"><p className="text-xs uppercase tracking-wide text-muted-foreground">Comissão FIND4SPORT</p><p className="mt-1 text-lg font-bold">{Number(plan.commission_rate)}%</p></div><div className="mt-5 space-y-2.5">{ent.map((e:any)=><div key={e.feature_key} className="flex items-center justify-between gap-3 text-sm"><span className="flex min-w-0 items-center gap-2"><Check className="h-4 w-4 shrink-0 text-primary"/><span className="truncate">{labels[e.feature_key]||e.feature_key}</span></span><strong className="shrink-0 text-xs">{featureValue(e)}</strong></div>)}</div></div><div className="mt-auto p-5 pt-0 sm:p-6 sm:pt-0"><Button className="min-h-12 w-full rounded-xl" variant={active?'outline':'default'} disabled={active||plan.code==='free'||changing===plan.id} onClick={()=>checkout(plan)}>{changing===plan.id?<><Loader2 className="mr-2 h-4 w-4 animate-spin"/>A abrir Stripe…</>:active?'Plano atual':plan.code==='free'?'Plano gratuito':<>Escolher {plan.name}<ChevronRight className="ml-1 h-4 w-4"/></>}</Button></div></article>})}</div></section>

    <section className="rounded-3xl border border-primary/20 bg-primary/5 p-5 sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><CreditCard className="h-5 w-5"/></div><div><h2 className="font-bold">Receber pagamentos</h2><p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">Liga a tua conta Stripe Connect para receber valores de serviços e reservas depois das regras de libertação de pagamento.</p></div></div><Button onClick={connect} className="min-h-11 shrink-0">Configurar Stripe Connect</Button></div></section>

    <section className="rounded-2xl border border-border bg-card"><div className="flex items-center gap-2 border-b border-border p-4 sm:p-5"><History className="h-5 w-5 text-primary"/><h2 className="font-bold">Histórico recente</h2></div><div className="divide-y divide-border">{transactions.length===0?<p className="p-6 text-center text-sm text-muted-foreground">Ainda não existem movimentos registados.</p>:transactions.slice(0,10).map(tx=><div key={tx.id} className="flex items-center justify-between gap-3 p-4 text-sm"><div className="min-w-0"><p className="truncate font-medium">{tx.description||tx.type||'Movimento'}</p><p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleDateString('pt-PT')} · {tx.status}</p></div><strong>{money(Number(tx.amount||0))}</strong></div>)}</div></section>
  </div>
}
