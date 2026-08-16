'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

type QualificationInput = { title: string; issuer?: string | null; issue_date?: string | null }
type ProfessionalInput = {
  full_name: string
  professional_name?: string | null
  bio?: string | null
  email?: string | null
  phone?: string | null
  whatsapp?: string | null
  address?: string | null
  website?: string | null
  service_radius_km?: number
  nif?: string | null
  status?: 'pending' | 'active'
  gallery_urls?: string[] | null
}
type SpaceInput = {
  name: string
  description?: string | null
  address: string
  phone?: string | null
  email?: string | null
  website?: string | null
  amenities?: string[]
  status?: 'pending' | 'active'
}

async function requireAuthenticatedUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Utilizador não autenticado')
  return user
}

async function validateCategoryIds(ids: string[], max = 5) {
  const unique = [...new Set(ids.map(String).filter(Boolean))]
  if (!unique.length) throw new Error('Seleciona pelo menos uma modalidade.')
  if (unique.length > max) throw new Error(`Seleciona no máximo ${max} modalidades.`)
  const admin = createAdminClient()
  const { data, error } = await admin.from('categories').select('id').in('id', unique)
  if (error) throw new Error('Não foi possível validar as modalidades.')
  if ((data || []).length !== unique.length) throw new Error('Uma ou mais modalidades selecionadas já não existem.')
  return unique
}

async function manualProfileApprovalEnabled() {
  const admin = createAdminClient()
  const { data } = await admin.from('system_config').select('settings').single()
  return data?.settings?.manual_profile_approval ?? true
}

export async function registerProfessionalInitial(
  _email: string,
  _userIdFromClient: string,
  profPayload: ProfessionalInput,
  categoryIds: string[],
  qualifications: QualificationInput[]
) {
  try {
    const user = await requireAuthenticatedUser()
    const admin = createAdminClient()
    const categories = await validateCategoryIds(categoryIds)
    const cleanQualifications = qualifications.slice(0, 20).map(item => ({
      title: String(item.title || '').trim().slice(0, 180),
      issuer: String(item.issuer || '').trim().slice(0, 180) || null,
      issue_date: item.issue_date || null,
    })).filter(item => item.title)

    const fullName = String(profPayload.full_name || '').trim()
    if (fullName.length < 2 || fullName.length > 160) throw new Error('Indica um nome válido.')
    const safeProfessionalPayload: ProfessionalInput & { user_id: string; email: string | null; is_verified?: boolean } = {
      ...profPayload,
      full_name: fullName,
      user_id: user.id,
      email: user.email ?? profPayload.email ?? null,
    }

    if (!(await manualProfileApprovalEnabled())) {
      safeProfessionalPayload.status = 'active'
      safeProfessionalPayload.is_verified = true
    } else {
      safeProfessionalPayload.status = 'pending'
    }

    const { error: authMetadataError } = await admin.auth.admin.updateUserById(user.id, { user_metadata: { ...user.user_metadata, full_name: fullName, type: 'professional' } })
    if (authMetadataError) return { error: authMetadataError.message }

    const { error: profileError } = await admin.from('platform_users').upsert({ id: user.id, full_name: fullName, type: 'professional' })
    if (profileError) return { error: profileError.message }

    const { data: existingProf } = await admin.from('professionals').select('id').eq('user_id', user.id).maybeSingle()
    let professionalId = existingProf?.id
    if (professionalId) {
      const { error } = await admin.from('professionals').update(safeProfessionalPayload).eq('id', professionalId)
      if (error) return { error: error.message }
    } else {
      const { data, error } = await admin.from('professionals').insert(safeProfessionalPayload).select('id').single()
      if (error || !data) return { error: error?.message || 'Não foi possível criar o perfil profissional.' }
      professionalId = data.id
    }

    const { data: previousCategories } = await admin.from('professional_categories').select('category_id').eq('professional_id', professionalId)
    const { error: deleteCategoriesError } = await admin.from('professional_categories').delete().eq('professional_id', professionalId)
    if (deleteCategoriesError) return { error: deleteCategoriesError.message }
    const { error: categoriesError } = await admin.from('professional_categories').insert(categories.map(categoryId => ({ professional_id: professionalId!, category_id: categoryId })))
    if (categoriesError) {
      if (previousCategories?.length) await admin.from('professional_categories').insert(previousCategories.map(row => ({ professional_id: professionalId!, category_id: row.category_id })))
      return { error: categoriesError.message }
    }

    const { data: previousQualifications } = await admin.from('qualifications').select('title,issuer,issue_date,is_verified').eq('professional_id', professionalId)
    const { error: deleteQualificationsError } = await admin.from('qualifications').delete().eq('professional_id', professionalId)
    if (deleteQualificationsError) return { error: deleteQualificationsError.message }
    if (cleanQualifications.length) {
      const { error } = await admin.from('qualifications').insert(cleanQualifications.map(item => ({ ...item, professional_id: professionalId!, is_verified: false })))
      if (error) {
        if (previousQualifications?.length) await admin.from('qualifications').insert(previousQualifications.map(item => ({ ...item, professional_id: professionalId! })))
        return { error: error.message }
      }
    }

    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Erro ao registar profissional' }
  }
}

export async function registerSpaceInitial(_userIdFromClient: string, spacePayload: SpaceInput, name: string, categoryIds: string[] = []) {
  try {
    const user = await requireAuthenticatedUser()
    const admin = createAdminClient()
    const categories = await validateCategoryIds(categoryIds)
    const cleanName = String(name || spacePayload.name || '').trim()
    if (cleanName.length < 2 || cleanName.length > 180) throw new Error('Indica um nome válido para o espaço.')
    if (String(spacePayload.address || '').trim().length < 5) throw new Error('Indica uma morada válida.')

    const safeSpacePayload: SpaceInput & { created_by: string; owner_user_id: string; email: string | null; is_verified?: boolean } = {
      ...spacePayload,
      name: cleanName,
      created_by: user.id,
      owner_user_id: user.id,
      email: spacePayload.email ?? user.email ?? null,
    }
    if (!(await manualProfileApprovalEnabled())) {
      safeSpacePayload.status = 'active'
      safeSpacePayload.is_verified = true
    } else safeSpacePayload.status = 'pending'

    const { error: authMetadataError } = await admin.auth.admin.updateUserById(user.id, { user_metadata: { ...user.user_metadata, type: 'venue_manager' } })
    if (authMetadataError) return { error: authMetadataError.message }
    const { error: profileError } = await admin.from('platform_users').upsert({ id: user.id, full_name: cleanName, type: 'venue_manager' })
    if (profileError) return { error: profileError.message }

    const { data: existingSpace } = await admin.from('sport_spaces').select('id').eq('owner_user_id', user.id).order('created_at', { ascending: true }).limit(1).maybeSingle()
    let spaceId = existingSpace?.id
    if (spaceId) {
      const { error } = await admin.from('sport_spaces').update(safeSpacePayload).eq('id', spaceId)
      if (error) return { error: error.message }
    } else {
      const { data, error } = await admin.from('sport_spaces').insert(safeSpacePayload).select('id').single()
      if (error || !data) return { error: error?.message || 'Não foi possível criar o espaço.' }
      spaceId = data.id
    }

    const { data: previousCategories } = await admin.from('space_categories').select('category_id').eq('space_id', spaceId)
    const { error: deleteError } = await admin.from('space_categories').delete().eq('space_id', spaceId)
    if (deleteError) return { error: deleteError.message }
    const { error: categoryError } = await admin.from('space_categories').insert(categories.map(categoryId => ({ space_id: spaceId!, category_id: categoryId })))
    if (categoryError) {
      if (previousCategories?.length) await admin.from('space_categories').insert(previousCategories.map(row => ({ space_id: spaceId!, category_id: row.category_id })))
      return { error: categoryError.message }
    }

    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Erro ao registar espaço' }
  }
}
