import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, BriefcaseBusiness, CalendarDays, CreditCard, Eye, Star, UserRound } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess } from '@/lib/auth/access'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DashboardPage, DashboardPageHeader, DashboardSection, DashboardStat, DashboardStatGrid } from '@/components/patterns/dashboard-page'
import { ProfessionalStateActions } from '../professional-admin-actions'

export default async function AdminProfessionalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')
  const access = await resolveSessionAccess(supabase, user)
  if (!access?.canAccessAdmin) redirect('/admin/login?error=unauthorized')

  const { id } = await params
  const admin = createAdminClient()
  const { data: professional, error } = await admin.from('professionals').select('id,user_id,full_name,professional_name,email,phone,address,bio,avatar_url,public_slug,status,is_verified,rating_avg,review_count,stripe_account_id,created_at,updated_at').eq('id', id).maybeSingle()
  if (error) throw new Error(`Não foi possível carregar o profissional: ${error.message}`)
  if (!professional) notFound()

  const name = professional.full_name || professional.professional_name || 'Profissional'
  const [{ count: services }, { count: activeServices }, { count: reservations }, { count: reviews }, { data: owner }] = await Promise.all([
    admin.from('services').select('id', { count: 'exact', head: true }).eq('professional_id', id),
    admin.from('services').select('id', { count: 'exact', head: true }).eq('professional_id', id).eq('is_active', true),
    admin.from('reservations').select('id', { count: 'exact', head: true }).eq('professional_id', id),
    admin.from('reviews').select('id', { count: 'exact', head: true }).eq('professional_id', id),
    professional.user_id ? admin.from('platform_users').select('id,full_name,type').eq('id', professional.user_id).maybeSingle() : Promise.resolve({ data: null }),
  ])
  const stripeConnected = String(professional.stripe_account_id || '').startsWith('acct_')

  return <DashboardPage>
    <div><Button asChild variant="ghost" className="mb-2 min-h-11 px-2"><Link href="/admin/profissionais"><ArrowLeft className="mr-2 h-4 w-4" />Profissionais</Link></Button></div>
    <DashboardPageHeader title={name} description="Visão administrativa consolidada do perfil, atividade e estado operacional." action={<Button asChild variant="outline" className="min-h-11"><Link href={`/profissionais/${professional.public_slug || professional.id}`} target="_blank"><Eye className="mr-2 h-4 w-4" />Página pública</Link></Button>} />

    <DashboardStatGrid>
      <DashboardStat label="Serviços" value={services || 0} hint={`${activeServices || 0} ativos`} icon={<BriefcaseBusiness className="h-5 w-5" />} />
      <DashboardStat label="Reservas" value={reservations || 0} icon={<CalendarDays className="h-5 w-5" />} />
      <DashboardStat label="Avaliações" value={reviews || 0} hint={Number(professional.review_count || 0) ? `${Number(professional.rating_avg || 0).toFixed(1)} média` : 'Sem avaliações'} icon={<Star className="h-5 w-5" />} />
      <DashboardStat label="Stripe Connect" value={stripeConnected ? 'Ligado' : 'Não ligado'} icon={<CreditCard className="h-5 w-5" />} />
    </DashboardStatGrid>

    <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <DashboardSection title="Perfil" description="Dados usados na operação e apresentação pública.">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border p-4"><p className="text-xs text-muted-foreground">Email</p><p className="mt-1 break-all font-medium">{professional.email || '—'}</p></div>
          <div className="rounded-xl border p-4"><p className="text-xs text-muted-foreground">Telefone</p><p className="mt-1 font-medium">{professional.phone || '—'}</p></div>
          <div className="rounded-xl border p-4 sm:col-span-2"><p className="text-xs text-muted-foreground">Localização</p><p className="mt-1 font-medium">{professional.address || '—'}</p></div>
          {professional.bio && <div className="rounded-xl border p-4 sm:col-span-2"><p className="text-xs text-muted-foreground">Descrição</p><p className="mt-1 whitespace-pre-wrap text-sm">{professional.bio}</p></div>}
        </div>
      </DashboardSection>

      <DashboardSection title="Estado" description="Ações operacionais sobre o perfil profissional.">
        <div className="mb-4 flex flex-wrap gap-2"><Badge variant="outline">{professional.status || 'sem estado'}</Badge>{professional.is_verified && <Badge>Verificado</Badge>}</div>
        <ProfessionalStateActions id={professional.id} name={name} isVerified={Boolean(professional.is_verified)} status={professional.status} />
        {owner && <div className="mt-5 border-t pt-4"><div className="flex items-center gap-2 text-sm font-medium"><UserRound className="h-4 w-4" />Conta associada</div><p className="mt-1 text-sm text-muted-foreground">{owner.full_name || owner.id}</p><Button asChild variant="outline" className="mt-3 min-h-11 w-full"><Link href={`/admin/utilizadores/${owner.id}`}>Ver conta</Link></Button></div>}
      </DashboardSection>
    </div>

    <DashboardSection title="Operação" description="Atalhos para os recursos associados, preservando contexto administrativo.">
      <div className="flex flex-wrap gap-2"><Button asChild variant="outline" className="min-h-11"><Link href={`/admin/servicos?q=${encodeURIComponent(name)}`}>Ver serviços</Link></Button><Button asChild variant="outline" className="min-h-11"><Link href={`/admin/reservas?q=${encodeURIComponent(name)}`}>Ver reservas</Link></Button><Button asChild variant="outline" className="min-h-11"><Link href={`/admin/avaliacoes?q=${encodeURIComponent(name)}`}>Ver avaliações</Link></Button></div>
    </DashboardSection>
  </DashboardPage>
}
