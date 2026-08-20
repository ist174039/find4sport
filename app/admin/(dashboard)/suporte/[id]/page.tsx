import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, Headphones, LockKeyhole, UserRound } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess } from '@/lib/auth/access'
import { replyAdminSupportTicketAction, updateAdminSupportTicketAction } from '@/app/actions/support'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { DashboardErrorState, DashboardPage, DashboardPageHeader, DashboardSection } from '@/components/patterns/dashboard-page'

export default async function AdminSupportDetailPage({ params }: { params: Promise<{ id:string }> }) {
  const {id}=await params; if(!/^[0-9a-f-]{36}$/i.test(id))notFound()
  const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user)redirect('/admin/login'); const access=await resolveSessionAccess(supabase,user); if(!access?.canAccessAdmin)redirect('/admin/login?error=unauthorized')
  const db=createAdminClient() as any
  const {data:ticket,error}=await db.from('support_tickets').select('*').eq('id',id).maybeSingle(); if(error)return <DashboardPage><DashboardPageHeader title="Suporte"/><DashboardErrorState title="Não foi possível abrir o caso" description={error.message}/></DashboardPage>; if(!ticket)notFound()
  const [{data:messages,error:messagesError},{data:target},{data:assigned}]=await Promise.all([
    db.from('support_messages').select('*').eq('ticket_id',id).order('created_at',{ascending:true}),
    ticket.user_id?db.from('platform_users').select('id,full_name,type').eq('id',ticket.user_id).maybeSingle():Promise.resolve({data:null}),
    ticket.assigned_admin_id?db.from('admins').select('id,email,admin_type').eq('id',ticket.assigned_admin_id).maybeSingle():Promise.resolve({data:null}),
  ])
  if(messagesError)throw new Error(`Não foi possível carregar mensagens: ${messagesError.message}`)
  const adminIds=[...new Set((messages||[]).map((m:any)=>m.sender_admin_id).filter(Boolean))]; const userIds=[...new Set((messages||[]).map((m:any)=>m.sender_user_id).filter(Boolean))]
  const [messageAdmins,messageUsers]=await Promise.all([adminIds.length?db.from('admins').select('id,email').in('id',adminIds):Promise.resolve({data:[]}),userIds.length?db.from('platform_users').select('id,full_name').in('id',userIds):Promise.resolve({data:[]})])
  const adminMap=new Map((messageAdmins.data||[]).map((r:any)=>[r.id,r.email])); const userMap=new Map((messageUsers.data||[]).map((r:any)=>[r.id,r.full_name]))
  return <DashboardPage>
    <DashboardPageHeader title={ticket.subject} description={`Caso ${ticket.id}`} action={<Button asChild variant="outline"><Link href="/admin/suporte"><ArrowLeft className="mr-2 h-4 w-4"/>Fila</Link></Button>}/>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <DashboardSection title="Conversa" description="Mensagens visíveis ao utilizador e notas internas ficam claramente separadas.">
        <div className="space-y-3">{(messages||[]).map((message:any)=>{const fromAdmin=Boolean(message.sender_admin_id); const author=fromAdmin?(adminMap.get(message.sender_admin_id)||'Administrador'):(userMap.get(message.sender_user_id)||'Utilizador'); return <article key={message.id} className={`rounded-2xl border p-4 ${message.is_internal?'border-amber-300/50 bg-amber-50/40 dark:bg-amber-950/10':fromAdmin?'bg-primary/[0.04]':'bg-card'}`}><div className="flex flex-wrap items-center gap-2"><Badge variant={fromAdmin?'secondary':'outline'}>{author}</Badge>{message.is_internal&&<Badge variant="outline"><LockKeyhole className="mr-1 h-3 w-3"/>Nota interna</Badge>}<time className="ml-auto text-xs text-muted-foreground">{new Date(message.created_at).toLocaleString('pt-PT')}</time></div><p className="mt-3 whitespace-pre-wrap text-sm leading-6">{message.body}</p></article>})}</div>
        <form action={replyAdminSupportTicketAction} className="mt-5 space-y-3 border-t pt-5"><input type="hidden" name="ticketId" value={ticket.id}/><Textarea name="message" required maxLength={5000} rows={5} placeholder="Responder ao utilizador…"/><div className="flex flex-col gap-2 sm:flex-row"><Button name="internal" value="false" type="submit"><Headphones className="mr-2 h-4 w-4"/>Responder</Button><Button name="internal" value="true" type="submit" variant="outline"><LockKeyhole className="mr-2 h-4 w-4"/>Adicionar nota interna</Button></div></form>
      </DashboardSection>
      <div className="space-y-6">
        <DashboardSection title="Estado do caso">
          <form action={updateAdminSupportTicketAction} className="space-y-3"><input type="hidden" name="ticketId" value={ticket.id}/><label className="block space-y-1 text-sm"><span className="font-medium">Estado</span><select name="status" defaultValue={ticket.status} className="min-h-11 w-full rounded-lg border border-input bg-background px-3"><option value="open">Aberto</option><option value="pending_admin">Aguarda Admin</option><option value="pending_user">Aguarda utilizador</option><option value="resolved">Resolvido</option><option value="closed">Fechado</option></select></label><label className="block space-y-1 text-sm"><span className="font-medium">Prioridade</span><select name="priority" defaultValue={ticket.priority} className="min-h-11 w-full rounded-lg border border-input bg-background px-3"><option value="low">Baixa</option><option value="normal">Normal</option><option value="high">Alta</option><option value="urgent">Urgente</option></select></label><Button type="submit" className="w-full">Guardar e atribuir a mim</Button></form>
        </DashboardSection>
        <DashboardSection title="Utilizador">
          <div className="space-y-2 text-sm"><p className="flex items-center gap-2 font-semibold"><UserRound className="h-4 w-4"/>{target?.full_name||ticket.user_id||'Indisponível'}</p>{target?.type&&<Badge variant="outline">{target.type}</Badge>}<p className="text-xs text-muted-foreground">Atribuído: {assigned?.email||'ninguém'}</p>{ticket.user_id&&<Button asChild variant="outline" className="mt-2 w-full"><Link href={`/admin/utilizadores/${ticket.user_id}`}>Abrir ficha do utilizador</Link></Button>}</div>
        </DashboardSection>
      </div>
    </div>
  </DashboardPage>
}
