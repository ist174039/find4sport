import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { resolveSessionAccess } from '@/lib/auth/access'
import { isProviderRole } from '@/lib/auth/roles'
import { ReservationsClient } from './reservations-client'
import type { AvailabilityRow, ReservationListItem } from '@/lib/reservations/view-model'

const PAGE_SIZE = 20
const ALLOWED_STATUS = new Set(['all', 'pending', 'paid', 'confirmed', 'cancelled', 'completed'])

function firstParam(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] || '' : value || '' }

async function resolveSearchIds(supabase: Awaited<ReturnType<typeof createClient>>, query: string) {
  if (!query) return { userIds: [] as string[], serviceIds: [] as string[], roomIds: [] as string[] }
  const pattern = `%${query}%`
  const [{ data: users }, { data: services }, { data: rooms }] = await Promise.all([
    supabase.from('platform_users').select('id').ilike('full_name', pattern).limit(100),
    supabase.from('services').select('id').ilike('name', pattern).limit(100),
    supabase.from('space_rooms').select('id').ilike('name', pattern).limit(100),
  ])
  return { userIds: (users || []).map(row => row.id), serviceIds: (services || []).map(row => row.id), roomIds: (rooms || []).map(row => row.id) }
}

export default async function ReservasPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/dashboard/reservas')

  const access = await resolveSessionAccess(supabase, user)
  if (!access || !isProviderRole(access.role)) redirect('/dashboard')

  const params = await searchParams
  const requestedPage = Math.max(1, Number(firstParam(params.page)) || 1)
  const query = firstParam(params.q).trim().slice(0, 120)
  const rawStatus = firstParam(params.status) || 'all'
  const status = ALLOWED_STATUS.has(rawStatus) ? rawStatus : 'all'
  const searchIds = await resolveSearchIds(supabase, query)
  const orParts = [
    searchIds.userIds.length ? `user_id.in.(${searchIds.userIds.join(',')})` : '',
    searchIds.serviceIds.length ? `service_id.in.(${searchIds.serviceIds.join(',')})` : '',
    searchIds.roomIds.length ? `space_room_id.in.(${searchIds.roomIds.join(',')})` : '',
    /^\d{4}-\d{2}-\d{2}$/.test(query) ? `date.eq.${query}` : '',
  ].filter(Boolean)

  let professionalId: string | null = null
  let spaceIds: string[] = []
  let availability: AvailabilityRow[] = []
  if (access.role === 'professional') {
    const { data: professional } = await supabase.from('professionals').select('id').eq('user_id', user.id).maybeSingle()
    if (!professional) redirect('/auth/registar/profissional')
    professionalId = professional.id
    const { data } = await supabase.from('professional_availability').select('day_of_week,start_time,end_time,is_active').eq('professional_id', professional.id)
    availability = (data || []).map(row => ({ day_of_week: row.day_of_week, start_time: row.start_time, end_time: row.end_time, is_active: row.is_active }))
  } else {
    const { data: spaces } = await supabase.from('sport_spaces').select('id').eq('owner_user_id', user.id)
    spaceIds = (spaces || []).map(space => space.id)
    if (!spaceIds.length) redirect('/auth/registar/espaco')
  }

  let countQuery = supabase.from('reservations').select('id', { count: 'exact', head: true })
  let dataQuery = supabase.from('reservations').select('id,date,start_time,end_time,status,payment_status,amount,service:services(name),room:space_rooms(name),user:platform_users(id,full_name,avatar_url,type)')
  if (professionalId) { countQuery = countQuery.eq('professional_id', professionalId); dataQuery = dataQuery.eq('professional_id', professionalId) }
  else { countQuery = countQuery.in('space_id', spaceIds); dataQuery = dataQuery.in('space_id', spaceIds) }
  if (status !== 'all') { countQuery = countQuery.eq('status', status); dataQuery = dataQuery.eq('status', status) }
  if (query) {
    if (!orParts.length) { countQuery = countQuery.eq('id', '00000000-0000-0000-0000-000000000000'); dataQuery = dataQuery.eq('id', '00000000-0000-0000-0000-000000000000') }
    else { const expression = orParts.join(','); countQuery = countQuery.or(expression); dataQuery = dataQuery.or(expression) }
  }

  const { count, error: countError } = await countQuery
  if (countError) throw new Error('Não foi possível contar as reservas.')
  const total = count || 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const page = Math.min(requestedPage, totalPages)
  const from = (page - 1) * PAGE_SIZE
  const { data: reservationRows, error } = await dataQuery.order('date', { ascending: false }).order('start_time', { ascending: false }).range(from, from + PAGE_SIZE - 1)
  if (error) throw new Error(`Não foi possível carregar reservas: ${error.message}`)

  const items = (reservationRows || []).map(row => row as unknown as ReservationListItem)
  return <ReservationsClient role={access.role} data={{ items, total, page, pageSize: PAGE_SIZE, query, status }} initialAvailability={availability} />
}
