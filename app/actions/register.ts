'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

async function requireAuthenticatedUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error('Utilizador não autenticado')
  }

  return user
}

export async function registerProfessionalInitial(
  profPayload: any,
  categories: string[],
  qualifications: any[]
) {
  try {
    const user = await requireAuthenticatedUser()
    const supabaseAdmin = createAdminClient()

    const safeProfessionalPayload = {
      ...profPayload,
      user_id: user.id,
      email: user.email ?? profPayload.email ?? null,
    }

    // Get system config for auto-approval
    const { data: configData } = await supabaseAdmin.from('system_config').select('settings').single()
    const manualProfileApproval = configData?.settings?.manual_profile_approval ?? true

    if (!manualProfileApproval) {
      safeProfessionalPayload.status = 'active'
      safeProfessionalPayload.is_verified = true
    }

    // Keep the platform identity bound to the authenticated Supabase user.
    const { error: profileError } = await supabaseAdmin
      .from('platform_users')
      .upsert({
        id: user.id,
        email: user.email ?? null,
        full_name: safeProfessionalPayload.full_name,
        type: 'professional',
      })
    if (profileError) return { error: profileError.message }

    const { data: existingProf } = await supabaseAdmin
      .from('professionals')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    let professionalId = existingProf?.id

    if (professionalId) {
      const { error: profError } = await supabaseAdmin
        .from('professionals')
        .update(safeProfessionalPayload)
        .eq('id', professionalId)
      if (profError) return { error: profError.message }
    } else {
      const { data: newProf, error: profError } = await supabaseAdmin
        .from('professionals')
        .insert(safeProfessionalPayload)
        .select('id')
        .single()
      if (profError) return { error: profError.message }
      professionalId = newProf.id
    }

    if (categories.length > 0 && professionalId) {
      await supabaseAdmin.from('professional_categories').delete().eq('professional_id', professionalId)
      const { error: categoriesError } = await supabaseAdmin.from('professional_categories').insert(
        categories.map((catId) => ({
          professional_id: professionalId,
          category_id: catId,
        }))
      )
      if (categoriesError) return { error: categoriesError.message }
    }

    if (professionalId) {
      await supabaseAdmin.from('qualifications').delete().eq('professional_id', professionalId)
      if (qualifications.length > 0) {
        const { error: qualificationsError } = await supabaseAdmin.from('qualifications').insert(
          qualifications.map((q) => ({
            ...q,
            professional_id: professionalId,
            is_verified: false,
          }))
        )
        if (qualificationsError) return { error: qualificationsError.message }
      }
    }

    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Erro ao registar profissional' }
  }
}

export async function registerSpaceInitial(
  spacePayload: any,
  name: string
) {
  try {
    const user = await requireAuthenticatedUser()
    const supabaseAdmin = createAdminClient()

    const safeSpacePayload = {
      ...spacePayload,
      created_by: user.id,
      owner_user_id: user.id,
      email: spacePayload.email ?? user.email ?? null,
    }

    // Get system config for auto-approval
    const { data: configData } = await supabaseAdmin.from('system_config').select('settings').single()
    const manualProfileApproval = configData?.settings?.manual_profile_approval ?? true

    if (!manualProfileApproval) {
      safeSpacePayload.status = 'active'
      safeSpacePayload.is_verified = true
    }

    const { error: profileError } = await supabaseAdmin
      .from('platform_users')
      .upsert({
        id: user.id,
        email: user.email ?? null,
        full_name: name,
        type: 'venue_manager',
      })
    if (profileError) return { error: profileError.message }

    const { data: existingSpace } = await supabaseAdmin
      .from('sport_spaces')
      .select('id')
      .eq('owner_user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (existingSpace) {
      const { error: spaceError } = await supabaseAdmin
        .from('sport_spaces')
        .update(safeSpacePayload)
        .eq('id', existingSpace.id)
      if (spaceError) return { error: spaceError.message }
    } else {
      const { error: spaceError } = await supabaseAdmin.from('sport_spaces').insert(safeSpacePayload)
      if (spaceError) return { error: spaceError.message }
    }

    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Erro ao registar espaço' }
  }
}
