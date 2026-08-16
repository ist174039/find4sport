'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess } from '@/lib/auth/access'
import { writeAdminAudit } from '@/lib/admin/audit'

async function requireAdminAccess() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Utilizador não autenticado')
  const access = await resolveSessionAccess(supabase, user)
  if (!access?.canAccessAdmin) throw new Error('Sem permissões de administrador')
  return { user, admin: createAdminClient() }
}

function cleanSlug(value: string) {
  const base = value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || 'espaco'
  return `${base}-${crypto.randomUUID().slice(0, 8)}`
}

export async function adminIngestData(queueItems: any[]) {
  const { user, admin } = await requireAdminAccess()

  const invalid: string[] = []
  const candidates = (queueItems || []).filter(item => {
    if (item.type && item.type !== 'space') {
      invalid.push(`${item.name || 'Item'}: profissionais exigem onboarding com identidade Auth.`)
      return false
    }
    const lat = Number(item.lat)
    const lon = Number(item.lon)
    if (!item.name?.trim() || !item.address?.trim() || !Number.isFinite(lat) || !Number.isFinite(lon)) {
      invalid.push(`${item.name || 'Item'}: nome, morada e coordenadas válidas são obrigatórios.`)
      return false
    }
    return true
  })

  if (candidates.length === 0) return { error: invalid[0] || 'Não existem espaços válidos para importar.', invalid }

  const names = candidates.map(item => String(item.name).trim().toLowerCase())
  const { data: existing } = await admin.from('sport_spaces').select('name').in('name', candidates.map(item => String(item.name).trim()))
  const existingNames = new Set((existing || []).map(row => String(row.name).trim().toLowerCase()))

  const rows = candidates.filter(item => !existingNames.has(String(item.name).trim().toLowerCase())).map(item => ({
    name: String(item.name).trim(),
    slug: cleanSlug(String(item.name)),
    address: String(item.address).trim(),
    latitude: Number(item.lat),
    longitude: Number(item.lon),
    phone: item.phone ? String(item.phone).trim() : null,
    description: item.description ? String(item.description).trim() : null,
    is_verified: false,
    status: 'pending',
    created_by: user.id,
  }))

  const duplicateCount = candidates.length - rows.length
  if (rows.length === 0) return { error: 'Todos os espaços válidos já existem na base de dados.', invalid, duplicateCount }

  const { data, error } = await admin.from('sport_spaces').insert(rows).select('id')
  if (error) return { error: error.message, invalid, duplicateCount }

  const countInserted = data?.length || 0
  await writeAdminAudit(admin as any, {
    action: 'INSERT',
    tableName: 'sport_spaces',
    userEmail: user.email || 'admin',
    message: `Importação de ${countInserted} espaços pendentes`,
    data: { count: countInserted, duplicates_skipped: duplicateCount, invalid_skipped: invalid.length },
  })

  return { success: true, countInserted, duplicateCount, invalid }
}
