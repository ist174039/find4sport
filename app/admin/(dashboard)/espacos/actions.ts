'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess } from '@/lib/auth/access'
import { writeAdminAudit } from '@/lib/admin/audit'

const MAX_NAME_LENGTH = 160
const MAX_ADDRESS_LENGTH = 500

type SpaceFilter = 'all' | 'active' | 'pending' | 'managed' | 'unmanaged'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Sessão administrativa inválida.')
  const access = await resolveSessionAccess(supabase, user)
  if (!access?.canAccessAdmin) throw new Error('Acesso administrativo necessário.')
  return { user, admin: createAdminClient() }
}

export async function getAdminSpacesAction(input?: { page?: number; pageSize?: number; search?: string; filter?: SpaceFilter }) {
  const { admin } = await requireAdmin()
  const page = Math.max(1, Math.floor(input?.page || 1))
  const pageSize = Math.min(50, Math.max(5, Math.floor(input?.pageSize || 20)))
  const search = String(input?.search || '').trim().replace(/[,%]/g, '').slice(0, 100)
  const filter: SpaceFilter = ['active', 'pending', 'managed', 'unmanaged'].includes(String(input?.filter)) ? input!.filter as SpaceFilter : 'all'
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = admin
    .from('sport_spaces')
    .select('id, name, slug, address, status, is_verified, owner_user_id, created_at, rating_avg, review_count, logo_url', { count: 'exact' })
    .order('name', { ascending: true })

  if (search) query = query.or(`name.ilike.%${search}%,address.ilike.%${search}%`)
  if (filter === 'active') query = query.eq('status', 'active').eq('is_verified', true)
  if (filter === 'pending') query = query.or('status.neq.active,is_verified.eq.false')
  if (filter === 'managed') query = query.not('owner_user_id', 'is', null)
  if (filter === 'unmanaged') query = query.is('owner_user_id', null)

  const { data, count, error } = await query.range(from, to)
  if (error) throw new Error(`Não foi possível carregar os espaços: ${error.message}`)

  const rows = data || []
  const ownerIds = [...new Set(rows.map(row => row.owner_user_id).filter((value): value is string => Boolean(value)))]
  const ownersResult = ownerIds.length
    ? await admin.from('platform_users').select('id, full_name, type').in('id', ownerIds)
    : { data: [] as Array<{ id: string; full_name: string | null; type: string | null }>, error: null }

  if (ownersResult.error) throw new Error(`Não foi possível carregar os gestores dos espaços: ${ownersResult.error.message}`)
  const ownerMap = new Map((ownersResult.data || []).map(owner => [owner.id, owner]))

  const enriched = await Promise.all(rows.map(async row => {
    if (!row.owner_user_id) return { ...row, owner: null }
    const profile = ownerMap.get(row.owner_user_id) || null
    const authResult = await admin.auth.admin.getUserById(row.owner_user_id)
    if (authResult.error) throw new Error(`Não foi possível validar o gestor do espaço ${row.name}: ${authResult.error.message}`)
    const email = authResult.data?.user?.email || null
    return { ...row, owner: profile ? { ...profile, email } : { id: row.owner_user_id, full_name: null, email } }
  }))

  return { items: enriched, total: count ?? 0, page, pageSize, totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)) }
}

export async function getAdminSpaceStatsAction() {
  const { admin } = await requireAdmin()
  const [totalResult, activeResult, unmanagedResult] = await Promise.all([
    admin.from('sport_spaces').select('id', { count: 'exact', head: true }),
    admin.from('sport_spaces').select('id', { count: 'exact', head: true }).eq('status', 'active').eq('is_verified', true),
    admin.from('sport_spaces').select('id', { count: 'exact', head: true }).is('owner_user_id', null),
  ])

  const failures = [
    totalResult.error && `total: ${totalResult.error.message}`,
    activeResult.error && `ativos: ${activeResult.error.message}`,
    unmanagedResult.error && `sem gestor: ${unmanagedResult.error.message}`,
  ].filter(Boolean) as string[]
  if (failures.length > 0) throw new Error(`Não foi possível calcular os indicadores dos espaços. ${failures.join(' · ')}`)

  const total = totalResult.count ?? 0
  const active = activeResult.count ?? 0
  return { total, active, pending: Math.max(0, total - active), unmanaged: unmanagedResult.count ?? 0 }
}

export async function setAdminSpaceStatusAction(spaceId: string, active: boolean) {
  const id = String(spaceId || '').trim()
  if (!id || id.length > 100) throw new Error('Identificador de espaço inválido.')

  const { user, admin } = await requireAdmin()
  const { data, error } = await admin.from('sport_spaces').update({ status: active ? 'active' : 'pending', is_verified: active }).eq('id', id).select('id, status, is_verified').single()
  if (error) throw new Error(`Não foi possível alterar o estado do espaço: ${error.message}`)

  await writeAdminAudit(admin as any, {
    action: 'UPDATE',
    tableName: 'sport_spaces',
    userEmail: user.email || 'admin',
    message: `Estado do espaço ${id} alterado para ${data.status}`,
    data: { space_id: id, status: data.status },
  })
  return data
}

export async function createAdminSpaceAction(input: { name: string; address: string }) {
  const { user, admin } = await requireAdmin()
  const name = String(input.name || '').trim()
  const address = String(input.address || '').trim()
  if (!name || !address) throw new Error('Nome e localização são obrigatórios.')
  if (name.length > MAX_NAME_LENGTH) throw new Error(`O nome não pode exceder ${MAX_NAME_LENGTH} caracteres.`)
  if (address.length > MAX_ADDRESS_LENGTH) throw new Error(`A localização não pode exceder ${MAX_ADDRESS_LENGTH} caracteres.`)

  const slugBase = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || 'espaco'
  const slug = `${slugBase}-${crypto.randomUUID().slice(0, 8)}`
  const { data, error } = await admin.from('sport_spaces').insert({ name, address, slug, status: 'pending', is_verified: false, created_by: user.id }).select().single()
  if (error) throw new Error(`Não foi possível criar o espaço: ${error.message}`)

  await writeAdminAudit(admin as any, {
    action: 'INSERT',
    tableName: 'sport_spaces',
    userEmail: user.email || 'admin',
    message: `Espaço ${data.id} criado para curadoria`,
    data: { space_id: data.id },
  })
  return data
}
