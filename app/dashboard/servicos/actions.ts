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

const PRICE_UNITS = new Set(['sessao', 'hora', 'mes', 'pack'])
const MODALITIES = new Set(['presencial', 'online', 'ambos'])

function validateInput(input: ServiceInput) {
  const name = input.name.trim()
  if (!name) throw new Error('O nome do serviço é obrigatório.')
  if (name.length > 120) throw new Error('O nome do serviço é demasiado longo.')
  const description = input.description?.trim() || null
  if (description && description.length > 2000) throw new Error('A descrição não pode exceder 2000 caracteres.')
  const duration = Number(input.duration_minutes)
  if (!Number.isInteger(duration) || duration < 15 || duration > 480) throw new Error('A duração deve estar entre 15 e 480 minutos.')
  const price = input.price === null || input.price === undefined ? null : Number(input.price)
  if (price !== null && (!Number.isFinite(price) || price < 0 || price > 100000)) throw new Error('Preço inválido.')
  if (!PRICE_UNITS.has(input.price_unit)) throw new Error('Unidade de preço inválida.')
  if (!MODALITIES.has(input.modality)) throw new Error('Modalidade inválida.')
  return { name, description, duration_minutes: duration, price, price_unit: input.price_unit, modality: input.modality }
}

async function requireProfessional() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Sessão inválida')

  const admin = createAdminClient()
  const { data: platformUser } = await admin.from('platform_users').select('type').eq('id', user.id).maybeSingle()
  if (platformUser?.type !== 'professional') throw new Error('Apenas profissionais podem gerir serviços')

  const { data: professional } = await admin.from('professionals').select('id,status,is_verified').eq('user_id', user.id).maybeSingle()
  if (!professional) throw new Error('Perfil profissional não encontrado')
  return { user, admin, professionalId: professional.id as string, professional }
}

export async function createService(input: ServiceInput) {
  const { user, admin, professionalId } = await requireProfessional()
  const clean = validateInput(input)
  const limit = await getLimit(user.id, 'services.max')

  if (limit !== null) {
    const { count, error: countError } = await admin.from('services').select('id', { count: 'exact', head: true }).eq('professional_id', professionalId)
    if (countError) throw countError
    if ((count ?? 0) >= limit) throw new Error(`Atingiu o limite de ${limit} serviços do seu plano`)
  }

  const { data, error } = await admin.from('services').insert({ professional_id: professionalId, ...clean, is_active: true }).select().single()
  if (error) throw error
  revalidatePath('/dashboard/servicos')
  revalidatePath('/profissionais')
  return data
}

export async function updateService(serviceId: string, input: ServiceInput) {
  const { admin, professionalId } = await requireProfessional()
  const clean = validateInput(input)
  const { data, error } = await admin.from('services').update(clean).eq('id', serviceId).eq('professional_id', professionalId).select().single()
  if (error) throw error
  revalidatePath('/dashboard/servicos')
  revalidatePath('/profissionais')
  return data
}

export async function toggleServiceActive(serviceId: string, isActive: boolean) {
  const { admin, professionalId } = await requireProfessional()
  const { data, error } = await admin.from('services').update({ is_active: Boolean(isActive) }).eq('id', serviceId).eq('professional_id', professionalId).select().single()
  if (error) throw error
  revalidatePath('/dashboard/servicos')
  revalidatePath('/profissionais')
  return data
}

export async function deleteService(serviceId: string) {
  const { admin, professionalId } = await requireProfessional()
  const { error } = await admin.from('services').delete().eq('id', serviceId).eq('professional_id', professionalId)
  if (error) {
    if ((error as any).code === '23503') throw new Error('Este serviço possui dados associados e não pode ser eliminado. Desative-o em vez disso.')
    throw error
  }
  revalidatePath('/dashboard/servicos')
  revalidatePath('/profissionais')
}
