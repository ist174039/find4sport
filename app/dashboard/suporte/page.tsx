import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Headphones, PlusCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess } from '@/lib/auth/access'
import { createUserSupportTicketAction } from '@/app/actions/support'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { DashboardEmptyState, DashboardErrorState, DashboardPage, DashboardPageHeader, DashboardSection } from '@/components/patterns/dashboard-page'

export default async function DashboardSupportPage() {
  const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user)redirect('/auth/login?next=/dashboard/suporte')
  const access=await resolveSessionAccess(supabase,user); if(!access?.canAccessDashboard)redirect('/')
  const db=createAdminClient() as any; const {data:tickets,error}=await db.from('support_tickets').select('id,subject,category,priority,status,created_at,updated_at').eq('user_id',user.id).order('updated_at',{ascending:false})
  if(error)return <DashboardPage><DashboardPageHeader title="Suporte" description="Fala com a equipa FIND4SPORT e acompanha os teus pedidos."/><DashboardErrorState title="O suporte ainda não está disponível" description={`A funcionalidade está preparada, mas a migration de suporte ainda não está aplicada: ${error.message}`}/></DashboardPage>
  const rows=tickets||[]
  return <DashboardPage>
    <DashboardPageHeader title="Suporte" description="Pedidos à equipa FIND4SPORT ficam organizados em casos separados das mensagens de reservas e eventos." />
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <DashboardSection title="Os meus pedidos" description="Acompanha respostas, estado e prioridade.">
        {rows.length===0?<DashboardEmptyState icon={<Headphones className="h-10 w-10"/>} title="Sem pedidos" description="Quando precisares de ajuda, abre um caso através do formulário."/>:<div className="space-y-3">{rows.map((ticket:any)=><Link key={ticket.id} href={`/dashboard/suporte/${ticket.id}`} className="block rounded-2xl border p-4 hover:border-primary/40 hover:bg-muted/20"><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><p className="truncate font-semibold">{ticket.subject}</p><p className="mt-1 text-xs text-muted-foreground">Atualizado {new Date(ticket.updated_at).toLocaleString('pt-PT')}</p></div><div className="flex flex-wrap gap-2"><Badge variant="outline">{ticket.category}</Badge><Badge variant="secondary">{ticket.status}</Badge></div></div></Link>)}</div>}
      </DashboardSection>
      <DashboardSection title="Abrir pedido" description="Inclui informação suficiente para a equipa conseguir atuar sem pedir contexto básico.">
        <form action={createUserSupportTicketAction} className="space-y-3"><label className="block space-y-1 text-sm"><span className="font-medium">Categoria</span><select name="category" defaultValue="general" className="min-h-11 w-full rounded-lg border border-input bg-background px-3"><option value="general">Geral</option><option value="account">Conta</option><option value="billing">Faturação</option><option value="booking">Reserva</option><option value="professional">Profissional</option><option value="space">Espaço</option><option value="event">Evento</option><option value="technical">Problema técnico</option></select></label><label className="block space-y-1 text-sm"><span className="font-medium">Assunto</span><Input name="subject" required minLength={4} maxLength={160} placeholder="Ex.: Preciso de ajuda com uma reserva"/></label><label className="block space-y-1 text-sm"><span className="font-medium">Mensagem</span><Textarea name="message" required minLength={10} maxLength={5000} rows={6} placeholder="Explique o problema e indique referências relevantes."/></label><Button type="submit" className="w-full"><PlusCircle className="mr-2 h-4 w-4"/>Abrir pedido</Button></form>
      </DashboardSection>
    </div>
  </DashboardPage>
}
