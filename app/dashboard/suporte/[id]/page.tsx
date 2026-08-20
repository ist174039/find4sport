import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, Headphones } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess } from '@/lib/auth/access'
import { replyUserSupportTicketAction } from '@/app/actions/support'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { DashboardPage, DashboardPageHeader, DashboardSection } from '@/components/patterns/dashboard-page'

export default async function DashboardSupportDetailPage({params}:{params:Promise<{id:string}>}){
  const {id}=await params;if(!/^[0-9a-f-]{36}$/i.test(id))notFound();const supabase=await createClient();const{data:{user}}=await supabase.auth.getUser();if(!user)redirect(`/auth/login?next=/dashboard/suporte/${id}`);const access=await resolveSessionAccess(supabase,user);if(!access?.canAccessDashboard)redirect('/')
  const db=createAdminClient() as any;const{data:ticket}=await db.from('support_tickets').select('*').eq('id',id).eq('user_id',user.id).maybeSingle();if(!ticket)notFound();const{data:messages,error}=await db.from('support_messages').select('*').eq('ticket_id',id).eq('is_internal',false).order('created_at',{ascending:true});if(error)throw new Error('Não foi possível carregar as mensagens do pedido.')
  const adminIds=[...new Set((messages||[]).map((m:any)=>m.sender_admin_id).filter(Boolean))];const adminResult=adminIds.length?await db.from('admins').select('id,email').in('id',adminIds):{data:[]};const admins=new Map((adminResult.data||[]).map((a:any)=>[a.id,a.email]))
  return <DashboardPage><DashboardPageHeader title={ticket.subject} description={`Pedido de suporte · ${ticket.status}`} action={<Button asChild variant="outline"><Link href="/dashboard/suporte"><ArrowLeft className="mr-2 h-4 w-4"/>Voltar</Link></Button>}/><DashboardSection title="Conversa"><div className="space-y-3">{(messages||[]).map((message:any)=>{const fromAdmin=Boolean(message.sender_admin_id);return <article key={message.id} className={`rounded-2xl border p-4 ${fromAdmin?'bg-primary/[0.04]':'bg-card'}`}><div className="flex items-center gap-2"><Badge variant={fromAdmin?'secondary':'outline'}>{fromAdmin?'Equipa FIND4SPORT':'Tu'}</Badge><time className="ml-auto text-xs text-muted-foreground">{new Date(message.created_at).toLocaleString('pt-PT')}</time></div>{fromAdmin&&admins.get(message.sender_admin_id)&&<p className="mt-1 text-[11px] text-muted-foreground">{admins.get(message.sender_admin_id)}</p>}<p className="mt-3 whitespace-pre-wrap text-sm leading-6">{message.body}</p></article>})}</div>{ticket.status==='closed'?<div className="mt-5 rounded-xl border border-dashed p-4 text-sm text-muted-foreground">Este pedido está fechado. Abra um novo caso se precisar de ajuda adicional.</div>:<form action={replyUserSupportTicketAction} className="mt-5 space-y-3 border-t pt-5"><input type="hidden" name="ticketId" value={ticket.id}/><Textarea name="message" required maxLength={5000} rows={5} placeholder="Responder à equipa FIND4SPORT…"/><Button type="submit"><Headphones className="mr-2 h-4 w-4"/>Enviar resposta</Button></form>}</DashboardSection></DashboardPage>
}
