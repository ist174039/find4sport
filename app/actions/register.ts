'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function registerProfessionalInitial(
  email: string,
  user_id: string,
  profPayload: any,
  categories: string[],
  qualifications: any[]
) {
  const supabaseAdmin = createAdminClient()

  // Update platform_users type
  const { error: profileError } = await supabaseAdmin
    .from('platform_users')
    .upsert({
      id: user_id,
      full_name: profPayload.full_name,
      type: 'professional',
    })
  if (profileError) return { error: profileError.message }

  // Verify if professional already exists
  const { data: existingProf } = await supabaseAdmin
    .from('professionals')
    .select('id')
    .eq('user_id', user_id)
    .maybeSingle()

  let professionalId = existingProf?.id

  if (professionalId) {
    const { error: profError } = await supabaseAdmin
      .from('professionals')
      .update(profPayload)
      .eq('id', professionalId)
    if (profError) return { error: profError.message }
  } else {
    const { data: newProf, error: profError } = await supabaseAdmin
      .from('professionals')
      .insert(profPayload)
      .select('id')
      .single()
    if (profError) return { error: profError.message }
    professionalId = newProf.id
  }

  // Add categories
  if (categories.length > 0 && professionalId) {
    await supabaseAdmin.from('professional_categories').delete().eq('professional_id', professionalId)
    await supabaseAdmin.from('professional_categories').insert(
      categories.map(catId => ({
        professional_id: professionalId,
        category_id: catId,
      }))
    )
  }

  // Add qualifications
  if (qualifications.length > 0 && professionalId) {
    await supabaseAdmin.from('qualifications').insert(
      qualifications.map(q => ({
        ...q,
        professional_id: professionalId,
        is_verified: false,
      }))
    )
  }

  return { success: true }
}

export async function registerSpaceInitial(
  user_id: string,
  spacePayload: any,
  name: string
) {
  const supabaseAdmin = createAdminClient()
  
  // Update platform_users type
  const { error: profileError } = await supabaseAdmin
    .from('platform_users')
    .upsert({
      id: user_id,
      full_name: name,
      type: 'espaco',
    })
  if (profileError) return { error: profileError.message }

  const { error } = await supabaseAdmin.from('sport_spaces').insert(spacePayload)
  
  if (error) return { error: error.message }
  return { success: true }
}
