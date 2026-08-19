'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { TablesUpdate } from '@/lib/supabase-types'

async function geocodeAddress(address: string) {
  const value = address.trim()
  if (value.length < 4) return null
  try {
    const url = new URL('https://nominatim.openstreetmap.org/search')
    url.searchParams.set('q', value)
    url.searchParams.set('format', 'jsonv2')
    url.searchParams.set('limit', '1')
    url.searchParams.set('countrycodes', 'pt,es')
    const response = await fetch(url, { headers: { 'User-Agent': 'Find4Sport/1.0', 'Accept-Language': 'pt-PT,pt;q=0.9' }, cache: 'no-store', signal: AbortSignal.timeout(5000) })
    if (!response.ok) return null
    const rows = await response.json() as Array<{ lat?: string; lon?: string }>
    const latitude = Number(rows?.[0]?.lat), longitude = Number(rows?.[0]?.lon)
    return Number.isFinite(latitude) && Number.isFinite(longitude) ? { latitude, longitude } : null
  } catch { return null }
}

async function requireVenueManager() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Autenticação necessária.')
  const admin = createAdminClient()
  const { data: profile } = await admin.from('platform_users').select('type').eq('id', user.id).maybeSingle()
  if (profile?.type !== 'venue_manager') throw new Error('Apenas gestores de espaço podem executar esta ação.')
  return { user, admin }
}

export async function updateManagedSpaceAction(spaceId: string, input: { name: string; description?: string; email?: string; phone?: string; website?: string; address?: string; amenities?: string[] }) {
  const { user, admin } = await requireVenueManager()
  const name = input.name.trim()
  if (!spaceId || !name) throw new Error('Nome e espaço são obrigatórios.')
  if (name.length > 160) throw new Error('O nome é demasiado longo.')
  const description = input.description?.trim() || null
  if (description && description.length > 5000) throw new Error('A descrição não pode exceder 5000 caracteres.')
  const website = input.website?.trim() || null
  if (website) { try { new URL(website) } catch { throw new Error('Website inválido.') } }
  const amenities = (input.amenities || []).map(item => item.trim()).filter(Boolean).slice(0, 100)
  const address = input.address?.trim() || ''
  const coordinates = address ? await geocodeAddress(address) : null
  const patch: TablesUpdate<'sport_spaces'> = { name, description, email: input.email?.trim() || null, phone: input.phone?.trim() || null, website, address: address || null, amenities, updated_at: new Date().toISOString() }
  if (coordinates) { patch.latitude = coordinates.latitude; patch.longitude = coordinates.longitude }
  else if (!address) { patch.latitude = null; patch.longitude = null }

  const { data, error } = await admin.from('sport_spaces').update(patch).eq('id', spaceId).eq('owner_user_id', user.id).select('*').single()
  if (error) throw new Error('Não foi possível guardar o espaço.')
  revalidatePath('/dashboard/espaco'); revalidatePath(`/espacos/${data.slug || data.id}`); revalidatePath('/espacos'); revalidatePath('/pesquisa'); revalidatePath('/')
  return data
}

export async function searchUnclaimedSpacesAction(query: string) {
  const { admin } = await requireVenueManager()
  const clean = query.trim().slice(0, 120)
  let db = admin.from('sport_spaces').select('id,name,address').is('owner_user_id', null).order('created_at', { ascending: false }).limit(8)
  if (clean) db = db.ilike('name', `%${clean}%`)
  const { data, error } = await db
  if (error) throw new Error('Não foi possível pesquisar espaços sem gestor.')
  return data || []
}

export async function submitSpaceClaimAction(spaceId: string, message: string) {
  const { user, admin } = await requireVenueManager()
  const cleanMessage = message.trim()
  if (!spaceId) throw new Error('Espaço inválido.')
  if (cleanMessage.length < 20) throw new Error('Explique a sua relação com o espaço com pelo menos 20 caracteres.')
  if (cleanMessage.length > 3000) throw new Error('A justificação não pode exceder 3000 caracteres.')
  const { data: space } = await admin.from('sport_spaces').select('id,owner_user_id,name').eq('id', spaceId).maybeSingle()
  if (!space || space.owner_user_id) throw new Error('Este espaço já tem gestor ou deixou de estar disponível para reivindicação.')
  const { data: pending } = await admin.from('space_claims').select('id').eq('space_id', spaceId).eq('user_id', user.id).eq('status', 'pending').maybeSingle()
  if (pending) throw new Error('Já existe uma reivindicação pendente sua para este espaço.')
  const { data, error } = await admin.from('space_claims').insert({ space_id: spaceId, user_id: user.id, message: cleanMessage, documents_url: null, status: 'pending' }).select('id,status,created_at').single()
  if (error) throw new Error('Não foi possível submeter a reivindicação.')
  revalidatePath('/dashboard/espaco'); revalidatePath('/admin/reivindicacoes')
  return data
}