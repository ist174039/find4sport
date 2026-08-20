'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess } from '@/lib/auth/access'
import { writeAdminAudit } from '@/lib/admin/audit'
import type { TablesInsert } from '@/lib/supabase-types'

const MAX_IMPORT_ITEMS = 500
const MAX_NAME_LENGTH = 160
const MAX_ADDRESS_LENGTH = 500
const MAX_PHONE_LENGTH = 64
const MAX_DESCRIPTION_LENGTH = 2_000

type ImportQueueItem = {
  id?: string
  name?: string
  address?: string
  type?: string
  lat?: number
  lon?: number
  phone?: string
  description?: string
  source?: string
}

type NominatimPlace = {
  osm_type?: string
  osm_id?: string | number
  name?: string
  display_name?: string
  type?: string
  lat?: string | number
  lon?: string | number
}

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

function normalizeKey(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

function hasValidCoordinates(lat: number, lon: number) {
  return Number.isFinite(lat) && Number.isFinite(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180
}

export async function searchImportPlacesAction(query: string) {
  await requireAdminAccess()
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

  const payload: unknown = await response.json()
  const results = Array.isArray(payload) ? payload as NominatimPlace[] : []

  return results.map(place => ({
    id: `${place.osm_type || 'osm'}-${place.osm_id || crypto.randomUUID()}`,
    name: String(place.name || place.display_name?.split(',')?.[0] || 'Local').trim().slice(0, MAX_NAME_LENGTH),
    address: String(place.display_name || '').trim().slice(0, MAX_ADDRESS_LENGTH),
    type: 'space' as const,
    lat: Number(place.lat),
    lon: Number(place.lon),
    source: 'OpenStreetMap/Nominatim',
    sourceType: place.type || null,
  })).filter(item => item.name && item.address && hasValidCoordinates(item.lat, item.lon))
}

export async function adminIngestData(queueItems: ImportQueueItem[]) {
  const { user, admin } = await requireAdminAccess()
  if (!Array.isArray(queueItems)) return { error: 'Formato de importação inválido.', invalid: [] as string[] }
  if (queueItems.length > MAX_IMPORT_ITEMS) return { error: `Cada importação está limitada a ${MAX_IMPORT_ITEMS} espaços.`, invalid: [] as string[] }

  const invalid: string[] = []
  const seenBatchKeys = new Set<string>()
  let duplicateInBatchCount = 0

  const candidates = queueItems.filter(item => {
    if (item.type && item.type !== 'space') {
      invalid.push(`${item.name || 'Item'}: profissionais exigem onboarding com identidade Auth.`)
      return false
    }

    const name = String(item.name || '').trim()
    const address = String(item.address || '').trim()
    const lat = Number(item.lat)
    const lon = Number(item.lon)
    const phone = item.phone ? String(item.phone).trim() : ''
    const description = item.description ? String(item.description).trim() : ''

    if (!name || !address || !hasValidCoordinates(lat, lon)) {
      invalid.push(`${name || 'Item'}: nome, morada e coordenadas válidas são obrigatórios.`)
      return false
    }
    if (name.length > MAX_NAME_LENGTH || address.length > MAX_ADDRESS_LENGTH || phone.length > MAX_PHONE_LENGTH || description.length > MAX_DESCRIPTION_LENGTH) {
      invalid.push(`${name}: um ou mais campos excedem o tamanho permitido.`)
      return false
    }

    const batchKey = `${normalizeKey(name)}|${normalizeKey(address)}`
    if (seenBatchKeys.has(batchKey)) {
      duplicateInBatchCount += 1
      return false
    }
    seenBatchKeys.add(batchKey)
    return true
  })

  if (candidates.length === 0) return { error: invalid[0] || 'Não existem espaços válidos para importar.', invalid, duplicateCount: duplicateInBatchCount }

  const candidateNames = candidates.map(item => String(item.name).trim())
  const { data: existing, error: existingError } = await admin.from('sport_spaces').select('name').in('name', candidateNames)
  if (existingError) return { error: existingError.message, invalid, duplicateCount: duplicateInBatchCount }

  const existingNames = new Set((existing || []).map(row => normalizeKey(String(row.name))))
  const rows: TablesInsert<'sport_spaces'>[] = candidates
    .filter(item => !existingNames.has(normalizeKey(String(item.name))))
    .map(item => ({
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

  const duplicateCount = duplicateInBatchCount + (candidates.length - rows.length)
  if (rows.length === 0) return { error: 'Todos os espaços válidos já existem na base de dados ou estão duplicados no lote.', invalid, duplicateCount }

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
