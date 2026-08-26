import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Building2, CalendarCheck, DoorOpen, Eye, Star } from 'lucide-react'
import { requireAdminPermission } from '@/lib/auth/authorization'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DashboardEmptyState, DashboardPage, DashboardPageHeader, DashboardSection, DashboardStat, DashboardStatGrid } from '@/components/patterns/dashboard-page'
import { SpaceDetailEditor } from '@/components/admin/space-detail-editor'

export default async function AdminSpaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { admin } = await requireAdminPermission('spaces.manage')
  const [spaceResult, roomsResult, reservationsResult, reviewsResult] = await Promise.all([
    admin.from('sport_spaces').select('*,owner:platform_users!sport_spaces_owner_user_id_fkey(full_name,type)').eq('id', id).maybeSingle(),
    admin.from('space_rooms').select('id,name,capacity,price_per_hour,is_active,description').eq('space_id', id).order('created_at'),
    admin.from('reservations').select('id,date,start_time,status,payment_status,amount,space_room_id').eq('space_id', id).order('date', { ascending: false }).limit(20),
    admin.from('reviews').select('id,rating,title,comment,status,created_at').eq('space_id', id).order('created_at', { ascending: false }).limit(20),
  ])
  if (spaceResult.error || !spaceResult.data) notFound()
  const space = spaceResult.data, rooms = roomsResult.data || [], reservations = reservationsResult.data || [], reviews = reviewsResult.data || []
  return <DashboardPage>
    <DashboardSection title="Editar espaço"><SpaceDetailEditor space={space} /></DashboardSection>
    <DashboardPageHeader title={space.name} description="Propriedade, publicação, inventário, reservas e reputação do espaço." action={<div className="flex gap-2"><Button asChild variant="outline"><Link href="/admin/espacos"><ArrowLeft className="mr-2 h-4 w-4" />Voltar</Link></Button><Button asChild><Link href={`/espacos/${space.slug || space.id}`} target="_blank"><Eye className="mr-2 h-4 w-4" />Página pública</Link></Button></div>} />
    <DashboardStatGrid><DashboardStat label="Salas/campos" value={rooms.length} icon={<DoorOpen className="h-5 w-5" />} /><DashboardStat label="Reservas recentes" value={reservations.length} icon={<CalendarCheck className="h-5 w-5" />} /><DashboardStat label="Avaliações" value={space.review_count || reviews.length} icon={<Star className="h-5 w-5" />} /><DashboardStat label="Visualizações" value={space.views_count || 0} icon={<Building2 className="h-5 w-5" />} /></DashboardStatGrid>
    <DashboardSection title="Identidade e publicação"><div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3"><p><span className="font-semibold">Estado:</span> {space.status || '—'}</p><p><span className="font-semibold">Verificado:</span> {space.is_verified ? 'Sim' : 'Não'}</p><p><span className="font-semibold">Gestor:</span> {space.owner?.full_name || 'Sem gestor'}</p><p><span className="font-semibold">Email:</span> {space.email || '—'}</p><p><span className="font-semibold">Telefone:</span> {space.phone || '—'}</p><p><span className="font-semibold">Stripe:</span> {space.stripe_account_id ? 'Ligado' : 'Não ligado'}</p><p className="sm:col-span-2"><span className="font-semibold">Localização:</span> {space.address || '—'}</p></div>{space.description && <p className="mt-4 whitespace-pre-line text-sm text-muted-foreground">{space.description}</p>}</DashboardSection>
    <DashboardSection title="Salas e campos">{rooms.length === 0 ? <DashboardEmptyState title="Sem recursos" description="Não existem salas ou campos registados." /> : <div className="grid gap-3 md:grid-cols-2">{rooms.map(room => <article key={room.id} className="rounded-xl border p-3"><div className="flex justify-between gap-2"><p className="font-semibold">{room.name}</p><Badge variant={room.is_active ? 'default' : 'outline'}>{room.is_active ? 'Ativo' : 'Inativo'}</Badge></div><p className="mt-1 text-sm text-muted-foreground">Capacidade {room.capacity || '—'} · {room.price_per_hour != null ? `${Number(room.price_per_hour).toFixed(2)} €/h` : 'Preço não definido'}</p></article>)}</div>}</DashboardSection>
  </DashboardPage>
}
