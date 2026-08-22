import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, ExternalLink, Printer, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess } from '@/lib/auth/access'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DashboardPage, DashboardPageHeader, DashboardSection } from '@/components/patterns/dashboard-page'

function money(value: unknown, currency = 'EUR') { const n=Number(value); return new Intl.NumberFormat('pt-PT',{style:'currency',currency:String(currency||'EUR').toUpperCase()}).format(Number.isFinite(n)?n:0) }
function value(v: unknown) { return v == null || v === '' ? '—' : String(v) }
function eventLabel(type:string){return ({settlement_released:'Settlement libertado',dispute_created:'Disputa criada',dispute_updated:'Disputa atualizada',dispute_closed:'Disputa encerrada',refund_recorded:'Reembolso registado',auto_confirmed:'Serviço auto-confirmado'} as Record<string,string>)[type]||type.replaceAll('_',' ')}

export default async function AdminTransactionPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user) redirect('/admin/login')
  const access=await resolveSessionAccess(supabase,user); if(!access?.canAccessAdmin) redirect('/admin/login?error=unauthorized')
  const {id}=await params; const db=createAdminClient() as any
  const {data:tx,error}=await db.from('transactions').select('*').eq('id',id).maybeSingle(); if(error) throw new Error(`Erro ao carregar transação: ${error.message}`); if(!tx) notFound()
  const ids=[tx.user_id,tx.provider_user_id].filter(Boolean); const users=new Map<string,any>()
  if(ids.length){const {data}=await db.from('platform_users').select('id,full_name,email,type').in('id',ids);for(const u of data||[])users.set(u.id,u)}
  let source:any=null, events:any[]=[]
  if(tx.source_id && ['service_reservation','space_reservation'].includes(String(tx.source_type))){
    const [{data:reservation},{data:eventRows}]=await Promise.all([
      db.from('reservations').select('id,status,payment_status,settlement_status,service_delivery_status,date,start_time,end_time').eq('id',tx.source_id).maybeSingle(),
      db.from('reservation_delivery_events').select('id,event_type,note,metadata,created_at').eq('reservation_id',tx.source_id).order('created_at',{ascending:false}).limit(20),
    ]);source=reservation;events=eventRows||[]
  }
  let related:any[]=[]
  if(tx.source_id){const {data}=await db.from('transactions').select('id,type,status,amount,gross_amount,currency,created_at,stripe_charge_id').eq('source_id',tx.source_id).neq('id',tx.id).order('created_at',{ascending:false}).limit(20);related=data||[]}
  const buyer=tx.user_id?users.get(tx.user_id):null, provider=tx.provider_user_id?users.get(tx.provider_user_id):null
  const stripeDashboard=tx.stripe_payment_intent_id?`https://dashboard.stripe.com/payments/${tx.stripe_payment_intent_id}`:tx.stripe_charge_id?.startsWith('ch_')?`https://dashboard.stripe.com/payments/${tx.stripe_charge_id}`:null
  const isNegative=['refund','dispute','transfer_reversal'].includes(String(tx.type)); const receiptRef=`F4S-${String(tx.id).slice(0,8).toUpperCase()}`
  return <DashboardPage>
    <div className="flex flex-wrap items-center justify-between gap-2"><Button asChild variant="ghost" size="sm"><Link href="/admin/faturacao"><ArrowLeft className="mr-2 h-4 w-4"/>Voltar à faturação</Link></Button><div className="flex gap-2"><Button asChild variant="outline" size="sm"><Link href={`?print=1`}><Printer className="mr-2 h-4 w-4"/>Comprovativo</Link></Button>{stripeDashboard&&<Button asChild variant="outline" size="sm"><a href={stripeDashboard} target="_blank" rel="noreferrer">Stripe <ExternalLink className="ml-2 h-4 w-4"/></a></Button>}</div></div>
    <DashboardPageHeader title="Detalhe da transação" description="Consola de auditoria financeira. Estados e montantes não podem ser alterados diretamente pelo administrador." />
    <div className="rounded-xl border bg-muted/30 p-4"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5"/><div><p className="font-semibold">Operação protegida</p><p className="text-sm text-muted-foreground">Refunds, disputas e settlements devem ser executados pelos respetivos fluxos de domínio/Stripe. Esta vista nunca escreve diretamente estado financeiro.</p></div></div></div>
    <DashboardSection title="Comprovativo da operação" description="Documento operacional da plataforma; não substitui uma fatura ou documento fiscal legalmente exigível."><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"><Info label="Referência" text={receiptRef}/><Info label="Data" text={new Date(tx.created_at).toLocaleString('pt-PT')}/><Info label="Operação" text={tx.type}/><Money label={isNegative?'Valor do movimento':'Total pago'} amount={tx.gross_amount??tx.amount} currency={tx.currency}/></div></DashboardSection>
    <DashboardSection title="Identificação"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"><Info label="ID" text={tx.id}/><Info label="Tipo" text={tx.type}/><Info label="Estado" text={tx.status}/><Info label="Criada" text={new Date(tx.created_at).toLocaleString('pt-PT')}/></div></DashboardSection>
    <DashboardSection title="Valores financeiros"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Money label="Bruto" amount={tx.gross_amount??tx.amount} currency={tx.currency}/><Money label="Base" amount={tx.base_amount} currency={tx.currency}/><Money label="Taxa cliente" amount={tx.customer_fee_amount} currency={tx.currency}/><Money label="Comissão plataforma" amount={tx.platform_commission_amount} currency={tx.currency}/><Money label="Stripe fee" amount={tx.stripe_processing_fee_amount} currency={tx.currency}/><Money label="Líquido prestador" amount={tx.provider_net_amount} currency={tx.currency}/><Money label="Líquido plataforma" amount={tx.platform_net_amount} currency={tx.currency}/><Info label="Moeda" text={String(tx.currency||'EUR').toUpperCase()}/></div></DashboardSection>
    <DashboardSection title="Intervenientes"><div className="grid gap-3 md:grid-cols-2"><Person label="Comprador" person={buyer}/><Person label="Prestador" person={provider}/></div></DashboardSection>
    <DashboardSection title="Origem e settlement"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"><Info label="Origem" text={tx.source_type}/><Info label="ID origem" text={tx.source_id}/>{source&&<><Info label="Pagamento" text={source.payment_status}/><Info label="Settlement" text={source.settlement_status}/><Info label="Entrega" text={source.service_delivery_status}/><Info label="Reserva" text={source.status}/></>}</div></DashboardSection>
    <DashboardSection title="Stripe / rastreabilidade"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"><Info label="Payment Intent" text={tx.stripe_payment_intent_id}/><Info label="Charge" text={tx.stripe_charge_id}/><Info label="Connected account" text={tx.stripe_connected_account_id}/><Info label="Transfer" text={tx.stripe_transfer_id}/></div></DashboardSection>
    {(tx.related_transaction_id||related.length>0)&&<DashboardSection title="Movimentos relacionados" description="Refunds, disputas, reversões e outras operações associadas à mesma origem."><div className="space-y-2">{tx.related_transaction_id&&<Button asChild variant="outline" size="sm"><Link href={`/admin/faturacao/transacoes/${tx.related_transaction_id}`}>Abrir transação original</Link></Button>}{related.map(r=><Link key={r.id} href={`/admin/faturacao/transacoes/${r.id}`} className="flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"><div><p className="text-sm font-semibold">{r.type}</p><p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString('pt-PT')} · {r.status}</p></div><p className="text-sm font-bold">{money(r.gross_amount??r.amount,r.currency)}</p></Link>)}</div></DashboardSection>}
    {events.length>0&&<DashboardSection title="Linha temporal financeira" description="Eventos de entrega, disputa e settlement associados à reserva."><div className="space-y-2">{events.map(e=><div key={e.id} className="rounded-lg border p-3"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold">{eventLabel(e.event_type)}</p><span className="text-xs text-muted-foreground">{new Date(e.created_at).toLocaleString('pt-PT')}</span></div>{e.note&&<p className="mt-1 text-xs text-muted-foreground">{e.note}</p>}</div>)}</div></DashboardSection>}
  </DashboardPage>
}
function Info({label,text}:{label:string;text:unknown}){return <div className="rounded-xl border p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 break-all text-sm font-semibold">{value(text)}</p></div>}
function Money({label,amount,currency}:{label:string;amount:unknown;currency?:string}){return <div className="rounded-xl border p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-lg font-bold">{money(amount,currency)}</p></div>}
function Person({label,person}:{label:string;person:any}){return <div className="rounded-xl border p-3"><div className="flex items-center justify-between"><p className="text-xs text-muted-foreground">{label}</p>{person?.type&&<Badge variant="outline">{person.type}</Badge>}</div><p className="mt-1 font-semibold">{person?.full_name||'—'}</p><p className="text-xs text-muted-foreground">{person?.email||'Sem email'}</p></div>}
