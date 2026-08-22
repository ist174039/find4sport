'use server'

import { requireAdmin } from '@/lib/auth/authorization'
import { writeAdminAudit } from '@/lib/admin/audit'
import type { TablesInsert } from '@/lib/supabase-types'

function cleanSlug(value: string) {
  const base = value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || 'espaco'
  return `${base}-${crypto.randomUUID().slice(0, 8)}`
}

export async function searchImportPlacesAction(query: string) {
  await requireAdmin()
  const q = query.trim()
  if (q.length < 3 || q.length > 160) throw new Error('Indique uma pesquisa válida.')

  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('q', q)
  url.searchParams.set('addressdetails', '1')
  url.searchParams.set('limit', '8')
  url.searchParams.set('countrycodes', 'pt')
  url.searchParams.set('dedupe', '1')

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Find4Sport/1.0 (admin geocoding search)',
      'Accept-Language': 'pt-PT,pt;q=0.9,en;q=0.6',
    },
    cache: 'no-store',
  })
  if (!response.ok) throw new Error('O serviço de pesquisa geográfica não respondeu corretamente.')

  const results = await response.json()
  return (Array.isArray(results) ? results : []).map((place: any) => ({
    id: `${place.osm_type || 'osm'}-${place.osm_id || crypto.randomUUID()}`,
    name: String(place.name || place.display_name?.split(',')?.[0] || 'Local').trim(),
    address: String(place.display_name || '').trim(),
    type: 'space' as const,
    lat: Number(place.lat),
    lon: Number(place.lon),
    source: 'OpenStreetMap/Nominatim',
    sourceType: place.type || null,
  })).filter((item: any) => item.name && item.address && Number.isFinite(item.lat) && Number.isFinite(item.lon))
}

export async function adminIngestData(queueItems: any[]) {
  const { user, admin } = await requireAdmin()

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

  const { data: existing } = await admin.from('sport_spaces').select('name').in('name', candidates.map(item => String(item.name).trim()))
  const existingNames = new Set((existing || []).map(row => String(row.name).trim().toLowerCase()))

  const rows: TablesInsert<'sport_spaces'>[] = candidates.filter(item => !existingNames.has(String(item.name).trim().toLowerCase())).map(item => ({
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