'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess } from '@/lib/auth/access'
import { requireFeature } from '@/lib/billing/entitlements'

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_IMAGE_BYTES = 8 * 1024 * 1024
const MAX_GALLERY_FILES = 12

function text(formData: FormData, key: string, max: number) {
  return String(formData.get(key) || '').trim().slice(0, max)
}

function optionalNumber(formData: FormData, key: string) {
  const raw = text(formData, key, 30)
  if (!raw) return null
  const value = Number(raw)
  if (!Number.isFinite(value) || value < 0) throw new Error(`Valor inválido em ${key}.`)
  return value
}

function validateDate(value: string, label: string) {
  const date = new Date(value)
  if (!value || Number.isNaN(date.getTime())) throw new Error(`${label} inválida.`)
  return date
}

async function uploadImage(admin: ReturnType<typeof createAdminClient>, userId: string, eventFolderId: string, file: File, prefix: string) {
  if (!IMAGE_TYPES.has(file.type)) throw new Error('As imagens devem ser JPEG, PNG ou WebP.')
  if (file.size > MAX_IMAGE_BYTES) throw new Error('Cada imagem pode ter no máximo 8 MB.')
  const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
  const path = `${userId}/${eventFolderId}/${prefix}-${crypto.randomUUID()}.${extension}`
  const { error } = await admin.storage.from('events').upload(path, file, { contentType: file.type, cacheControl: '3600', upsert: false })
  if (error) throw new Error(error.message)
  const { data } = admin.storage.from('events').getPublicUrl(path)
  return { path, url: data.publicUrl }
}

export async function createEventAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Autenticação necessária.')

  const access = await resolveSessionAccess(supabase, user)
  if (!access || !['professional', 'venue_manager'].includes(access.role)) throw new Error('Apenas profissionais e gestores de espaço podem criar eventos.')
  await requireFeature(user.id, 'events.create.enabled')

  const title = text(formData, 'title', 180)
  if (!title) throw new Error('O título é obrigatório.')
  const description = text(formData, 'description', 5000) || null
  const categoryId = text(formData, 'category_id', 60) || null
  const address = text(formData, 'address', 300) || null
  const startDate = validateDate(text(formData, 'start_date', 80), 'Data de início')
  const endRaw = text(formData, 'end_date', 80)
  const endDate = endRaw ? validateDate(endRaw, 'Data de fim') : null
  if (endDate && endDate <= startDate) throw new Error('A data de fim tem de ser posterior à data de início.')
  const capacity = optionalNumber(formData, 'capacity')
  if (capacity !== null && (!Number.isInteger(capacity) || capacity < 1 || capacity > 100000)) throw new Error('Capacidade inválida.')
  const priceMin = optionalNumber(formData, 'price_min')
  const priceMax = optionalNumber(formData, 'price_max')
  if (priceMin !== null && priceMax !== null && priceMax < priceMin) throw new Error('O preço máximo não pode ser inferior ao preço mínimo.')

  const admin = createAdminClient()
  let organizerName = user.user_metadata?.full_name || 'Organizador'
  let professionalId: string | null = null

  if (access.role === 'professional') {
    const { data: professional } = await admin.from('professionals').select('id,full_name,professional_name,status').eq('user_id', user.id).maybeSingle()
    if (!professional) throw new Error('Perfil profissional não encontrado.')
    if (professional.status !== 'active') throw new Error('O perfil profissional tem de estar ativo para criar eventos.')
    professionalId = professional.id
    organizerName = professional.professional_name || professional.full_name || organizerName
  } else {
    const { data: space } = await admin.from('sport_spaces').select('id,name,status').eq('owner_user_id', user.id).order('created_at', { ascending: true }).limit(1).maybeSingle()
    if (!space) throw new Error('Não existe um espaço associado a esta conta.')
    organizerName = space.name || organizerName
  }

  if (categoryId) {
    const { data: category } = await admin.from('categories').select('id').eq('id', categoryId).maybeSingle()
    if (!category) throw new Error('Modalidade inválida.')
  }

  const { data: configData } = await admin.from('system_config').select('settings').maybeSingle()
  const manualApproval = configData?.settings?.manual_profile_approval ?? true
  const status = manualApproval ? 'pending' : 'published'

  const banner = formData.get('banner')
  const gallery = formData.getAll('gallery').filter((value): value is File => value instanceof File && value.size > 0)
  if (gallery.length > MAX_GALLERY_FILES) throw new Error(`A galeria pode ter no máximo ${MAX_GALLERY_FILES} imagens.`)

  const folderId = crypto.randomUUID()
  const uploaded: Array<{ path: string; url: string }> = []
  try {
    let imageUrl: string | null = null
    if (banner instanceof File && banner.size > 0) {
      const item = await uploadImage(admin, user.id, folderId, banner, 'banner')
      uploaded.push(item)
      imageUrl = item.url
    }
    for (const file of gallery) uploaded.push(await uploadImage(admin, user.id, folderId, file, 'gallery'))
    const galleryUrls = uploaded.filter(item => item.url !== imageUrl).map(item => item.url)

    const { data: event, error } = await admin.from('events').insert({
      title,
      description,
      category_id: categoryId,
      address,
      start_date: startDate.toISOString(),
      end_date: endDate?.toISOString() || null,
      capacity,
      price_min: priceMin,
      price_max: priceMax,
      image_url: imageUrl,
      gallery_urls: galleryUrls.length ? galleryUrls : null,
      created_by: user.id,
      professional_id: professionalId,
      organizer_name: organizerName,
      status,
    }).select('id').single()

    if (error || !event) throw new Error(error?.message || 'Não foi possível criar o evento.')
    revalidatePath('/dashboard/eventos')
    revalidatePath('/eventos')
    return { success: true, eventId: event.id, status }
  } catch (error) {
    if (uploaded.length) await admin.storage.from('events').remove(uploaded.map(item => item.path))
    throw error
  }
}
