'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess } from '@/lib/auth/access'
import type { TablesUpdate } from '@/lib/supabase-types'

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

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

async function requireProfileUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Sessão inválida.')
  const access = await resolveSessionAccess(supabase, user)
  if (!access?.role) throw new Error('Perfil de plataforma não encontrado.')
  return { user, access, supabase, admin: createAdminClient() }
}

export async function updateProfileAction(formData: FormData) {
  const { user, access, supabase, admin } = await requireProfileUser()
  const fullName = String(formData.get('full_name') || '').trim()
  const location = String(formData.get('location') || '').trim()
  const language = String(formData.get('language') || 'pt').trim() || 'pt'
  const phone = String(formData.get('phone') || '').trim()
  const nif = String(formData.get('nif') || '').trim()
  if (fullName.length < 2 || fullName.length > 120) throw new Error('Indique um nome válido.')

  const { error: platformError } = await admin.from('platform_users').update({ full_name: fullName, location: location || null, language }).eq('id', user.id)
  if (platformError) throw platformError

  if (access.role === 'professional') {
    const professionalName = String(formData.get('professional_name') || '').trim()
    const bio = String(formData.get('bio') || '').trim()
    const whatsapp = String(formData.get('whatsapp') || '').trim()
    const address = String(formData.get('address') || '').trim()
    const website = String(formData.get('website') || '').trim()
    const serviceRadius = Number(formData.get('service_radius_km') || 10)
    const categoryIds = [...new Set(formData.getAll('category_ids').map(String).filter(Boolean))].slice(0, 5)
    const coordinates = address ? await geocodeAddress(address) : null
    const professionalPatch: TablesUpdate<'professionals'> = { full_name: fullName, professional_name: professionalName || fullName, bio: bio || null, phone: phone || null, whatsapp: whatsapp || null, address: address || null, website: website || null, service_radius_km: Number.isFinite(serviceRadius) ? Math.min(Math.max(serviceRadius, 1), 200) : 10, updated_at: new Date().toISOString() }
    if (coordinates) { professionalPatch.latitude = coordinates.latitude; professionalPatch.longitude = coordinates.longitude }
    else if (!address) { professionalPatch.latitude = null; professionalPatch.longitude = null }

    const { data: professional, error: professionalError } = await admin.from('professionals').update(professionalPatch).eq('user_id', user.id).select('id').single()
    if (professionalError) throw professionalError
    const { data: validCategories } = categoryIds.length ? await admin.from('categories').select('id').in('id', categoryIds) : { data: [] }
    const validIds = (validCategories || []).map(row => row.id)
    await admin.from('professional_categories').delete().eq('professional_id', professional.id)
    if (validIds.length) {
      const { error: categoryError } = await admin.from('professional_categories').insert(validIds.map(categoryId => ({ professional_id: professional.id, category_id: categoryId })))
      if (categoryError) throw categoryError
    }
  }

  const { error: authError } = await supabase.auth.updateUser({ data: { full_name: fullName, phone: phone || null, nif: nif || null } })
  if (authError) throw authError
  revalidatePath('/dashboard/perfil'); revalidatePath('/dashboard'); revalidatePath('/profissionais'); revalidatePath('/pesquisa')
}

async function uploadProfileImage(kind: 'avatar' | 'banner', formData: FormData) {
  const { user, access, supabase, admin } = await requireProfileUser()
  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) throw new Error('Selecione uma imagem.')
  if (!IMAGE_TYPES.has(file.type)) throw new Error('Use uma imagem JPEG, PNG ou WebP.')
  if (file.size > 5 * 1024 * 1024) throw new Error('A imagem não pode exceder 5 MB.')
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${user.id}/profile/${kind}-${crypto.randomUUID()}.${extension}`
  const bytes = new Uint8Array(await file.arrayBuffer())
  const { error: uploadError } = await admin.storage.from('avatars').upload(path, bytes, { contentType: file.type, upsert: false })
  if (uploadError) throw uploadError
  const publicUrl = admin.storage.from('avatars').getPublicUrl(path).data.publicUrl
  const platformPatch = kind === 'avatar' ? { avatar_url: publicUrl } : { banner_url: publicUrl }
  const { error: platformError } = await admin.from('platform_users').update(platformPatch).eq('id', user.id)
  if (platformError) { await admin.storage.from('avatars').remove([path]); throw platformError }
  if (access.role === 'professional') {
    const professionalPatch = kind === 'avatar' ? { avatar_url: publicUrl } : { cover_url: publicUrl }
    const { error } = await admin.from('professionals').update(professionalPatch).eq('user_id', user.id)
    if (error) throw error
  }
  if (kind === 'avatar') await supabase.auth.updateUser({ data: { avatar_url: publicUrl } })
  revalidatePath('/dashboard/perfil'); revalidatePath('/dashboard')
  return publicUrl
}

export async function uploadAvatarAction(formData: FormData): Promise<void> { await uploadProfileImage('avatar', formData) }
export async function uploadBannerAction(formData: FormData): Promise<void> { await uploadProfileImage('banner', formData) }
