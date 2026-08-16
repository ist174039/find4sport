'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess } from '@/lib/auth/access'
import { writeAdminAudit } from '@/lib/admin/audit'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Sessão administrativa inválida.')
  const access = await resolveSessionAccess(supabase, user)
  if (!access?.canAccessAdmin) throw new Error('Acesso administrativo necessário.')
  return { user, admin: createAdminClient() }
}

export async function getAdminSpacesAction() {
  const { admin } = await requireAdmin()
  const { data, error } = await admin.from('sport_spaces').select('id, name, slug, address, status, is_verified, owner_user_id, created_at, rating_avg, review_count, logo_url').order('name', { ascending: true })
  if (error) throw error
  const rows = data || []
  const ownerIds = [...new Set(rows.map(row => row.owner_user_id).filter(Boolean))]
  const { data: owners } = ownerIds.length ? await admin.from('platform_users').select('id, full_name, email, type').in('id', ownerIds) : { data: [] as any[] }
  const ownerMap = new Map((owners || []).map(owner => [owner.id, owner]))
  return rows.map(row => ({ ...row, owner: row.owner_user_id ? ownerMap.get(row.owner_user_id) || null : null }))
}

export async function setAdminSpaceStatusAction(spaceId: string, active: boolean) {
  const { user, admin } = await requireAdmin()
  const { data, error } = await admin.from('sport_spaces').update({ status: active ? 'active' : 'pending', is_verified: active }).eq('id', spaceId).select('id, status, is_verified').single()
  if (error) throw error
  await writeAdminAudit(admin as any, { action: 'UPDATE', tableName: 'sport_spaces', userEmail: user.email || 'admin', message: `Estado do espaço ${spaceId} alterado para ${data.status}`, data: { space_id: spaceId, status: data.status } })
  return data
}

export async function createAdminSpaceAction(input: { name: string; address: string }) {
  const { user, admin } = await requireAdmin()
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
