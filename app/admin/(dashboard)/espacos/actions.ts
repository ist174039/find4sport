'use server'

import { requireAdminPermission } from '@/lib/auth/authorization'
import { writeAdminAudit } from '@/lib/admin/audit'

type SpaceFilter = 'all' | 'active' | 'pending' | 'managed' | 'unmanaged'

export async function getAdminSpacesAction(input?: { page?: number; pageSize?: number; search?: string; filter?: SpaceFilter }) {
  const { admin } = await requireAdminPermission('spaces.manage')
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
  const ownerIds = [...new Set(rows.map(row => row.owner_user_id).filter(Boolean))] as string[]
  const { data: owners } = ownerIds.length ? await admin.from('platform_users').select('id, full_name, type').in('id', ownerIds) : { data: [] as any[] }
  const ownerMap = new Map((owners || []).map(owner => [owner.id, owner]))
  const enriched = await Promise.all(rows.map(async row => {
    if (!row.owner_user_id) return { ...row, owner: null }
    const profile: any = ownerMap.get(row.owner_user_id) || null
    const { data: authData } = await admin.auth.admin.getUserById(row.owner_user_id)
    return { ...row, owner: profile ? { ...profile, email: authData?.user?.email || null } : { id: row.owner_user_id, full_name: null, email: authData?.user?.email || null } }
  }))

  return { items: enriched, total: count || 0, page, pageSize, totalPages: Math.max(1, Math.ceil((count || 0) / pageSize)) }
}

export async function getAdminSpaceStatsAction() {
  const { admin } = await requireAdminPermission('spaces.manage')
  const [{ count: total }, { count: active }, { count: unmanaged }] = await Promise.all([
    admin.from('sport_spaces').select('id', { count: 'exact', head: true }),
    admin.from('sport_spaces').select('id', { count: 'exact', head: true }).eq('status', 'active').eq('is_verified', true),
    admin.from('sport_spaces').select('id', { count: 'exact', head: true }).is('owner_user_id', null),
  ])
  return { total: total || 0, active: active || 0, pending: Math.max(0, (total || 0) - (active || 0)), unmanaged: unmanaged || 0 }
}

export async function setAdminSpaceStatusAction(spaceId: string, active: boolean) {
  const { user, admin } = await requireAdminPermission('spaces.manage')
  const { data, error } = await admin.from('sport_spaces').update({ status: active ? 'active' : 'pending', is_verified: active }).eq('id', spaceId).select('id, status, is_verified').single()
  if (error) throw error
  await writeAdminAudit(admin as any, { action: 'UPDATE', tableName: 'sport_spaces', userEmail: user.email || 'admin', message: `Estado do espaço ${spaceId} alterado para ${data.status}`, data: { space_id: spaceId, status: data.status } })
  return data
}

export async function createAdminSpaceAction(input: { name: string; address: string }) {
  const { user, admin } = await requireAdminPermission('spaces.manage')
  const name = input.name.trim()
  const address = input.address.trim()
  if (!name || !address) throw new Error('Nome e localização são obrigatórios.')
  const slugBase = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || 'espaco'
  const slug = `${slugBase}-${crypto.randomUUID().slice(0, 8)}`
  const { data, error } = await admin.from('sport_spaces').insert({ name, address, slug, status: 'pending', is_verified: false, created_by: user.id }).select().single()
  if (error) throw error
  await writeAdminAudit(admin as any, { action: 'INSERT', tableName: 'sport_spaces', userEmail: user.email || 'admin', message: `Espaço ${data.id} criado para curadoria`, data: { space_id: data.id } })
  return data
}
