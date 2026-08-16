'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { ReservationDetailsDialog, type ReservationChangeRequest, type ReservationDialogData } from '@/components/dashboard/reservation-details-dialog'

type PurchaseRow={id:string;reservationId?:string|null;kind:string;title:string;provider:string;date:string;time:string;startTime?:string;endTime?:string;amount:number;status:string;paymentStatus:string|null;href:string;location?:string|null}
function money(value:number){return new Intl.NumberFormat('pt-PT',{style:'currency',currency:'EUR'}).format(Number(value||0))}
function statusLabel(value:string|null|undefined){const v=String(value||'pending');return v==='paid'?'Pago':v==='confirmed'?'Confirmado':v==='completed'?'Concluído':v==='cancelled'?'Cancelado':v==='refunded'?'Reembolsado':v==='failed'?'Falhou':'Pendente'}
function badgeVariant(value:string|null|undefined):'default'|'secondary'|'destructive'|'outline'{const v=String(value||'');return['paid','confirmed','completed'].includes(v)?'default':['cancelled','failed','refunded'].includes(v)?'destructive':'secondary'}

export function PurchaseHistory({purchases,changeRequests}:{purchases:PurchaseRow[];changeRequests:Record<string,ReservationChangeRequest>}){
 return <div className="divide-y rounded-2xl border">{purchases.map(p=>{const content=<div className="grid w-full gap-3 p-4 text-left transition hover:bg-muted/30 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><Badge variant="outline">{p.kind}</Badge><h3 className="truncate font-semibold">{p.title}</h3></div>{p.provider&&<p className="mt-1 text-sm text-muted-foreground">{p.provider}</p>}<p className="mt-1 text-xs text-muted-foreground">{new Date(`${p.date}T12:00:00`).toLocaleDateString('pt-PT')} {p.time&&`· ${p.time}`}</p></div><div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end"><strong>{money(p.amount)}</strong><div className="flex flex-wrap gap-1.5"><Badge variant={badgeVariant(p.paymentStatus)}>Pagamento: {statusLabel(p.paymentStatus)}</Badge><Badge variant={badgeVariant(p.status)}>{statusLabel(p.status)}</Badge></div></div></div>
 if(!p.reservationId)return <Link key={p.id} href={p.href} className="block">{content}</Link>
 const reservation:ReservationDialogData={id:p.reservationId,title:p.title,provider:p.provider,date:p.date,startTime:p.startTime||'00:00',endTime:p.endTime||'00:00',amount:p.amount,status:p.status,paymentStatus:p.paymentStatus,location:p.location,reference:p.reservationId.slice(0,8),kind:p.kind}
 return <ReservationDetailsDialog key={p.id} reservation={reservation} changeRequest={changeRequests[p.reservationId]||null} canRequestChange trigger={<button type="button" className="block w-full">{content}</button>}/>
 })}</div>
}
