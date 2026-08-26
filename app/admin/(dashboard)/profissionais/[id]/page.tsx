import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, BriefcaseBusiness, CalendarCheck, Eye, Star, UserRound } from 'lucide-react'
import { requireAdminPermission } from '@/lib/auth/authorization'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DashboardEmptyState, DashboardPage, DashboardPageHeader, DashboardSection, DashboardStat, DashboardStatGrid } from '@/components/patterns/dashboard-page'

export default async function AdminProfessionalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { admin } = await requireAdminPermission('professionals.manage')
  const [profileResult, servicesResult, reservationsResult, reviewsResult, qualificationsResult] = await Promise.all([
    admin.from('professionals').select('*').eq('id', id).maybeSingle(),
    admin.from('services').select('id,name,price,duration_minutes,is_active,moderation_status').eq('professional_id', id).order('created_at', { ascending: false }),
    admin.from('reservations').select('id,date,start_time,status,payment_status,amount').eq('professional_id', id).order('date', { ascending: false }).limit(20),
    admin.from('reviews').select('id,rating,title,comment,status,created_at').eq('professional_id', id).order('created_at', { ascending: false }).limit(20),
    admin.from('qualifications').select('id,title,issuer,is_verified,issue_date,expiry_date').eq('professional_id', id).order('created_at', { ascending: false }),
  ])
  if (profileResult.error || !profileResult.data) notFound()
  const profile = profileResult.data
  const services = servicesResult.data || [], reservations = reservationsResult.data || [], reviews = reviewsResult.data || [], qualifications = qualificationsResult.data || []
  const name = profile.professional_name || profile.full_name
  return <DashboardPage>
    <DashboardPageHeader title={name} description="Identidade, catálogo, atividade, qualificações e reputação do profissional." action={<div className="flex gap-2"><Button asChild variant="outline"><Link href="/admin/profissionais"><ArrowLeft className="mr-2 h-4 w-4" />Voltar</Link></Button><Button asChild><Link href={`/profissionais/${profile.public_slug || profile.id}`} target="_blank"><Eye className="mr-2 h-4 w-4" />Perfil público</Link></Button></div>} />
    <DashboardStatGrid><DashboardStat label="Serviços" value={services.length} icon={<BriefcaseBusiness className="h-5 w-5" />} /><DashboardStat label="Reservas recentes" value={reservations.length} icon={<CalendarCheck className="h-5 w-5" />} /><DashboardStat label="Avaliações" value={profile.review_count || reviews.length} icon={<Star className="h-5 w-5" />} /><DashboardStat label="Visualizações" value={profile.views_count || 0} icon={<UserRound className="h-5 w-5" />} /></DashboardStatGrid>
    <DashboardSection title="Identidade e publicação"><div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3"><p><span className="font-semibold">Estado:</span> {profile.status || '—'}</p><p><span className="font-semibold">Verificado:</span> {profile.is_verified ? 'Sim' : 'Não'}</p><p><span className="font-semibold">Email:</span> {profile.email}</p><p><span className="font-semibold">Telefone:</span> {profile.phone || '—'}</p><p><span className="font-semibold">Localização:</span> {profile.address || '—'}</p><p><span className="font-semibold">Stripe:</span> {profile.stripe_account_id ? 'Ligado' : 'Não ligado'}</p></div>{profile.bio && <p className="mt-4 whitespace-pre-line text-sm text-muted-foreground">{profile.bio}</p>}</DashboardSection>
    <DashboardSection title="Serviços"><div className="grid gap-3 md:grid-cols-2">{services.map(service => <article key={service.id} className="rounded-xl border p-3"><div className="flex justify-between gap-2"><p className="font-semibold">{service.name}</p><Badge variant="outline">{service.moderation_status}</Badge></div><p className="mt-1 text-sm text-muted-foreground">{service.duration_minutes || '—'} min · {service.price != null ? `${Number(service.price).toFixed(2)} €` : 'Preço não definido'}</p></article>)}</div></DashboardSection>
    <DashboardSection title="Qualificações">{qualifications.length === 0 ? <DashboardEmptyState title="Sem qualificações" description="Não existem qualificações registadas." /> : <div className="grid gap-2">{qualifications.map(item => <div key={item.id} className="flex justify-between rounded-xl border p-3"><div><p className="font-semibold">{item.title}</p><p className="text-xs text-muted-foreground">{item.issuer || 'Entidade não indicada'}</p></div><Badge variant={item.is_verified ? 'default' : 'outline'}>{item.is_verified ? 'Verificada' : 'Pendente'}</Badge></div>)}</div>}</DashboardSection>
  </DashboardPage>
}
