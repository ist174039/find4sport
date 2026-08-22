import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, CalendarDays, Eye, MapPin, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess } from '@/lib/auth/access'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DashboardPage, DashboardPageHeader, DashboardSection, DashboardStat, DashboardStatGrid } from '@/components/patterns/dashboard-page'
import { approveEventAction, rejectEventAction } from '../actions'

export default async function AdminEventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect('/admin/login'); const access = await resolveSessionAccess(supabase, user); if (!access?.canAccessAdmin) redirect('/admin/login?error=unauthorized')
  const { id } = await params; const admin = createAdminClient(); const { data: event, error } = await admin.from('events').select('*').eq('id', id).maybeSingle(); if (error) throw new Error(`Não foi possível carregar o evento: ${error.message}`); if (!event) notFound()
  const { data: professional } = event.created_by ? await admin.from('professionals').select('id,full_name,professional_name,email').eq('id', event.created_by).maybeSingle() : { data: null }
  const name = professional?.full_name || professional?.professional_name || null
  return <DashboardPage>
    <div><Button asChild variant="ghost" className="mb-2 min-h-11 px-2"><Link href="/admin/eventos"><ArrowLeft className="mr-2 h-4 w-4" />Eventos</Link></Button></div>
    <DashboardPageHeader title={event.title || 'Evento'} description="Detalhe administrativo e lifecycle do evento." action={<Button asChild variant="outline" className="min-h-11"><Link href={`/eventos/${event.slug || event.id}`} target="_blank"><Eye className="mr-2 h-4 w-4" />Página pública</Link></Button>} />
    <DashboardStatGrid><DashboardStat label="Estado" value={event.status || '—'} icon={<CalendarDays className="h-5 w-5" />} /><DashboardStat label="Capacidade" value={event.capacity ?? '—'} icon={<Users className="h-5 w-5" />} /><DashboardStat label="Preço mínimo" value={event.price_min != null ? `${Number(event.price_min).toFixed(2)} €` : '—'} /><DashboardStat label="Preço máximo" value={event.price_max != null ? `${Number(event.price_max).toFixed(2)} €` : '—'} /></DashboardStatGrid>
    <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <DashboardSection title="Evento" description="Informação utilizada na publicação."><div className="grid gap-3 sm:grid-cols-2"><div className="rounded-xl border p-4"><p className="text-xs text-muted-foreground">Início</p><p className="mt-1 font-medium">{event.start_date ? new Date(event.start_date).toLocaleString('pt-PT') : '—'}</p></div><div className="rounded-xl border p-4"><p className="text-xs text-muted-foreground">Fim</p><p className="mt-1 font-medium">{event.end_date ? new Date(event.end_date).toLocaleString('pt-PT') : '—'}</p></div><div className="rounded-xl border p-4 sm:col-span-2"><div className="flex items-center gap-2 text-xs text-muted-foreground"><MapPin className="h-4 w-4" />Localização</div><p className="mt-1 break-words font-medium">{event.address || '—'}</p></div>{event.description && <div className="rounded-xl border p-4 sm:col-span-2"><p className="text-xs text-muted-foreground">Descrição</p><p className="mt-1 whitespace-pre-wrap text-sm">{event.description}</p></div>}</div></DashboardSection>
      <DashboardSection title="Lifecycle" description="Ações auditadas; eventos não são eliminados fisicamente."><div className="mb-4"><Badge variant="outline">{event.status || 'sem estado'}</Badge></div>{event.status === 'pending' ? <div className="grid gap-2"><form action={async () => { 'use server'; await approveEventAction(id) }}><Button className="min-h-11 w-full">Aprovar e publicar</Button></form><form action={async () => { 'use server'; await rejectEventAction(id) }}><Button variant="destructive" className="min-h-11 w-full">Rejeitar</Button></form></div> : event.status === 'published' ? <form action={async () => { 'use server'; await rejectEventAction(id) }}><Button variant="destructive" className="min-h-11 w-full">Cancelar publicação</Button></form> : <form action={async () => { 'use server'; await approveEventAction(id) }}><Button className="min-h-11 w-full">Republicar</Button></form>}{professional && <div className="mt-5 border-t pt-4"><p className="text-sm font-medium">Criado por</p><p className="mt-1 text-sm text-muted-foreground">{name || professional.email || professional.id}</p><Button asChild variant="outline" className="mt-3 min-h-11 w-full"><Link href={`/admin/profissionais/${professional.id}`}>Ver profissional</Link></Button></div>}</DashboardSection>
    </div>
  </DashboardPage>
}
