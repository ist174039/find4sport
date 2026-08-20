import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, Building2, Calendar, CreditCard, ExternalLink, Headphones, Mail, UserRound } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess } from '@/lib/auth/access'
import { createAdminSupportTicketAction } from '@/app/actions/support'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { DashboardEmptyState, DashboardPage, DashboardPageHeader, DashboardSection, DashboardStat, DashboardStatGrid } from '@/components/patterns/dashboard-page'

const roleLabel: Record<string, string> = { athlete: 'Atleta', professional: 'Profissional', venue_manager: 'Gestor de espaço' }

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')
  const access = await resolveSessionAccess(supabase, user)
  if (!access?.canAccessAdmin) redirect('/admin/login?error=unauthorized')

  const admin = createAdminClient()
  const [profileResult, authResult, professionalResult, spacesResult, eventsResult, reservationsResult, purchasesResult] = await Promise.all([
    admin.from('platform_users').select('id,full_name,type,avatar_url,location,language,created_at,updated_at').eq('id', id).maybeSingle(),
    admin.auth.admin.getUserById(id),
    admin.from('professionals').select('id,full_name,professional_name,public_slug,status,is_verified,email,phone,stripe_account_id,created_at').eq('user_id', id).maybeSingle(),
    admin.from('sport_spaces').select('id,name,slug,status,is_verified,address,owner_user_id,stripe_account_id').eq('owner_user_id', id).order('created_at', { ascending: false }),
    admin.from('events').select('id,title,slug,status,start_date').eq('created_by', id).order('start_date', { ascending: false }).limit(10),
    admin.from('reservations').select('id', { count: 'exact', head: true }).eq('user_id', id),
    admin.from('transactions').select('id', { count: 'exact', head: true }).or(`user_id.eq.${id},provider_user_id.eq.${id}`),
  ])
  if (profileResult.error) throw new Error(`Não foi possível carregar o utilizador: ${profileResult.error.message}`)
  if (!profileResult.data) notFound()
  if (authResult.error) throw new Error(`Não foi possível carregar a identidade Auth: ${authResult.error.message}`)
  if (professionalResult.error || spacesResult.error || eventsResult.error || reservationsResult.error || purchasesResult.error) throw new Error('Não foi possível carregar toda a relação operacional deste utilizador.')

  const profile = profileResult.data
  const authUser = authResult.data.user
  const professional = professionalResult.data
  const spaces = spacesResult.data || []
  const events = eventsResult.data || []
  const supportDb = createAdminClient() as any
  const supportResult = await supportDb.from('support_tickets').select('id,subject,status,priority,updated_at').eq('user_id', id).order('updated_at', { ascending: false }).limit(8)
  const supportAvailable = !supportResult.error
  const tickets = supportAvailable ? supportResult.data || [] : []
  const accountStatus = String(authUser?.app_metadata?.account_status || authUser?.user_metadata?.account_status || 'active')

  return <DashboardPage>
    <DashboardPageHeader
      title={profile.full_name || authUser?.email || 'Utilizador'}
      description="Ficha administrativa consolidada. Identidade, entidades geridas, atividade comercial e suporte sem misturar esta conta com administradores da plataforma."
      action={<Button asChild variant="outline"><Link href="/admin/utilizadores"><ArrowLeft className="mr-2 h-4 w-4" />Utilizadores</Link></Button>}
    />

    <DashboardStatGrid>
      <DashboardStat label="Tipo" value={roleLabel[String(profile.type)] || 'Sem tipo'} icon={<UserRound className="h-5 w-5" />} />
      <DashboardStat label="Reservas" value={reservationsResult.count ?? 0} icon={<Calendar className="h-5 w-5" />} />
      <DashboardStat label="Movimentos" value={purchasesResult.count ?? 0} icon={<CreditCard className="h-5 w-5" />} />
      <DashboardStat label="Casos suporte" value={supportAvailable ? tickets.length : '—'} icon={<Headphones className="h-5 w-5" />} hint={supportAvailable ? 'últimos casos carregados' : 'schema de suporte ainda não aplicado'} />
    </DashboardStatGrid>

    <div className="grid gap-6 xl:grid-cols-2">
      <DashboardSection title="Identidade da conta" description="Auth e platform_users são apresentados separadamente para não inferir dados inexistentes.">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-xl border p-3"><dt className="text-xs text-muted-foreground">Email Auth</dt><dd className="mt-1 break-all font-semibold">{authUser?.email || '—'}</dd></div>
          <div className="rounded-xl border p-3"><dt className="text-xs text-muted-foreground">Role produto</dt><dd className="mt-1 font-semibold">{roleLabel[String(profile.type)] || '—'}</dd></div>
          <div className="rounded-xl border p-3"><dt className="text-xs text-muted-foreground">Estado conta</dt><dd className="mt-1"><Badge variant="outline">{accountStatus}</Badge></dd></div>
          <div className="rounded-xl border p-3"><dt className="text-xs text-muted-foreground">Último login</dt><dd className="mt-1 font-semibold">{authUser?.last_sign_in_at ? new Date(authUser.last_sign_in_at).toLocaleString('pt-PT') : '—'}</dd></div>
          <div className="rounded-xl border p-3"><dt className="text-xs text-muted-foreground">Localização</dt><dd className="mt-1 font-semibold">{profile.location || '—'}</dd></div>
          <div className="rounded-xl border p-3"><dt className="text-xs text-muted-foreground">Registo</dt><dd className="mt-1 font-semibold">{new Date(profile.created_at).toLocaleString('pt-PT')}</dd></div>
        </dl>
      </DashboardSection>

      <DashboardSection title="Contacto de suporte" description="O administrador pode iniciar um caso mesmo quando não existe reserva ou conversa comercial ativa.">
        {supportAvailable ? <form action={createAdminSupportTicketAction} className="space-y-3">
          <input type="hidden" name="userId" value={profile.id} />
          <div className="grid gap-3 sm:grid-cols-2"><label className="space-y-1 text-sm"><span className="font-medium">Categoria</span><select name="category" defaultValue="general" className="min-h-11 w-full rounded-lg border border-input bg-background px-3"><option value="general">Geral</option><option value="account">Conta</option><option value="billing">Faturação</option><option value="booking">Reserva</option><option value="professional">Profissional</option><option value="space">Espaço</option><option value="event">Evento</option><option value="technical">Técnico</option></select></label><label className="space-y-1 text-sm"><span className="font-medium">Prioridade</span><select name="priority" defaultValue="normal" className="min-h-11 w-full rounded-lg border border-input bg-background px-3"><option value="low">Baixa</option><option value="normal">Normal</option><option value="high">Alta</option><option value="urgent">Urgente</option></select></label></div>
          <label className="block space-y-1 text-sm"><span className="font-medium">Assunto</span><Input name="subject" required minLength={4} maxLength={160} placeholder="Pedido de informação" /></label>
          <label className="block space-y-1 text-sm"><span className="font-medium">Mensagem</span><Textarea name="message" required minLength={5} maxLength={5000} rows={5} placeholder="Explique ao utilizador o que é necessário." /></label>
          <Button type="submit"><Mail className="mr-2 h-4 w-4" />Abrir caso e enviar</Button>
        </form> : <div className="rounded-xl border border-dashed p-5 text-sm text-muted-foreground">A interface de suporte está preparada na branch, mas a migration de suporte ainda não foi aplicada à base de dados de produção.</div>}
      </DashboardSection>
    </div>

    {professional && <DashboardSection title="Perfil profissional" description="Relação direta com professionals.">
      <div className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">{professional.professional_name || professional.full_name || 'Profissional'}</p><div className="mt-2 flex flex-wrap gap-2"><Badge variant="outline">{professional.status || 'sem estado'}</Badge>{professional.is_verified && <Badge>Verificado</Badge>}<Badge variant={professional.stripe_account_id ? 'secondary' : 'destructive'}>{professional.stripe_account_id ? 'Stripe configurado' : 'Sem Stripe'}</Badge></div></div><div className="flex flex-wrap gap-2"><Button asChild variant="outline"><Link href={`/admin/profissionais?q=${encodeURIComponent(professional.email || professional.full_name || professional.id)}`}>Administrar</Link></Button><Button asChild variant="outline"><Link href={`/profissionais/${professional.public_slug || professional.id}`} target="_blank">Página pública<ExternalLink className="ml-2 h-4 w-4" /></Link></Button></div></div>
    </DashboardSection>}

    <DashboardSection title="Espaços geridos" description="Espaços cujo owner_user_id corresponde a esta conta.">
      {spaces.length === 0 ? <DashboardEmptyState icon={<Building2 className="h-9 w-9" />} title="Sem espaços geridos" description="Esta conta não é atualmente proprietária/gestora de nenhum espaço." /> : <div className="grid gap-3 md:grid-cols-2">{spaces.map(space => <article key={space.id} className="rounded-xl border p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-semibold">{space.name}</p><p className="mt-1 truncate text-xs text-muted-foreground">{space.address || 'Sem morada'}</p></div><Badge variant="outline">{space.status}</Badge></div><div className="mt-3 flex flex-wrap gap-2"><Badge variant={space.stripe_account_id ? 'secondary' : 'outline'}>{space.stripe_account_id ? 'Stripe' : 'Sem Stripe'}</Badge><Button asChild size="sm" variant="outline"><Link href={`/espacos/${space.slug || space.id}`} target="_blank">Ver<ExternalLink className="ml-1 h-3.5 w-3.5" /></Link></Button></div></article>)}</div>}
    </DashboardSection>

    <DashboardSection title="Eventos criados" description="Últimos eventos em que created_by corresponde ao utilizador.">
      {events.length === 0 ? <DashboardEmptyState icon={<Calendar className="h-9 w-9" />} title="Sem eventos" description="Nenhum evento associado a esta conta." /> : <div className="space-y-2">{events.map(event => <article key={event.id} className="flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="truncate text-sm font-semibold">{event.title}</p><p className="text-xs text-muted-foreground">{new Date(event.start_date).toLocaleString('pt-PT')}</p></div><div className="flex items-center gap-2"><Badge variant="outline">{event.status || 'sem estado'}</Badge><Button asChild size="sm" variant="outline"><Link href={`/eventos/${event.slug || event.id}`} target="_blank">Ver</Link></Button></div></article>)}</div>}
    </DashboardSection>

    {supportAvailable && <DashboardSection title="Histórico de suporte" description="Últimos casos desta conta.">
      {tickets.length === 0 ? <DashboardEmptyState icon={<Headphones className="h-9 w-9" />} title="Sem casos" description="Ainda não existe suporte registado para este utilizador." /> : <div className="space-y-2">{tickets.map((ticket: any) => <Link key={ticket.id} href={`/admin/suporte/${ticket.id}`} className="flex flex-col gap-2 rounded-xl border p-3 hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="truncate text-sm font-semibold">{ticket.subject}</p><p className="text-xs text-muted-foreground">Atualizado {new Date(ticket.updated_at).toLocaleString('pt-PT')}</p></div><div className="flex gap-2"><Badge variant="outline">{ticket.priority}</Badge><Badge variant="secondary">{ticket.status}</Badge></div></Link>)}</div>}
    </DashboardSection>}
  </DashboardPage>
}
