import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess } from '@/lib/auth/access'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DashboardPage, DashboardPageHeader, DashboardSection } from '@/components/patterns/dashboard-page'

function money(value: unknown, currency = 'EUR') { const n=Number(value); return new Intl.NumberFormat('pt-PT',{style:'currency',currency:String(currency||'EUR').toUpperCase()}).format(Number.isFinite(n)?n:0) }
function value(v: unknown) { return v == null || v === '' ? '—' : String(v) }

export default async function AdminTransactionPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user) redirect('/admin/login')
  const access=await resolveSessionAccess(supabase,user); if(!access?.canAccessAdmin) redirect('/admin/login?error=unauthorized')
  const {id}=await params; const db=createAdminClient() as any
  const {data:tx,error}=await db.from('transactions').select('*').eq('id',id).maybeSingle(); if(error) throw new Error(`Erro ao carregar transação: ${error.message}`); if(!tx) notFound()
  const ids=[tx.user_id,tx.provider_user_id].filter(Boolean); const users=new Map<string,any>()
  if(ids.length){const {data}=await db.from('platform_users').select('id,full_name,email,type').in('id',ids);for(const u of data||[])users.set(u.id,u)}
  let source:any=null
  if(tx.source_id && ['service_reservation','space_reservation'].includes(String(tx.source_type))){const {data}=await db.from('reservations').select('id,status,payment_status,settlement_status,service_delivery_status,date,start_time,end_time').eq('id',tx.source_id).maybeSingle();source=data}
  const buyer=tx.user_id?users.get(tx.user_id):null, provider=tx.provider_user_id?users.get(tx.provider_user_id):null
  const stripeDashboard=tx.stripe_payment_intent_id?`https://dashboard.stripe.com/payments/${tx.stripe_payment_intent_id}`:tx.stripe_charge_id?.startsWith('ch_')?`https://dashboard.stripe.com/payments/${tx.stripe_charge_id}`:null
  return <DashboardPage>
    <div><Button asChild variant="ghost" size="sm"><Link href="/admin/faturacao"><ArrowLeft className="mr-2 h-4 w-4"/>Voltar à faturação</Link></Button></div>
    <DashboardPageHeader title="Detalhe da transação" description="Vista de auditoria financeira. Os valores e estados são derivados das operações de domínio e não são editáveis diretamente." />
    <DashboardSection title="Identificação"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"><Info label="ID" text={tx.id}/><Info label="Tipo" text={tx.type}/><Info label="Estado" text={tx.status}/><Info label="Criada" text={new Date(tx.created_at).toLocaleString('pt-PT')}/></div></DashboardSection>
    <DashboardSection title="Valores financeiros"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Money label="Bruto" amount={tx.gross_amount??tx.amount} currency={tx.currency}/><Money label="Base" amount={tx.base_amount} currency={tx.currency}/><Money label="Taxa cliente" amount={tx.customer_fee_amount} currency={tx.currency}/><Money label="Comissão plataforma" amount={tx.platform_commission_amount} currency={tx.currency}/><Money label="Stripe fee" amount={tx.stripe_processing_fee_amount} currency={tx.currency}/><Money label="Líquido prestador" amount={tx.provider_net_amount} currency={tx.currency}/><Money label="Líquido plataforma" amount={tx.platform_net_amount} currency={tx.currency}/><Info label="Moeda" text={String(tx.currency||'EUR').toUpperCase()}/></div></DashboardSection>
    <DashboardSection title="Intervenientes"><div className="grid gap-3 md:grid-cols-2"><Person label="Comprador" person={buyer}/><Person label="Prestador" person={provider}/></div></DashboardSection>
    <DashboardSection title="Origem e settlement"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"><Info label="Origem" text={tx.source_type}/><Info label="ID origem" text={tx.source_id}/>{source&&<><Info label="Pagamento" text={source.payment_status}/><Info label="Settlement" text={source.settlement_status}/><Info label="Entrega" text={source.service_delivery_status}/><Info label="Reserva" text={source.status}/></>}</div></DashboardSection>
    <DashboardSection title="Stripe / rastreabilidade"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"><Info label="Payment Intent" text={tx.stripe_payment_intent_id}/><Info label="Charge" text={tx.stripe_charge_id}/><Info label="Connected account" text={tx.stripe_connected_account_id}/><Info label="Transfer" text={tx.stripe_transfer_id}/></div>{stripeDashboard&&<Button asChild variant="outline" className="mt-4"><a href={stripeDashboard} target="_blank" rel="noreferrer">Abrir no Stripe <ExternalLink className="ml-2 h-4 w-4"/></a></Button>}</DashboardSection>
    {tx.related_transaction_id&&<DashboardSection title="Relação financeira"><Button asChild variant="outline"><Link href={`/admin/faturacao/transacoes/${tx.related_transaction_id}`}>Abrir transação original</Link></Button></DashboardSection>}
  </DashboardPage>
}
function Info({label,text}:{label:string;text:unknown}){return <div className="rounded-xl border p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 break-all text-sm font-semibold">{value(text)}</p></div>}
function Money({label,amount,currency}:{label:string;amount:unknown;currency?:string}){return <div className="rounded-xl border p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-lg font-bold">{money(amount,currency)}</p></div>}
function Person({label,person}:{label:string;person:any}){return <div className="rounded-xl border p-3"><div className="flex items-center justify-between"><p className="text-xs text-muted-foreground">{label}</p>{person?.type&&<Badge variant="outline">{person.type}</Badge>}</div><p className="mt-1 font-semibold">{person?.full_name||'—'}</p><p className="text-xs text-muted-foreground">{person?.email||'Sem email'}</p></div>}
