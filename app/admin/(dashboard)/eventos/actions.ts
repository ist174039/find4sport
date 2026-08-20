'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess } from '@/lib/auth/access'
import { writeAdminAudit } from '@/lib/admin/audit'

const MAX_SEARCH_LENGTH = 100
const MAX_TITLE_LENGTH = 160
const MAX_ADDRESS_LENGTH = 500
const MAX_DESCRIPTION_LENGTH = 2_000

type EventFilter = 'all' | 'upcoming' | 'past' | 'pending' | 'draft'

type CreateAdminEventInput = {
  title: string
  address?: string | null
  start_date: string
  price_min?: number | null
  price_max?: number | null
  capacity?: number | null
  description?: string | null
}

async function requireAdminAccess() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Utilizador não autenticado')

  const access = await resolveSessionAccess(supabase, user)
  if (!access?.canAccessAdmin) throw new Error('Sem permissões de administrador')

  return { user, admin: createAdminClient() }
}

function normalizeFilter(value: unknown): EventFilter {
  return value === 'upcoming' || value === 'past' || value === 'pending' || value === 'draft' ? value : 'all'
}

function normalizeSearch(value: unknown) {
  return String(value || '').trim().replace(/[,%]/g, '').slice(0, MAX_SEARCH_LENGTH)
}

function normalizeEventId(value: string) {
  const id = String(value || '').trim()
  if (!id || id.length > 100) throw new Error('Identificador de evento inválido.')
  return id
}

function validateMoney(value: number | null | undefined, label: string) {
  const amount = value == null ? 0 : Number(value)
  if (!Number.isFinite(amount) || amount < 0 || amount > 1_000_000) throw new Error(`${label} inválido.`)
  return amount
}

function validateCapacity(value: number | null | undefined) {
  if (value == null) return null
  const capacity = Number(value)
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 1_000_000) throw new Error('Capacidade inválida.')
  return capacity
}

export async function getAdminEvents(input?: { page?: number; pageSize?: number; search?: string; filter?: EventFilter }) {
  const { admin } = await requireAdminAccess()
  const requestedPage = Math.max(1, Math.floor(input?.page || 1))
  const pageSize = Math.min(50, Math.max(5, Math.floor(input?.pageSize || 20)))
  const search = normalizeSearch(input?.search)
  const filter = normalizeFilter(input?.filter)
  const now = new Date()
  const nowIso = now.toISOString()
  const next7Iso = new Date(now.getTime() + 7 * 86_400_000).toISOString()

  const buildListQuery = () => {
    let query = admin
      .from('events')
      .select('id,title,slug,address,start_date,status,description,price_min,price_max,capacity,created_at', { count: 'exact' })
      .order('start_date', { ascending: false })

    if (search) query = query.or(`title.ilike.%${search}%,address.ilike.%${search}%,description.ilike.%${search}%`)
    if (filter === 'upcoming') query = query.gte('start_date', nowIso)
    if (filter === 'past') query = query.lt('start_date', nowIso)
    if (filter === 'pending') query = query.eq('status', 'pending')
    if (filter === 'draft') query = query.eq('status', 'draft')
    return query
  }

  const from = (requestedPage - 1) * pageSize
  const to = from + pageSize - 1
  const [listResult, totalResult, upcomingResult, next7Result, pendingResult] = await Promise.all([
    buildListQuery().range(from, to),
    admin.from('events').select('id', { count: 'exact', head: true }),
    admin.from('events').select('id', { count: 'exact', head: true }).gte('start_date', nowIso),
    admin.from('events').select('id', { count: 'exact', head: true }).gte('start_date', nowIso).lte('start_date', next7Iso),
    admin.from('events').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  const failures = [
    listResult.error && `lista: ${listResult.error.message}`,
    totalResult.error && `total: ${totalResult.error.message}`,
    upcomingResult.error && `próximos: ${upcomingResult.error.message}`,
    next7Result.error && `próximos 7 dias: ${next7Result.error.message}`,
    pendingResult.error && `pendentes: ${pendingResult.error.message}`,
  ].filter(Boolean) as string[]

  if (failures.length > 0) throw new Error(`Não foi possível carregar os eventos. ${failures.join(' · ')}`)

  const total = listResult.count ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const page = Math.min(requestedPage, totalPages)
  let items = listResult.data || []

  if (total > 0 && requestedPage > totalPages) {
    const safeFrom = (page - 1) * pageSize
    const safeResult = await buildListQuery().range(safeFrom, safeFrom + pageSize - 1)
    if (safeResult.error) throw new Error(`Não foi possível carregar os eventos: ${safeResult.error.message}`)
    items = safeResult.data || []
  }

  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
    stats: {
      total: totalResult.count ?? 0,
      upcoming: upcomingResult.count ?? 0,
      next7: next7Result.count ?? 0,
      pending: pendingResult.count ?? 0,
    },
  }
}

export async function approveEventAction(id: string) {
  const eventId = normalizeEventId(id)
  const { user, admin } = await requireAdminAccess()
  const { data, error } = await admin.from('events').update({ status: 'published' }).eq('id', eventId).select('id,title,status').single()
  if (error) throw new Error(`Não foi possível aprovar o evento: ${error.message}`)

  await writeAdminAudit(admin as any, {
    action: 'UPDATE',
    tableName: 'events',
    userEmail: user.email || 'admin',
    message: `Evento ${data.id} aprovado`,
    data: { event_id: data.id, title: data.title, status: data.status },
  })
  return data
}

export async function rejectEventAction(id: string) {
  const eventId = normalizeEventId(id)
  const { user, admin } = await requireAdminAccess()
  const { data, error } = await admin.from('events').update({ status: 'cancelled' }).eq('id', eventId).select('id,title,status').single()
  if (error) throw new Error(`Não foi possível rejeitar o evento: ${error.message}`)

  await writeAdminAudit(admin as any, {
    action: 'UPDATE',
    tableName: 'events',
    userEmail: user.email || 'admin',
    message: `Evento ${data.id} rejeitado`,
    data: { event_id: data.id, title: data.title, status: data.status },
  })
  return data
}

export async function deleteEventAction(id: string) {
  const eventId = normalizeEventId(id)
  const { user, admin } = await requireAdminAccess()
  const { data, error } = await admin.from('events').delete().eq('id', eventId).select('id,title').single()
  if (error) throw new Error(`Não foi possível eliminar o evento: ${error.message}`)

  await writeAdminAudit(admin as any, {
    action: 'DELETE',
    tableName: 'events',
    userEmail: user.email || 'admin',
    message: `Evento ${data.id} eliminado`,
    data: { event_id: data.id, title: data.title },
  })
  return data
}

export async function createAdminEventAction(input: CreateAdminEventInput) {
  const { user, admin } = await requireAdminAccess()
  const title = String(input.title || '').trim()
  const address = input.address ? String(input.address).trim() : null
  const description = input.description ? String(input.description).trim() : null
  const startDate = new Date(input.start_date)

  if (!title) throw new Error('Título é obrigatório.')
  if (title.length > MAX_TITLE_LENGTH) throw new Error(`O título não pode exceder ${MAX_TITLE_LENGTH} caracteres.`)
  if (address && address.length > MAX_ADDRESS_LENGTH) throw new Error(`A localização não pode exceder ${MAX_ADDRESS_LENGTH} caracteres.`)
  if (description && description.length > MAX_DESCRIPTION_LENGTH) throw new Error(`A descrição não pode exceder ${MAX_DESCRIPTION_LENGTH} caracteres.`)
  if (Number.isNaN(startDate.getTime())) throw new Error('Data do evento inválida.')

  const priceMin = validateMoney(input.price_min, 'Preço mínimo')
  const priceMax = validateMoney(input.price_max ?? priceMin, 'Preço máximo')
  if (priceMax < priceMin) throw new Error('O preço máximo não pode ser inferior ao preço mínimo.')
  const capacity = validateCapacity(input.capacity)

  const { data, error } = await admin.from('events').insert({
    title,
    address,
    start_date: startDate.toISOString(),
    price_min: priceMin,
    price_max: priceMax,
    capacity,
    description,
    status: 'published',
  }).select('id,title,slug,address,start_date,status,description,price_min,price_max,capacity,created_at').single()

  if (error) throw new Error(`Não foi possível criar o evento: ${error.message}`)

  await writeAdminAudit(admin as any, {
    action: 'INSERT',
    tableName: 'events',
    userEmail: user.email || 'admin',
    message: `Evento ${data.id} criado e publicado`,
    data: { event_id: data.id, title: data.title, status: data.status },
  })
  return data
}
