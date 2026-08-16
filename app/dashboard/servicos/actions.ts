'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getLimit } from '@/lib/billing/entitlements'

type ServiceInput = {
  name: string
  description?: string | null
  duration_minutes: number
  price?: number | null
  price_unit: string
  modality: string
}

async function requireProfessional() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Sessão inválida')

  const admin = createAdminClient()
  const { data: platformUser } = await admin
    .from('platform_users')
    .select('type')
    .eq('id', user.id)
    .maybeSingle()

  if (platformUser?.type !== 'professional') throw new Error('Apenas profissionais podem gerir serviços')

  const { data: professional } = await admin
    .from('professionals')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!professional) throw new Error('Perfil profissional não encontrado')
  return { user, admin, professionalId: professional.id as string }
}

export async function createService(input: ServiceInput) {
  const { user, admin, professionalId } = await requireProfessional()
  const limit = await getLimit(user.id, 'services.max')

  if (limit !== null) {
    const { count, error: countError } = await admin
      .from('services')
      .select('id', { count: 'exact', head: true })
      .eq('professional_id', professionalId)

    if (countError) throw countError
    if ((count ?? 0) >= limit) throw new Error(`Atingiu o limite de ${limit} serviços do seu plano`)
  }

  const { data, error } = await admin
    .from('services')
    .insert({
      professional_id: professionalId,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      duration_minutes: input.duration_minutes,
      price: input.price ?? null,
      price_unit: input.price_unit,
      modality: input.modality,
      is_active: true,
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/servicos')
  return data
}

export async function updateService(serviceId: string, input: ServiceInput) {
  const { admin, professionalId } = await requireProfessional()
  const { data, error } = await admin
    .from('services')
    .update({
      name: input.name.trim(),
      description: input.description?.trim() || null,
      duration_minutes: input.duration_minutes,
      price: input.price ?? null,
      price_unit: input.price_unit,
      modality: input.modality,
    })
    .eq('id', serviceId)
    .eq('professional_id', professionalId)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/servicos')
  return data
}

export async function deleteService(serviceId: string) {
  const { admin, professionalId } = await requireProfessional()
  const { error } = await admin
    .from('services')
    .delete()
    .eq('id', serviceId)
    .eq('professional_id', professionalId)

  if (error) throw error
  revalidatePath('/dashboard/servicos')
}
